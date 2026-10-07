import pandas as pd
import numpy as np
from datetime import datetime
from typing import Tuple

def preprocess_viirs_data(df: pd.DataFrame) -> Tuple[pd.DataFrame, dict]:
    """
    Executes Data Preprocessing step:
    1. Remove duplicate rows.
    2. Handle missing/null values (impute numeric fields with median, categorical with mode).
    3. Encode confidence levels ('low' -> 0.33, 'nominal' -> 0.66, 'high' -> 1.0 or numeric percentage).
    4. Convert date & time fields ('acq_date' + 'acq_time') into datetime timestamps and extracted components.
    """
    report = {}
    initial_count = len(df)
    
    # 1. Remove duplicate rows
    df = df.drop_duplicates().copy()
    report['duplicates_removed'] = initial_count - len(df)
    
    # 2. Handle missing / NaN values
    # Check for NaNs
    missing_before = df.isnull().sum().to_dict()
    
    # Impute FRP missing values with median
    if 'frp' in df.columns and df['frp'].isnull().any():
        median_frp = df['frp'].median()
        df['frp'] = df['frp'].fillna(median_frp)
        
    if 'bright_ti4' in df.columns and df['bright_ti4'].isnull().any():
        df['bright_ti4'] = df['bright_ti4'].fillna(df['bright_ti4'].median())
        
    if 'bright_ti5' in df.columns and df['bright_ti5'].isnull().any():
        df['bright_ti5'] = df['bright_ti5'].fillna(df['bright_ti5'].median())
        
    if 'confidence' in df.columns and df['confidence'].isnull().any():
        df['confidence'] = df['confidence'].fillna('nominal')
        
    report['missing_imputed'] = {k: v for k, v in missing_before.items() if v > 0}
    
    # 3. Encode Confidence
    # NASA VIIRS provides confidence as string ('l', 'n', 'h' or 'low', 'nominal', 'high') or integer % (0-100)
    def map_confidence(val):
        if pd.isna(val):
            return 0.66
        val_str = str(val).strip().lower()
        if val_str in ['l', 'low', '33']:
            return 0.33
        elif val_str in ['n', 'nominal', '66']:
            return 0.66
        elif val_str in ['h', 'high', '100']:
            return 1.0
        try:
            num = float(val_str)
            return np.clip(num / 100.0 if num > 1.0 else num, 0.0, 1.0)
        except ValueError:
            return 0.66

    df['confidence_encoded'] = df['confidence'].apply(map_confidence)
    
    # 4. Time Conversion (acq_date + acq_time)
    def parse_datetime(row):
        date_str = str(row['acq_date']).strip()
        time_str = str(row['acq_time']).zfill(4).strip()
        try:
            hour = int(time_str[:2])
            minute = int(time_str[2:4])
            dt = datetime.strptime(date_str, '%Y-%m-%d')
            return dt.replace(hour=hour, minute=minute)
        except Exception:
            return datetime(2025, 1, 1, 12, 0)

    df['datetime'] = df.apply(parse_datetime, axis=1)
    df['hour'] = df['datetime'].dt.hour
    df['month'] = df['datetime'].dt.month
    df['day_of_week'] = df['datetime'].dt.dayofweek
    df['day_of_year'] = df['datetime'].dt.dayofyear
    
    report['processed_rows'] = len(df)
    return df, report
