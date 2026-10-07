import numpy as np
import pandas as pd
from typing import Dict, Any, List
from datetime import datetime

class FireRiskPredictorEngine:
    """
    Inference Engine for single and batch predictions using trained models.
    """

    def __init__(self, models_instance, feature_cols: List[str]):
        self.models_instance = models_instance
        self.feature_cols = feature_cols
        self.class_names = ["Low", "Medium", "High", "Extreme"]

    def predict_single(
        self,
        latitude: float,
        longitude: float,
        bright_ti4: float,
        bright_ti5: float,
        frp: float,
        confidence: str = "nominal",
        acq_datetime: str = None
    ) -> Dict[str, Any]:
        """
        Executes real-time inference for a single input point.
        """
        if acq_datetime is None:
            dt = datetime.now()
        else:
            try:
                dt = datetime.fromisoformat(acq_datetime.replace('Z', ''))
            except Exception:
                dt = datetime.now()

        # Map confidence
        def map_conf(val):
            val_str = str(val).lower()
            if 'low' in val_str: return 0.33
            if 'high' in val_str: return 1.0
            return 0.66

        conf_enc = map_conf(confidence)

        # Feature transformations
        temp_diff = bright_ti4 - bright_ti5
        temp_ratio = bright_ti4 / (bright_ti5 + 1e-5)
        temp_anomaly = (bright_ti4 - 300.0) / 100.0
        log_frp = np.log1p(max(frp, 0.0))
        frp_per_temp = frp / (bright_ti4 + 1e-5)
        frp_sqrt = np.sqrt(max(frp, 0.0))
        lat_abs = abs(latitude)
        
        hour = dt.hour
        month = dt.month
        day_of_week = dt.weekday()
        day_of_year = dt.timetuple().tm_yday
        sin_hour = np.sin(2 * np.pi * hour / 24.0)
        cos_hour = np.cos(2 * np.pi * hour / 24.0)
        sin_month = np.sin(2 * np.pi * month / 12.0)
        cos_month = np.cos(2 * np.pi * month / 12.0)
        is_day = 1 if 6 <= hour <= 18 else 0

        # Create input dataframe matching feature_cols exactly
        input_data = {
            'bright_ti4': bright_ti4,
            'bright_ti5': bright_ti5,
            'temp_diff': temp_diff,
            'temp_ratio': temp_ratio,
            'temp_anomaly_ti4': temp_anomaly,
            'frp': frp,
            'log_frp': log_frp,
            'frp_per_temp': frp_per_temp,
            'frp_sqrt': frp_sqrt,
            'latitude': latitude,
            'longitude': longitude,
            'lat_abs': lat_abs,
            'spatial_cluster': 0, # Default cluster
            'confidence_encoded': conf_enc,
            'hour': hour,
            'month': month,
            'day_of_week': day_of_week,
            'day_of_year': day_of_year,
            'sin_hour': sin_hour,
            'cos_hour': cos_hour,
            'sin_month': sin_month,
            'cos_month': cos_month,
            'is_day': is_day
        }

        df_single = pd.DataFrame([input_data])[self.feature_cols]
        X_scaled = self.models_instance.scaler.transform(df_single)

        model_predictions = {}
        consensus_counts = {c: 0 for c in self.class_names}

        for name, model in self.models_instance.models.items():
            pred_idx = int(model.predict(X_scaled)[0])
            pred_name = self.class_names[pred_idx]
            consensus_counts[pred_name] += 1

            if hasattr(model, 'predict_proba'):
                probs = model.predict_proba(X_scaled)[0].tolist()
                prob_dict = {self.class_names[i]: float(np.round(p, 4)) for i, p in enumerate(probs)}
            else:
                prob_dict = {c: (1.0 if c == pred_name else 0.0) for c in self.class_names}

            model_predictions[name] = {
                'predicted_class': pred_name,
                'class_index': pred_idx,
                'probabilities': prob_dict
            }

        # Determine overall consensus risk
        consensus_class = max(consensus_counts, key=consensus_counts.get)
        
        # Calculate ensemble average probability
        avg_probs = {c: 0.0 for c in self.class_names}
        num_models = len(model_predictions)
        for mp in model_predictions.values():
            for c, p in mp['probabilities'].items():
                avg_probs[c] += p / num_models

        avg_probs = {c: float(np.round(p, 4)) for c, p in avg_probs.items()}

        return {
            'input_parameters': {
                'latitude': latitude,
                'longitude': longitude,
                'bright_ti4': bright_ti4,
                'bright_ti5': bright_ti5,
                'frp': frp,
                'confidence': confidence,
                'datetime': dt.isoformat()
            },
            'consensus_risk': consensus_class,
            'ensemble_probabilities': avg_probs,
            'model_predictions': model_predictions
        }
