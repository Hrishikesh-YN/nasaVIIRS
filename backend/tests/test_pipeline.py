import pytest
import pandas as pd
import numpy as np
from backend.dataset_generator import generate_viirs_dataset
from backend.preprocessing import preprocess_viirs_data
from backend.feature_engineering import engineer_features
from backend.risk_labeling import create_risk_labels
from backend.models import FireRiskModels
from backend.evaluation import evaluate_models
from backend.predictor import FireRiskPredictorEngine

def test_dataset_generator():
    df = generate_viirs_dataset(num_samples=100)
    assert len(df) >= 100
    assert 'latitude' in df.columns
    assert 'longitude' in df.columns
    assert 'bright_ti4' in df.columns
    assert 'frp' in df.columns

def test_preprocessing():
    raw_df = generate_viirs_dataset(num_samples=150)
    pre_df, report = preprocess_viirs_data(raw_df)
    assert not pre_df['frp'].isnull().any()
    assert 'confidence_encoded' in pre_df.columns
    assert 'hour' in pre_df.columns
    assert 'month' in pre_df.columns

def test_feature_engineering():
    raw_df = generate_viirs_dataset(num_samples=100)
    pre_df, _ = preprocess_viirs_data(raw_df)
    feat_df, cols = engineer_features(pre_df)
    assert 'temp_diff' in feat_df.columns
    assert 'log_frp' in feat_df.columns
    assert 'sin_hour' in feat_df.columns
    assert len(cols) > 15

def test_risk_labeling():
    raw_df = generate_viirs_dataset(num_samples=100)
    pre_df, _ = preprocess_viirs_data(raw_df)
    feat_df, _ = engineer_features(pre_df)
    labeled_df, stats = create_risk_labels(feat_df)
    assert 'risk_label' in labeled_df.columns
    assert set(labeled_df['risk_label'].unique()).issubset({0, 1, 2, 3})

def test_models_training_and_evaluation():
    raw_df = generate_viirs_dataset(num_samples=200)
    pre_df, _ = preprocess_viirs_data(raw_df)
    feat_df, cols = engineer_features(pre_df)
    labeled_df, _ = create_risk_labels(feat_df)

    X = labeled_df[cols]
    y = labeled_df['risk_label']

    models_mgr = FireRiskModels()
    X_train_scaled, X_test_scaled = models_mgr.prepare_data(X.iloc[:150], X.iloc[150:])
    models_mgr.train(X_train_scaled, y.iloc[:150].values)

    eval_res = evaluate_models(models_mgr.models, X_test_scaled, y.iloc[150:].values, cols)
    assert len(eval_res['comparison']) == 4 # Random Forest, XGBoost, LightGBM, ANN

    # Test Predictor
    predictor = FireRiskPredictorEngine(models_mgr, cols)
    res = predictor.predict_single(
        latitude=38.5, longitude=-121.5, bright_ti4=365.0, bright_ti5=310.0, frp=150.0, confidence="high"
    )
    assert 'consensus_risk' in res
    assert len(res['model_predictions']) == 4
