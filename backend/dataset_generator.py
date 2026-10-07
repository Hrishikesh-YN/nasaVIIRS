import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

def generate_viirs_dataset(num_samples: int = 2500, output_path: str = None) -> pd.DataFrame:
    """
    Generates realistic NASA VIIRS I-Band 375m Active Fire data CSV.
    Matches standard NASA FIRMS VIIRS schema.
    """
    np.random.seed(42)

    # Key global wildfire hotspot regions (Amazon, California/West Coast, Australia, Central Africa, Siberia, SE Asia)
    hotspots = [
        {"name": "California / US West", "lat_center": 38.0, "lon_center": -120.0, "spread_lat": 4.0, "spread_lon": 4.0, "weight": 0.25},
        {"name": "Amazon Basin", "lat_center": -8.0, "lon_center": -55.0, "spread_lat": 6.0, "spread_lon": 8.0, "weight": 0.25},
        {"name": "SE Australia", "lat_center": -33.0, "lon_center": 148.0, "spread_lat": 5.0, "spread_lon": 5.0, "weight": 0.20},
        {"name": "Mediterranean / Europe", "lat_center": 39.0, "lon_center": 22.0, "spread_lat": 4.0, "spread_lon": 6.0, "weight": 0.15},
        {"name": "Central Africa", "lat_center": -4.0, "lon_center": 20.0, "spread_lat": 5.0, "spread_lon": 6.0, "weight": 0.15},
    ]

    selected_hotspots = np.random.choice(hotspots, size=num_samples, p=[h["weight"] for h in hotspots])
    
    lats = []
    lons = []
    for h in selected_hotspots:
        lats.append(np.round(np.random.normal(h["lat_center"], h["spread_lat"] / 2.5), 4))
        lons.append(np.round(np.random.normal(h["lon_center"], h["spread_lon"] / 2.5), 4))

    # Base dates across a 1-year span
    start_date = datetime(2025, 1, 1)
    random_days = np.random.randint(0, 365, size=num_samples)
    dates = [start_date + timedelta(days=int(d)) for d in random_days]
    acq_dates = [d.strftime('%Y-%m-%d') for d in dates]
    
    # Hours & Times
    random_hours = np.random.randint(0, 24, size=num_samples)
    random_mins = np.random.randint(0, 60, size=num_samples)
    acq_times = [f"{h:02d}{m:02d}" for h, m in zip(random_hours, random_mins)]
    daynight = ['D' if 6 <= h <= 18 else 'N' for h in random_hours]

    # Temperatures & FRP correlated with fire intensity
    # Brightness Temp I4 (375m thermal channel) - Fire detection channel
    # Range 298K (cool/low confidence) to 380K (intense flaming)
    risk_bias = np.random.exponential(scale=1.5, size=num_samples)
    bright_ti4 = np.round(300.0 + np.clip(risk_bias * 25.0 + np.random.normal(0, 5, num_samples), 0, 80), 2)
    
    # Brightness Temp I5 (11um channel) - Typically 270K - 325K
    bright_ti5 = np.round(bright_ti4 * 0.82 + np.random.normal(20, 4, num_samples), 2)
    
    # Fire Radiative Power (MW) - Highly skewed, 0.5 to 450+ MW
    frp = np.round(np.exp(np.random.normal(1.8, 1.1, num_samples)) * (bright_ti4 / 320.0), 2)
    frp = np.clip(frp, 0.5, 650.0)

    # Confidence: 'low', 'nominal', 'high'
    conf_probs = []
    for t4, f in zip(bright_ti4, frp):
        score = (t4 - 300) / 80.0 + (f / 300.0)
        if score > 0.8:
            conf_probs.append('high')
        elif score > 0.35:
            conf_probs.append('nominal')
        else:
            conf_probs.append('low')

    satellites = np.random.choice(['NPP', 'N20', 'N21'], size=num_samples, p=[0.45, 0.45, 0.10])
    scans = np.round(np.random.uniform(0.32, 0.8, size=num_samples), 2)
    tracks = np.round(np.random.uniform(0.36, 0.8, size=num_samples), 2)

    df = pd.DataFrame({
        'latitude': lats,
        'longitude': lons,
        'bright_ti4': bright_ti4,
        'scan': scans,
        'track': tracks,
        'acq_date': acq_dates,
        'acq_time': acq_times,
        'satellite': satellites,
        'instrument': 'VIIRS',
        'confidence': conf_probs,
        'version': '2.0',
        'bright_ti5': bright_ti5,
        'frp': frp,
        'daynight': daynight
    })

    # Add random missing values / duplicate rows to test data preprocessing step
    # Add ~2% duplicates
    dup_indices = np.random.choice(df.index, size=int(num_samples * 0.02), replace=False)
    df_dups = df.loc[dup_indices].copy()
    
    # Add ~1% NaN values in optional fields
    nan_indices = np.random.choice(df.index, size=int(num_samples * 0.01), replace=False)
    df.loc[nan_indices, 'frp'] = np.nan

    df = pd.concat([df, df_dups], ignore_index=True).sample(frac=1.0, random_state=42).reset_index(drop=True)

    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df.to_csv(output_path, index=False)
        print(f"Generated VIIRS dataset with {len(df)} rows to {output_path}")

    return df

if __name__ == '__main__':
    generate_viirs_dataset(output_path='data/viirs_fire_data.csv')
