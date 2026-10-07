import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler

# Try importing XGBoost & LightGBM with graceful fallback to GradientBoosting if needed
try:
    from xgboost import XGBClassifier
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

try:
    from lightgbm import LGBMClassifier
    HAS_LIGHTGBM = True
except ImportError:
    HAS_LIGHTGBM = False


class FireRiskModels:
    """
    Encapsulates training and evaluation of 4 ML models for Fire Risk Classification:
    1. Random Forest
    2. XGBoost
    3. LightGBM
    4. ANN (Artificial Neural Network / Deep Learning)
    """

    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.scaler = StandardScaler()
        self.models = {}
        self.feature_names = []

    def prepare_data(self, X_train: pd.DataFrame, X_test: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Fits StandardScaler strictly on training set, then transforms train and test sets.
        Adheres strictly to ML Best Practices (Strict Featurization Ordering).
        """
        self.feature_names = list(X_train.columns)
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        return X_train_scaled, X_test_scaled

    def build_models(self) -> Dict[str, Any]:
        """
        Instantiates the 4 ML models.
        """
        models = {}

        # 1. Random Forest
        models['Random Forest'] = RandomForestClassifier(
            n_estimators=120,
            max_depth=12,
            min_samples_split=4,
            random_state=self.random_state,
            n_jobs=-1
        )

        # 2. XGBoost
        if HAS_XGBOOST:
            models['XGBoost'] = XGBClassifier(
                n_estimators=120,
                max_depth=6,
                learning_rate=0.08,
                random_state=self.random_state,
                eval_metric='mlogloss',
                n_jobs=-1
            )
        else:
            models['XGBoost'] = GradientBoostingClassifier(
                n_estimators=120,
                max_depth=6,
                learning_rate=0.08,
                random_state=self.random_state
            )

        # 3. LightGBM
        if HAS_LIGHTGBM:
            models['LightGBM'] = LGBMClassifier(
                n_estimators=120,
                max_depth=6,
                learning_rate=0.08,
                random_state=self.random_state,
                verbose=-1,
                n_jobs=-1
            )
        else:
            models['LightGBM'] = GradientBoostingClassifier(
                n_estimators=100,
                max_depth=5,
                learning_rate=0.1,
                subsample=0.8,
                random_state=self.random_state
            )

        # 4. ANN (Artificial Neural Network / Deep Learning)
        models['ANN (Deep Learning)'] = MLPClassifier(
            hidden_layer_sizes=(128, 64, 32),
            activation='relu',
            solver='adam',
            max_iter=300,
            early_stopping=True,
            n_iter_no_change=15,
            random_state=self.random_state
        )

        self.models = models
        return models

    def train(self, X_train_scaled: np.ndarray, y_train: np.ndarray) -> Dict[str, Any]:
        """
        Trains all 4 models on the preprocessed training dataset.
        """
        if not self.models:
            self.build_models()

        trained_info = {}
        for name, model in self.models.items():
            print(f"Training model: {name}...")
            model.fit(X_train_scaled, y_train)
            trained_info[name] = True
            
        return trained_info
