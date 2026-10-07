import pandas as pd
import numpy as np
from typing import Tuple, List
from sklearn.cluster import KMeans

def engineer_features(df: pd.DataFrame, num_clusters: int = 8) -> Tuple[pd.DataFrame, list]:
    """
    Executes Feature Engineering step across 4 domains:
    1. Temperature Features (ti4, ti5, deltas, ratios, brightness intensity)
    2. FRP Features (Fire Radiative Power log transform, per-temp ratio)
    3. Location Features (Latitude, Longitude, Absolute Lat, Spatial Grid Clusters)
    4. Temporal Features (Cyclical sine/cosine encodings for hour and month, day/night flag)
    """
    df = df.copy()

    # 1. Temperature Features
    # Brightness I4 (375m thermal) and I5 (11um thermal)
    df['temp_diff'] = df['bright_ti4'] - df['bright_ti5']
    df['temp_ratio'] = df['bright_ti4'] / (df['bright_ti5'] + 1e-5)
    # Relative thermal anomaly score above standard ambient baseline (300K)
    df['temp_anomaly_ti4'] = (df['bright_ti4'] - 300.0) / 100.0

    # 2. FRP (Fire Radiative Power) Features
    df['log_frp'] = np.log1p(np.maximum(df['frp'], 0.0))
    df['frp_per_temp'] = df['frp'] / (df['bright_ti4'] + 1e-5)
    df['frp_sqrt'] = np.sqrt(np.maximum(df['frp'], 0.0))

    # 3. Location Features
    df['lat_abs'] = np.abs(df['latitude'])
    # Spatial clustering on Lat/Lon using KMeans
    kmeans = KMeans(n_clusters=min(num_clusters, len(df)), random_state=42, n_init=10)
    df['spatial_cluster'] = kmeans.fit_predict(df[['latitude', 'longitude']])

    # 4. Temporal Features
    # Cyclical sin/cos transformation for Hour (0-23)
    df['sin_hour'] = np.sin(2 * np.pi * df['hour'] / 24.0)
    df['cos_hour'] = np.cos(2 * np.pi * df['hour'] / 24.0)
    
    # Cyclical sin/cos transformation for Month (1-12)
    df['sin_month'] = np.sin(2 * np.pi * df['month'] / 12.0)
    df['cos_month'] = np.cos(2 * np.pi * df['month'] / 12.0)
    
    # Binary Day vs Night flag ('D' -> 1, 'N' -> 0)
    df['is_day'] = df['daynight'].apply(lambda x: 1 if str(x).upper() == 'D' else 0)

    feature_cols = [
        'bright_ti4', 'bright_ti5', 'temp_diff', 'temp_ratio', 'temp_anomaly_ti4',
        'frp', 'log_frp', 'frp_per_temp', 'frp_sqrt',
        'latitude', 'longitude', 'lat_abs', 'spatial_cluster',
        'confidence_encoded', 'hour', 'month', 'day_of_week', 'day_of_year',
        'sin_hour', 'cos_hour', 'sin_month', 'cos_month', 'is_day'
    ]

    return df, feature_cols
