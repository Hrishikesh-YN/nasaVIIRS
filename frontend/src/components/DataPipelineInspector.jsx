import React from 'react';
import { Database, Filter, Sliders, Target, Split, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';

export default function DataPipelineInspector({ pipelineStatus }) {
  if (!pipelineStatus) return null;

  const { preprocessing_report, labeling_stats, feature_list, total_records } = pipelineStatus;

  const steps = [
    {
      title: "1. Data Collection",
      icon: Database,
      color: "text-sky-400 bg-sky-500/10 border-sky-500/30",
      description: "NASA VIIRS Satellite CSV Importer",
      details: [
        `Total Records Ingested: ${total_records}`,
        `Standard Columns: Lat, Lon, Bright_Ti4, Bright_Ti5, FRP, Confidence, Datetime`
      ]
    },
    {
      title: "2. Data Preprocessing",
      icon: Filter,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      description: "Data Cleaning & Normalization",
      details: [
        `Duplicates Removed: ${preprocessing_report?.duplicates_removed || 0}`,
        `Imputed Missing Values: ${Object.keys(preprocessing_report?.missing_imputed || {}).length} fields`,
        `Confidence Encoded: Categorical ('low','nominal','high') -> Numeric (0.33, 0.66, 1.0)`,
        `Timestamp Conversion: Combined acq_date + acq_time -> ISO DateTime`
      ]
    },
    {
      title: "3. Feature Engineering",
      icon: Sliders,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      description: "Physical & Temporal Feature Transformation",
      details: [
        `Temperature Features: bright_ti4, bright_ti5, temp_diff (ti4-ti5), temp_ratio, anomaly`,
        `FRP Features: log1p(frp), frp_per_temp, frp_sqrt`,
        `Location Features: latitude, longitude, lat_abs, spatial_cluster (KMeans)`,
        `Temporal Features: hour, month, day_of_week, cyclical sin/cos hour, cyclical sin/cos month`
      ]
    },
    {
      title: "4. Risk Label Creation",
      icon: Target,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
      description: "Multi-Class Fire Risk Labeling",
      details: [
        `Class Distribution: ${JSON.stringify(labeling_stats?.class_distribution || {})}`,
        `Labels: Low (0), Medium (1), High (2), Extreme (3)`
      ]
    },
    {
      title: "5. Train / Test Split",
      icon: Split,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
      description: "Stratified Data Split & Featurization Ordering",
      details: [
        `Train Set: 80% (${Math.round(total_records * 0.8)} samples)`,
        `Test Set: 20% (${Math.round(total_records * 0.2)} samples)`,
        `Scaler: StandardScaler fit strictly on training set to prevent data leakage.`
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-2">NASA VIIRS Machine Learning Pipeline Flow</h3>
        <p className="text-xs text-slate-400">Chronological execution trajectory from raw satellite data ingestion to model training.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div 
              key={step.title}
              className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className={`p-2.5 rounded-xl border w-fit mb-3 ${step.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{step.title}</h4>
                <p className="text-xs text-slate-400 mb-3">{step.description}</p>

                <ul className="space-y-1.5 text-[11px] text-slate-300 font-mono">
                  {step.details.map((d, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-1">
                      <span className="text-orange-400 font-bold">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-emerald-400 font-mono">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Step Executed</span>
                <span className="text-slate-500">Stage {idx + 1}/5</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature List Badges */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-orange-400" /> Engineered Model Input Features ({feature_list?.length || 0} Total)
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {feature_list?.map((feat) => (
            <span 
              key={feat}
              className="px-2.5 py-1 text-xs font-mono bg-slate-900 text-slate-300 border border-slate-700/80 rounded-lg"
            >
              {feat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
