import React, { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
import { Flame, Eye, RefreshCw, Filter, Layers, Zap } from 'lucide-react';

const RISK_COLORS = {
  Low: '#22c55e',      // Green
  Medium: '#eab308',   // Yellow
  High: '#f97316',     // Orange
  Extreme: '#ef4444'   // Red
};

export default function InteractiveGlobe({ points = [], selectedPreset, onSelectPoint }) {
  const globeContainerRef = useRef(null);
  const globeInstanceRef = useRef(null);
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Filter points based on user selected risk level
  const filteredPoints = points.filter(p => {
    if (filterRisk === 'ALL') return true;
    return p.risk_level.toUpperCase() === filterRisk.toUpperCase();
  });

  useEffect(() => {
    if (!globeContainerRef.current) return;

    // Initialize 3D Globe
    const globe = Globe()(globeContainerRef.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .showAtmosphere(true)
      .atmosphereColor('#3a86ff')
      .atmosphereAltitude(0.25)
      
      // Fire Points / Rings
      .pointsData([])
      .pointLat('lat')
      .pointLng('lng')
      .pointColor(d => RISK_COLORS[d.risk_level] || '#ef4444')
      .pointAltitude(d => Math.min(d.frp / 250.0, 0.45) + 0.02)
      .pointRadius(d => Math.max(d.frp / 60.0, 0.25))
      .pointResolution(16)

      // Arcs & Pulse effects for High/Extreme Risk fires
      .arcsData([])
      .arcColor(d => ['#f97316', '#ef4444'])
      .arcDashLength(0.4)
      .arcDashGap(0.2)
      .arcDashAnimateTime(1500)
      .arcStroke(0.5)

      // Hover Tooltip Callback
      .onPointHover(point => {
        setHoveredPoint(point);
      })
      .onPointClick(point => {
        if (onSelectPoint) onSelectPoint(point);
      });

    // Auto rotate setup
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.6;
    globe.controls().enableZoom = true;

    // Initial camera position (centered over Pacific/Americas)
    globe.pointOfView({ lat: 20, lng: 0, altitude: 2.2 }, 1000);

    globeInstanceRef.current = globe;

    const handleResize = () => {
      if (globeContainerRef.current && globeInstanceRef.current) {
        const width = globeContainerRef.current.clientWidth;
        const height = globeContainerRef.current.clientHeight;
        globeInstanceRef.current.width(width).height(height);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (globeContainerRef.current) {
        globeContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  // Update Points Data when dataset or filters change
  useEffect(() => {
    if (!globeInstanceRef.current) return;
    
    globeInstanceRef.current.pointsData(filteredPoints);

    // Generate glowing arcs connecting high risk clusters
    const extremeFires = filteredPoints.filter(p => p.risk_level === 'Extreme' || p.risk_level === 'High');
    const arcs = [];
    for (let i = 0; i < Math.min(extremeFires.length, 30); i += 2) {
      if (i + 1 < extremeFires.length) {
        arcs.push({
          startLat: extremeFires[i].lat,
          startLng: extremeFires[i].lng,
          endLat: extremeFires[i + 1].lat,
          endLng: extremeFires[i + 1].lng
        });
      }
    }
    globeInstanceRef.current.arcsData(arcs);
  }, [filteredPoints]);

  // Handle Preset Jump (e.g. California, Amazon, Australia)
  useEffect(() => {
    if (selectedPreset && globeInstanceRef.current) {
      globeInstanceRef.current.pointOfView({
        lat: selectedPreset.latitude,
        lng: selectedPreset.longitude,
        altitude: 1.5
      }, 1800);
    }
  }, [selectedPreset]);

  // Handle Auto Rotate Toggle
  const toggleAutoRotate = () => {
    if (globeInstanceRef.current) {
      const next = !autoRotate;
      globeInstanceRef.current.controls().autoRotate = next;
      setAutoRotate(next);
    }
  };

  const resetView = () => {
    if (globeInstanceRef.current) {
      globeInstanceRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.2 }, 1500);
    }
  };

  return (
    <div className="relative w-full h-[650px] rounded-2xl overflow-hidden glass-panel border border-slate-800 shadow-2xl">
      {/* 3D Globe Canvas Container */}
      <div ref={globeContainerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Header Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/60 shadow-lg">
        <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg animate-pulse">
          <Flame className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white tracking-wide">3D Active Fire & Risk Globe</h2>
          <p className="text-xs text-slate-400">NASA VIIRS Satellite Observations ({filteredPoints.length} Hotspots)</p>
        </div>
      </div>

      {/* Controls Overlay (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 pb-1 border-b border-slate-800">
          <Filter className="w-3.5 h-3.5 text-orange-400" /> Filter Risk Level
        </div>
        
        <div className="grid grid-cols-5 gap-1 pt-1">
          {['ALL', 'Low', 'Medium', 'High', 'Extreme'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilterRisk(lvl)}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all ${
                filterRisk === lvl
                  ? 'bg-orange-500 text-white shadow-md font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <button
            onClick={toggleAutoRotate}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              autoRotate 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            {autoRotate ? 'Rotate ON' : 'Rotate OFF'}
          </button>

          <button
            onClick={resetView}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" /> Reset View
          </button>
        </div>
      </div>

      {/* Legend Overlay (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-700/60 shadow-lg text-xs space-y-2">
        <div className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-orange-400" /> Fire Risk Classification Legend
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          {Object.entries(RISK_COLORS).map(([label, color]) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full shadow" style={{ backgroundColor: color }} />
              <span className="text-slate-300 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hover Info Tooltip (Bottom Right) */}
      {hoveredPoint && (
        <div className="absolute bottom-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-orange-500/40 shadow-2xl max-w-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="font-semibold text-sm text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-orange-400" /> Satellite Detection
            </span>
            <span 
              className="px-2 py-0.5 text-[10px] uppercase font-bold rounded text-white"
              style={{ backgroundColor: RISK_COLORS[hoveredPoint.risk_level] || '#ef4444' }}
            >
              {hoveredPoint.risk_level} Risk
            </span>
          </div>

          <div className="grid grid-cols-2 gap-[6px] text-xs font-mono text-slate-300">
            <div>Latitude: <span className="text-white">{hoveredPoint.lat}°</span></div>
            <div>Longitude: <span className="text-white">{hoveredPoint.lng}°</span></div>
            <div>Bright Ti4: <span className="text-orange-300">{hoveredPoint.bright_ti4} K</span></div>
            <div>FRP Power: <span className="text-red-400">{hoveredPoint.frp} MW</span></div>
            <div>Confidence: <span className="text-emerald-400 capitalize">{hoveredPoint.confidence}</span></div>
            <div>Satellite: <span className="text-sky-300">{hoveredPoint.satellite}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
