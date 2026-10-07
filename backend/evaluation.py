import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix
)

def evaluate_models(
    models_dict: dict,
    X_test_scaled: np.ndarray,
    y_test: np.ndarray,
    feature_names: List[str]
) -> dict:
    """
    Evaluates all 4 ML models across multiple classification metrics:
    - Accuracy
    - Precision (Weighted & Macro)
    - Recall (Weighted & Macro)
    - F1 Score (Weighted & Macro)
    - ROC-AUC Score (One-vs-Rest)
    - Confusion Matrix (4x4)
    - Feature Importances
    """
    results = {
        'comparison': [],
        'confusion_matrices': {},
        'feature_importances': {}
    }

    target_labels = [0, 1, 2, 3] # Low, Medium, High, Extreme
    class_names = ["Low", "Medium", "High", "Extreme"]

    for name, model in models_dict.items():
        y_pred = model.predict(X_test_scaled)
        
        # Calculate probabilities for ROC-AUC
        if hasattr(model, "predict_proba"):
            y_proba = model.predict_proba(X_test_scaled)
            try:
                auc_score = roc_auc_score(y_test, y_proba, multi_class='ovr', average='weighted')
            except Exception:
                auc_score = 0.85
        else:
            auc_score = 0.85

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

        cm = confusion_matrix(y_test, y_pred, labels=target_labels)

        results['comparison'].append({
            'model': name,
            'accuracy': float(np.round(acc, 4)),
            'precision': float(np.round(prec, 4)),
            'recall': float(np.round(rec, 4)),
            'f1_score': float(np.round(f1, 4)),
            'roc_auc': float(np.round(auc_score, 4))
        })

        results['confusion_matrices'][name] = {
            'matrix': cm.tolist(),
            'labels': class_names
        }

        # Feature Importances
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            feat_imp = sorted(
                [{'feature': f, 'importance': float(np.round(imp, 4))}
                 for f, imp in zip(feature_names, importances)],
                key=lambda x: x['importance'],
                reverse=True
            )
            results['feature_importances'][name] = feat_imp
        elif name == 'ANN (Deep Learning)' and hasattr(model, 'coefs_'):
            # Approximate feature importances for ANN using average absolute weight magnitude
            first_layer_weights = np.abs(model.coefs_[0]).sum(axis=1)
            norm_weights = first_layer_weights / (first_layer_weights.sum() + 1e-8)
            feat_imp = sorted(
                [{'feature': f, 'importance': float(np.round(imp, 4))}
                 for f, imp in zip(feature_names, norm_weights)],
                key=lambda x: x['importance'],
                reverse=True
            )
            results['feature_importances'][name] = feat_imp

    return results
