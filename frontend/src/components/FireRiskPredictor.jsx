import React, { useState } from 'react';
import axios from 'axios';
import { Flame, Sliders, Zap, MapPin, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';

const PRESETS = [
  {
    name: "California Wildfire Complex",
    latitude: 38.5816,
    longitude: -121.4944,
    bright_ti4: 365.2,
    bright_ti5: 308.5,
    frp: 145.8,
    confidence: "high"
  },
  {
    name: "Amazon Deforestation Burn",
    latitude: -8.7612,
    longitude: -63.9039,
    bright_ti4: 348.0,
    bright_ti5: 301.5,
    frp: 88.4,
    confidence: "nominal"
  },
  {
    name: "Australian Bushfire Event",
    latitude: -33.8688,
    longitude: 151.2093,
    bright_ti4: 372.0,
    bright_ti5: 312.0,
    frp: 210.5,
    confidence: "high"
  },
  {
    name: "Siberian Boreal Forest Fire",
    latitude: 62.0355,
    longitude: 129.6755,
    bright_ti4: 332.1,
    bright_ti5: 294.0,
    frp: 35.2,
    confidence: "nominal"
  },
  {
    name: "Cool Surface Noise / Non-Fire",
    latitude: 45.5017,
    longitude: -73.5673,
    bright_ti4: 301.2,
    bright_ti5: 288.4,
    frp: 2.1,
    confidence: "low"
  }
];

const RISK_BADGES = {
  Low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  Medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  High: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  Extreme: 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
};

export default function FireRiskPredictor({ onSelectPreset }) {
  const [formData, setFormData] = useState(PRESETS[0]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'confidence' ? value : parseFloat(value) || value
    }));
  };

  const handleApplyPreset = (preset) => {
    setFormData(preset);
    if (onSelectPreset) onSelectPreset(preset);
  };

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('/api/predict', formData);
      setPrediction(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to execute inference prediction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Form: Parameter Controls & Hotspot Presets */}
      <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-orange-400" /> Interactive Predictor Input
          </h3>
          <span className="text-xs text-slate-400 font-mono">VIIRS Satellite Parameters</span>
        </div>

        {/* Hotspot Presets Selection */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-orange-400" /> Hotspot Preset Locations
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`px-3 py-2 text-xs text-left rounded-xl transition-all border flex items-center justify-between ${
                  formData.name === preset.name
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 font-semibold'
                    : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>{preset.name}</span>
                <span className="font-mono text-[10px] text-slate-400">{preset.latitude}°, {preset.longitude}°</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handlePredict} className="space-y-4 pt-2">
          {/* Latitude & Longitude */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div>
              <label className="text-slate-400 mb-1 block font-sans">Latitude (-90 to 90)</label>
              <input
                type="number"
                step="0.0001"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-slate-400 mb-1 block font-sans">Longitude (-180 to 180)</label>
              <input
                type="number"
                step="0.0001"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Brightness Temp I4 */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="text-slate-300">Brightness Temp I4 (Kelvin)</label>
              <span className="font-mono text-orange-400">{formData.bright_ti4} K</span>
            </div>
            <input
              type="range"
              min="290"
              max="380"
              step="0.1"
              name="bright_ti4"
              value={formData.bright_ti4}
              onChange={handleChange}
              className="w-full accent-orange-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Brightness Temp I5 */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="text-slate-300">Brightness Temp I5 (Kelvin)</label>
              <span className="font-mono text-sky-400">{formData.bright_ti5} K</span>
            </div>
            <input
              type="range"
              min="270"
              max="330"
              step="0.1"
              name="bright_ti5"
              value={formData.bright_ti5}
              onChange={handleChange}
              className="w-full accent-sky-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Fire Radiative Power (FRP) */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="text-slate-300">Fire Radiative Power (MW)</label>
              <span className="font-mono text-rose-400">{formData.frp} MW</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="0.5"
              name="frp"
              value={formData.frp}
              onChange={handleChange}
              className="w-full accent-rose-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Confidence */}
          <div>
            <label className="text-xs text-slate-300 mb-1 block">Detection Confidence</label>
            <select
              name="confidence"
              value={formData.confidence}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              <option value="low">Low (33%)</option>
              <option value="nominal">Nominal (66%)</option>
              <option value="high">High (100%)</option>
            </select>
          </div>

          {/* Predict Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">Running ML Inference...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Run Multi-Model Risk Inference
              </>
            )}
          </button>
        </form>
      </div>

      {/* Right Container: Inference Results across Random Forest, XGBoost, LightGBM, ANN */}
      <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" /> Multi-Model Inference Output
          </h3>
          <span className="text-xs text-slate-400 font-mono">Random Forest | XGBoost | LightGBM | ANN</span>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/60 border border-rose-500/40 text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" /> {error}
          </div>
        )}

        {!prediction && !loading && (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Flame className="w-12 h-12 mx-auto text-slate-700 animate-pulse" />
            <p className="text-sm font-medium">Select a hotspot preset or adjust the parameters and click "Run Multi-Model Risk Inference".</p>
          </div>
        )}

        {prediction && (
          <div className="space-y-6">
            {/* Ensemble Consensus Banner */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Ensemble Consensus Fire Risk</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-3.5 py-1 text-lg font-bold rounded-xl border ${RISK_BADGES[prediction.consensus_risk]}`}>
                    {prediction.consensus_risk} Fire Risk
                  </span>
                </div>
              </div>

              {/* Ensemble Probability Distribution */}
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Average Probabilities</span>
                <div className="flex gap-2 text-xs font-mono">
                  {Object.entries(prediction.ensemble_probabilities).map(([cls, prob]) => (
                    <div key={cls} className="text-center">
                      <span className="text-[10px] text-slate-500 block">{cls}</span>
                      <span className="font-bold text-slate-200">{(prob * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Individual Model Predictions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(prediction.model_predictions).map(([modelName, mResult]) => (
                <div 
                  key={modelName}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 font-mono"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-200 font-sans">{modelName}</span>
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg border ${RISK_BADGES[mResult.predicted_class]}`}>
                      {mResult.predicted_class}
                    </span>
                  </div>

                  {/* Probabilities Bars */}
                  <div className="space-y-1.5 pt-1 text-[11px]">
                    {Object.entries(mResult.probabilities).map(([cName, pVal]) => (
                      <div key={cName} className="space-y-0.5">
                        <div className="flex justify-between text-slate-400">
                          <span>{cName}</span>
                          <span>{(pVal * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              cName === 'Extreme' ? 'bg-rose-500' :
                              cName === 'High' ? 'bg-orange-500' :
                              cName === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${pVal * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
