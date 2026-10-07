import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell 
} from 'recharts';
import { Cpu, Award, BarChart3, Grid, Activity, ChevronRight, CheckCircle2 } from 'lucide-react';

const MODEL_COLORS = {
  'Random Forest': '#3b82f6',        // Blue
  'XGBoost': '#10b981',              // Emerald
  'LightGBM': '#f59e0b',             // Amber
  'ANN (Deep Learning)': '#ec4899'    // Pink
};

export default function ModelEvaluationDashboard({ evaluationData }) {
  const [activeModelCM, setActiveModelCM] = useState('Random Forest');

  if (!evaluationData || !evaluationData.comparison) {
    return (
      <div className="p-8 glass-panel rounded-2xl text-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin mx-auto text-orange-400 mb-2" />
        Loading model evaluation metrics...
      </div>
    );
  }

  const { comparison, confusion_matrices, feature_importances } = evaluationData;

  // Best performing model based on F1-score
  const bestModel = [...comparison].sort((a, b) => b.f1_score - a.f1_score)[0];

  const activeCM = confusion_matrices[activeModelCM] || confusion_matrices['Random Forest'];
  const activeFeatureImportances = (feature_importances && feature_importances[activeModelCM]) 
    ? feature_importances[activeModelCM].slice(0, 10) 
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner: Champion Model Recommendation */}
      <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">Champion ML Model</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">Highest F1-Score</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-0.5">{bestModel?.model}</h3>
            <p className="text-xs text-slate-400">Evaluated on test set with 80/20 train/test split and strict featurization ordering.</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center font-mono">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Accuracy</span>
            <span className="text-base font-bold text-white">{(bestModel?.accuracy * 100).toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Precision</span>
            <span className="text-base font-bold text-emerald-400">{(bestModel?.precision * 100).toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Recall</span>
            <span className="text-base font-bold text-sky-400">{(bestModel?.recall * 100).toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">F1-Score</span>
            <span className="text-base font-bold text-amber-400">{(bestModel?.f1_score * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Model Benchmark Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {comparison.map((item) => {
          const isChampion = item.model === bestModel?.model;
          return (
            <div 
              key={item.model}
              className={`p-5 rounded-2xl transition-all glass-panel border ${
                isChampion ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg text-white" style={{ backgroundColor: MODEL_COLORS[item.model] || '#64748b' }}>
                  {item.model}
                </span>
                {isChampion && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>

              <div className="space-y-2 mt-4 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Accuracy:</span>
                  <span className="font-bold text-white">{(item.accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>F1-Score:</span>
                  <span className="font-bold text-amber-400">{(item.f1_score * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Precision:</span>
                  <span className="text-slate-200">{(item.precision * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Recall:</span>
                  <span className="text-slate-200">{(item.recall * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>ROC-AUC:</span>
                  <span className="text-sky-400">{(item.roc_auc * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Benchmark Performance Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-400" /> Multi-Model Performance Metric Comparison
          </h3>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparison} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
              <XAxis dataKey="model" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 1]} stroke="#94a3b8" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                formatter={(val) => [`${(val * 100).toFixed(1)}%`]}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="accuracy" name="Accuracy" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="precision" name="Precision" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recall" name="Recall" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="f1_score" name="F1 Score" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Confusion Matrix & Feature Importances Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Visualizer */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-5 border-b border-slate-800 pb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Grid className="w-5 h-5 text-sky-400" /> Confusion Matrix Visualizer
            </h3>
            
            {/* Model Selector Tabs */}
            <div className="flex flex-wrap gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              {comparison.map((m) => (
                <button
                  key={m.model}
                  onClick={() => setActiveModelCM(m.model)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    activeModelCM === m.model
                      ? 'bg-slate-800 text-white font-bold border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m.model}
                </button>
              ))}
            </div>
          </div>

          {activeCM && (
            <div>
              <div className="text-xs text-slate-400 mb-3 flex items-center justify-between">
                <span>Predicted Class (Columns) vs Actual Class (Rows)</span>
                <span className="font-semibold text-orange-400">{activeModelCM}</span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 font-mono text-center text-xs">
                {/* Header row */}
                <div className="p-2 text-slate-500 font-sans font-semibold">Actual \ Pred</div>
                {activeCM.labels.map(l => (
                  <div key={l} className="p-2 font-bold text-slate-300 bg-slate-900/60 rounded-lg">{l}</div>
                ))}

                {/* Matrix rows */}
                {activeCM.matrix.map((row, rIdx) => (
                  <React.Fragment key={rIdx}>
                    <div className="p-2 font-bold text-slate-300 bg-slate-900/60 rounded-lg flex items-center justify-center">
                      {activeCM.labels[rIdx]}
                    </div>
                    {row.map((val, cIdx) => {
                      const isDiagonal = rIdx === cIdx;
                      const intensity = Math.min(val / 100.0, 1.0);
                      return (
                        <div 
                          key={cIdx} 
                          className={`p-3 rounded-lg flex flex-col items-center justify-center border transition-all ${
                            isDiagonal 
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 font-bold' 
                              : val > 0 
                                ? 'bg-rose-950/40 text-rose-300 border-rose-500/30' 
                                : 'bg-slate-900/40 text-slate-500 border-slate-800'
                          }`}
                        >
                          <span className="text-sm font-bold">{val}</span>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Feature Importance Ranking Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-400" /> Top Feature Importances ({activeModelCM})
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical" 
                data={activeFeatureImportances} 
                margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis dataKey="feature" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val) => [(val * 100).toFixed(2) + '%', 'Importance']}
                />
                <Bar dataKey="importance" fill="#f59e0b" radius={[0, 4, 4, 0]}>
                  {activeFeatureImportances.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index < 3 ? '#f97316' : '#38bdf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
