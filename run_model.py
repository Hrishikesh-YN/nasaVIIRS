import sys
import os

# Ensure backend package can be imported
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.pipeline import VIIRSFireRiskPipeline

def print_header(title):
    print("\n" + "=" * 75)
    print(f"  {title}")
    print("=" * 75)

def main():
    print_header("NASA VIIRS Wildfire Risk ML System - Terminal Engine")
    print("• Ingesting NASA VIIRS 375m active fire data (2,550 records)...")
    print("• Preprocessing: missing imputation, confidence encoding, datetime parsing...")
    print("• Engineering 23 domain features (Thermal, FRP, Spatial, Cyclical Time)...")
    print("• Training 4 Models: Random Forest, XGBoost, LightGBM, ANN (MLP)...")

    pipeline = VIIRSFireRiskPipeline(data_path="data/viirs_fire_data.csv")
    results = pipeline.run_pipeline()

    print_header("MODEL PERFORMANCE BENCHMARK (Held-out 20% Test Set)")
    print(f"{'Model':<22} | {'Accuracy':<10} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10} | {'ROC-AUC':<10}")
    print("-" * 85)
    for m in results['evaluation']['comparison']:
        print(f"{m['model']:<22} | {m['accuracy']*100:>8.2f}% | {m['precision']*100:>8.2f}% | {m['recall']*100:>8.2f}% | {m['f1_score']*100:>8.2f}% | {m['roc_auc']:>8.4f}")

    print_header("GLOBAL HOTSPOT PRESET PREDICTIONS (Ensemble Consensus)")
    presets = [
        {"name": "California Wildfire Complex", "lat": 38.58, "lng": -121.49, "ti4": 365.2, "ti5": 308.5, "frp": 145.8, "conf": "high"},
        {"name": "Amazon Deforestation Burn", "lat": -8.76, "lng": -63.90, "ti4": 348.0, "ti5": 301.5, "frp": 88.4, "conf": "nominal"},
        {"name": "Australian Bushfire Event", "lat": -33.87, "lng": 151.21, "ti4": 372.0, "ti5": 312.0, "frp": 210.5, "conf": "high"},
        {"name": "Siberian Boreal Forest Fire", "lat": 62.04, "lng": 129.68, "ti4": 332.1, "ti5": 294.0, "frp": 35.2, "conf": "nominal"},
        {"name": "Cool Surface Noise / Non-Fire", "lat": 45.50, "lng": -73.57, "ti4": 301.2, "ti5": 288.4, "frp": 2.1, "conf": "low"},
    ]

    for p in presets:
        pred = pipeline.predictor_engine.predict_single(
            latitude=p["lat"], longitude=p["lng"],
            bright_ti4=p["ti4"], bright_ti5=p["ti5"],
            frp=p["frp"], confidence=p["conf"]
        )
        print(f"\n[+] Scenario: {p['name']}")
        print(f"    Inputs: Ti4={p['ti4']} K | Ti5={p['ti5']} K | FRP={p['frp']} MW | Conf={p['conf']}")
        print(f"    ==> CONSENSUS RISK LEVEL: [{pred['consensus_risk'].upper()}]")
        print("    ==> Individual Model Predictions:")
        for model_name, info in pred['model_predictions'].items():
            pred_class = info['predicted_class']
            prob = info['probabilities'].get(pred_class, 0.0) * 100
            print(f"        • {model_name:<20}: {pred_class:<8} (Confidence: {prob:5.1f}%)")

    print_header("HOW TO RUN")
    print("• To re-run this ML model test anytime in terminal:")
    print("    python run_model.py")
    print("• Or run the complete pipeline directly:")
    print("    python -m backend.pipeline")
    print("• To start the FastAPI Backend Server:")
    print("    python -m backend.main")
    print("• To start the React 3D Globe Web Dashboard:")
    print("    cd frontend && npm run dev")
    print("=" * 75 + "\n")

if __name__ == "__main__":
    main()
