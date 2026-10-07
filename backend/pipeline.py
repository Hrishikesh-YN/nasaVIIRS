import os
import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any
from sklearn.model_selection import train_test_split

from backend.dataset_generator import generate_viirs_dataset
from backend.preprocessing import preprocess_viirs_data
from backend.feature_engineering import engineer_features
from backend.risk_labeling import create_risk_labels
from backend.models import FireRiskModels
from backend.evaluation import evaluate_models
from backend.predictor import FireRiskPredictorEngine


class VIIRSFireRiskPipeline:
    """
    End-to-End NASA VIIRS Fire Risk Machine Learning Pipeline
    """

    def __init__(self, data_path: str = "data/viirs_fire_data.csv"):
        self.data_path = data_path
        self.raw_df = None
        self.processed_df = None
        self.feature_cols = []
        self.models_instance = FireRiskModels(random_state=42)
        self.predictor_engine = None
        self.evaluation_results = None
        self.preprocessing_report = {}
        self.labeling_stats = {}
        self.is_trained = False

    def run_pipeline(self) -> Dict[str, Any]:
        """
        Executes complete end-to-end pipeline.
        """
        print("--- Step 1: Data Collection ---")
        if not os.path.exists(self.data_path):
            print(f"Dataset not found at {self.data_path}. Generating synthetic NASA VIIRS data...")
            self.raw_df = generate_viirs_dataset(num_samples=2500, output_path=self.data_path)
        else:
            self.raw_df = pd.read_csv(self.data_path)
            print(f"Loaded dataset with {len(self.raw_df)} records from {self.data_path}")

        print("--- Step 2: Data Preprocessing ---")
        df_pre, self.preprocessing_report = preprocess_viirs_data(self.raw_df)

        print("--- Step 3: Feature Engineering ---")
        df_feat, self.feature_cols = engineer_features(df_pre)

        print("--- Step 4: Risk Label Creation ---")
        df_labeled, self.labeling_stats = create_risk_labels(df_feat)
        self.processed_df = df_labeled

        print("--- Step 5: Train / Test Split ---")
        X = self.processed_df[self.feature_cols]
        y = self.processed_df['risk_label']

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=42, stratify=y
        )

        # Scale data
        X_train_scaled, X_test_scaled = self.models_instance.prepare_data(X_train, X_test)

        print("--- Step 6: ML Models Training (Random Forest, XGBoost, LightGBM, ANN) ---")
        self.models_instance.train(X_train_scaled, y_train.values)

        print("--- Step 7: Model Evaluation ---")
        self.evaluation_results = evaluate_models(
            self.models_instance.models,
            X_test_scaled,
            y_test.values,
            self.feature_cols
        )

        print("--- Step 8: Fire Risk Predictor Engine Setup ---")
        self.predictor_engine = FireRiskPredictorEngine(
            self.models_instance, self.feature_cols
        )

        self.is_trained = True
        print("Pipeline execution completed successfully!")

        return {
            'status': 'success',
            'preprocessing_report': self.preprocessing_report,
            'labeling_stats': self.labeling_stats,
            'evaluation': self.evaluation_results,
            'num_features': len(self.feature_cols),
            'total_samples': len(self.processed_df)
        }

    def get_globe_points(self, limit: int = 1500) -> list:
        """
        Returns data points formatted specifically for 3D Globe visualization.
        """
        if self.processed_df is None:
            return []

        df_sub = self.processed_df.head(limit)
        points = []
        for _, r in df_sub.iterrows():
            points.append({
                'lat': float(r['latitude']),
                'lng': float(r['longitude']),
                'bright_ti4': float(r['bright_ti4']),
                'bright_ti5': float(r['bright_ti5']),
                'frp': float(r['frp']),
                'confidence': str(r['confidence']),
                'confidence_encoded': float(r['confidence_encoded']),
                'risk_level': str(r['risk_label_name']),
                'risk_code': int(r['risk_label']),
                'risk_score': float(np.round(r['risk_score'], 3)),
                'datetime': str(r['acq_date']) + " " + str(r['acq_time']).zfill(4),
                'satellite': str(r['satellite'])
            })
        return points


if __name__ == '__main__':
    pipeline = VIIRSFireRiskPipeline()
    results = pipeline.run_pipeline()
    print("Pipeline evaluation summary:")
    for model_res in results['evaluation']['comparison']:
        print(model_res)
