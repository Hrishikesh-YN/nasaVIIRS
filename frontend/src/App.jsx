import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Globe, BarChart2, Sliders, Database, Flame, Activity, RefreshCcw, Layers, ShieldCheck, CheckCircle2 
} from 'lucide-react';

import InteractiveGlobe from './components/InteractiveGlobe';
import ModelEvaluationDashboard from './components/ModelEvaluationDashboard';
import FireRiskPredictor from './components/FireRiskPredictor';
import DataPipelineInspector from './components/DataPipelineInspector';

export default function App() {
  const [activeTab, setActiveTab] = useState('globe');
  const [globePoints, setGlobePoints] = useState([]);
  const [evaluationData, setEvaluationData] = useState(null);
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState(null);

  const fetchBackendData = async () => {
    setLoading(true);
    setBackendError(null);
    try {
      // 1. Fetch Globe Points
      const pointsRes = await axios.get('/api/data/globe-points?limit=1500');
      setGlobePoints(pointsRes.data.points || []);

      // 2. Fetch Model Evaluation Metrics
      const evalRes = await axios.get('/api/models/evaluation');
      setEvaluationData(evalRes.data);

      // 3. Fetch Pipeline Status
      const statusRes = await axios.get('/api/pipeline/status');
      setPipelineStatus(statusRes.data);
    } catch (err) {
      console.error("Backend connection error:", err);
      setBackendError("Could not connect to FastAPI server. Please verify backend service is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setActiveTab('globe');
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#0c1019]/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-orange-600 to-amber-500 text-white rounded-xl shadow-lg shadow-orange-500/20">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">NASA VIIRS Fire Risk ML System</h1>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-orange-500/20 text-orange-400 rounded border border-orange-500/30">
                v1.0 ML Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-400">Random Forest • XGBoost • LightGBM • ANN • 3D Globe</p>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          {[
            { id: 'globe', label: '3D Interactive Globe', icon: Globe },
            { id: 'evaluation', label: 'Model Evaluation', icon: BarChart2 },
            { id: 'predictor', label: 'Risk Predictor Tool', icon: Sliders },
            { id: 'pipeline', label: 'Data Pipeline Flow', icon: Database },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Status Badge & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${backendError ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
            <span className="text-slate-300 font-mono">
              {backendError ? 'Backend Offline' : 'Models Active'}
            </span>
          </div>

          <button
            onClick={fetchBackendData}
            title="Refresh ML Models & Data"
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {loading && !globePoints.length && (
          <div className="p-16 text-center glass-panel rounded-2xl border border-slate-800 space-y-3">
            <Activity className="w-10 h-10 mx-auto text-orange-500 animate-spin" />
            <p className="text-sm font-semibold text-slate-300">Initializing NASA VIIRS Preprocessing, Feature Engineering & ML Models...</p>
          </div>
        )}

        {!loading && backendError && (
          <div className="p-6 bg-rose-950/60 border border-rose-500/40 text-rose-300 rounded-2xl text-center space-y-2">
            <p className="font-semibold">{backendError}</p>
            <p className="text-xs text-slate-400">Please start the FastAPI backend server using: <code className="bg-slate-900 px-2 py-1 rounded text-orange-400">python -m backend.main</code></p>
          </div>
        )}

        {/* Tab 1: 3D Interactive Globe */}
        {activeTab === 'globe' && (
          <div className="space-y-6">
            <InteractiveGlobe 
              points={globePoints} 
              selectedPreset={selectedPreset}
              onSelectPoint={(pt) => {
                console.log("Selected globe point:", pt);
              }}
            />
          </div>
        )}

        {/* Tab 2: Multi-Model Evaluation & Comparison */}
        {activeTab === 'evaluation' && (
          <ModelEvaluationDashboard evaluationData={evaluationData} />
        )}

        {/* Tab 3: Fire Risk Predictor Engine */}
        {activeTab === 'predictor' && (
          <FireRiskPredictor onSelectPreset={handleSelectPreset} />
        )}

        {/* Tab 4: Data Pipeline Flow Inspector */}
        {activeTab === 'pipeline' && (
          <DataPipelineInspector pipelineStatus={pipelineStatus} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        NASA VIIRS CSV Data • Data Preprocessing • Feature Engineering • Risk Labels • RF / XGBoost / LightGBM / ANN • 3D Globe Dashboard
      </footer>
    </div>
  );
}
