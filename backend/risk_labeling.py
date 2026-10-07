import pandas as pd
import numpy as np
from typing import Tuple, Dict

def create_risk_labels(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict]:
    """
    Creates target Fire Risk Labels (0: Low, 1: Medium, 2: High, 3: Extreme)
    based on a composite physical index of Brightness Temp (I4), Fire Radiative Power (FRP),
    and Confidence Level.
    """
    df = df.copy()

    # Calculate composite risk score index
    # Normalized ti4 contribution (0 at 300K, 1 at 360K+)
    norm_ti4 = np.clip((df['bright_ti4'] - 300.0) / 60.0, 0.0, 1.0)
    
    # Normalized log FRP contribution (0 at 0MW, 1 at 150MW+)
    norm_frp = np.clip(np.log1p(df['frp']) / np.log1p(150.0), 0.0, 1.0)
    
    # Confidence weight
    conf_weight = df['confidence_encoded']

    # Composite Fire Risk Score (0.0 to 1.0)
    composite_score = (0.45 * norm_ti4 + 0.40 * norm_frp + 0.15 * conf_weight)
    df['risk_score'] = composite_score

    # Assign Risk Classes
    conditions = [
        composite_score < 0.35,
        (composite_score >= 0.35) & (composite_score < 0.60),
        (composite_score >= 0.60) & (composite_score < 0.80),
        composite_score >= 0.80
    ]
    choices = [0, 1, 2, 3] # Low, Medium, High, Extreme
    
    df['risk_label'] = np.select(conditions, choices, default=1)
    
    label_map = {0: "Low", 1: "Medium", 2: "High", 3: "Extreme"}
    df['risk_label_name'] = df['risk_label'].map(label_map)

    class_counts = df['risk_label_name'].value_counts().to_dict()
    stats = {
        'class_distribution': class_counts,
        'total_samples': len(df)
    }

    return df, stats
