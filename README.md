# 🛰️ NASA VIIRS Wildfire Risk Machine Learning Pipeline & 3D Globe Dashboard

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.164-black?logo=threedotjs&logoColor=white)](https://threejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![LightGBM](https://img.shields.io/badge/LightGBM-96.8%25_Acc-brightgreen)]()

An end-to-end Machine Learning pipeline and full-stack geospatial application that ingests **NASA VIIRS (Visible Infrared Imaging Radiometer Suite) I-Band 375m** active fire satellite telemetry to predict wildfire risk severity levels in real-time, rendered across a **3D interactive rotating Earth globe**.

Developed as part of the **Project-Based Learning (PBL)** component for Machine Learning at **Chennai Institute of Technology (CIT Chennai)**.

---

## 📌 Project Overview & Highlights

- **Active Satellite Ingestion:** Ingests 2,550 NASA VIIRS active fire observations across 5 global wildfire hotspot regions (California, Amazon Basin, Southeast Australia, Mediterranean, and Siberia).
- **Automated Data Cleaning:** Imputes missing values using training-set medians, removes duplicates, encodes confidence levels (`low` $\rightarrow 0.33$, `nominal` $\rightarrow 0.66$, `high` $\rightarrow 1.0$), and parses acquisition timestamps.
- **23 Engineered Domain Features:**
  - **Thermal:** Brightness temperatures $T_{i4}$ (375m) and $T_{i5}$ (11μm), thermal delta $\Delta T = T_{i4} - T_{i5}$, ratio, and anomaly score.
  - **Fire Radiative Power (FRP):** $\ln(1 + \text{FRP})$, $\sqrt{\text{FRP}}$, and per-temperature fire intensity ratios.
  - **Spatial:** Latitude, longitude, absolute latitude, and KMeans spatial clusters ($k=8$).
  - **Temporal:** Diurnal hour, month, day of week/year, and cyclical $\sin / \cos$ transformations for hour and month.
- **Multi-Model ML Suite:** 4 distinct classifiers evaluated under strict data leakage prevention (StandardScaler fit on train only):
  - **LightGBM (Champion):** **96.81% Accuracy** | **0.9969 ROC-AUC**
  - **Random Forest:** **96.21% Accuracy** | **0.9975 ROC-AUC**
  - **XGBoost:** **95.81% Accuracy** | **0.9959 ROC-AUC**
  - **Artificial Neural Network (MLP 128-64-32):** **95.01% Accuracy** | **0.9965 ROC-AUC**
- **Ensemble Consensus Engine:** Combines probability distributions across all 4 models to output high-confidence risk tiers (**Low**, **Medium**, **High**, **Extreme**).
- **FastAPI REST Microservice:** 5 endpoints providing pipeline execution, evaluation telemetry, and single-point real-time inference.
- **React + Globe.gl 3D UI:** Rotating 3D Earth rendering active hotspots with altitude FRP spikes, glowing risk clusters, live predictor sliders, and model evaluation benchmarks.

---

## 🏆 Model Performance Benchmark (Held-out 20% Test Set)

| Model | Accuracy | Precision | Recall | F1-Score | ROC-AUC | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **LightGBM** | **96.81%** | **96.85%** | **96.81%** | **96.81%** | **0.9969** | 🥇 **Champion Model** |
| **Random Forest (120 Trees)** | **96.21%** | **96.22%** | **96.21%** | **96.21%** | **0.9975** | 🥈 High Stability |
| **XGBoost** | **95.81%** | **95.85%** | **95.81%** | **95.81%** | **0.9959** | 🥉 Gradient Boosted |
| **ANN (Deep Learning MLP)** | **95.01%** | **95.04%** | **95.01%** | **95.00%** | **0.9965** | 🏅 Dense Multi-Layer |

---

## 🏗️ System Architecture

```text
+-----------------------------------------------------------------------------------+
|                     NASA VIIRS WILDFIRE RISK ML ARCHITECTURE                     |
+-----------------------------------------------------------------------------------+
|  [1. VIIRS Ingestion]   -->   [2. Preprocessing]   -->   [3. 23 Features]         |
|  • 2,550 Satellite Rows       • Median Imputation        • Thermal Deltas         |
|  • 5 Hotspot Zones            • Confidence Mapping       • Log FRP & Sqrt FRP     |
|                               • Datetime Conversion      • KMeans (k=8) & Cyclical|
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|  [4. Composite Risk Index]  -->  [5. Leakage-Free Split]  -->  [6. 4 ML Classifiers]|
|  • 45% Ti4 Anomaly               • 80% Train (2,040)           • LightGBM         |
|  • 40% Log FRP                   • 20% Test (510)              • Random Forest    |
|  • 15% Confidence Weight         • StandardScaler (Train Only) • XGBoost          |
|  • Tiers: Low/Med/High/Extreme                                 • ANN (MLP)        |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|  [7. FastAPI Backend (Port 8000)]    -->    [8. React + Globe.gl 3D UI (Port 3000)]|
|  • /api/predict (Consensus Engine)          • Rotating 3D Globe with FRP Spikes   |
|  • /api/models/evaluation (Metrics/CM)      • Live Parameter Predictor Sliders    |
|  • /api/data/globe-points (GeoJSON Feed)    • Confusion Matrix & Feature Panels   |
+-----------------------------------------------------------------------------------+
```

---

## 📁 Repository Structure

```text
viirs_fire_risk_app/
├── backend/
│   ├── dataset_generator.py      # Synthetic NASA VIIRS data generator
│   ├── preprocessing.py          # Cleaning, imputation, confidence encoding
│   ├── feature_engineering.py    # 23-feature derivation & spatial clustering
│   ├── risk_labeling.py          # Physical composite risk formula
│   ├── models.py                 # RF, XGBoost, LightGBM, ANN implementations
│   ├── evaluation.py             # Metrics, confusion matrices, feature importances
│   ├── predictor.py              # Single-point inference & consensus engine
│   ├── pipeline.py               # Orchestrator running steps 1 to 8
│   ├── main.py                   # FastAPI REST API server
│   └── tests/
│       └── test_pipeline.py      # Unit test suite (5/5 passing)
├── data/
│   └── viirs_fire_data.csv       # NASA VIIRS active fire dataset (2,550 rows)
├── docs/                         # PBL Submission Deliverables
│   ├── PBL_Report.docx           # Official PBL Report (with institutional watermarks & stamps)
│   ├── PBL_Poster.pdf            # A3 Landscape Academic Poster (Print-Ready PDF)
│   ├── PBL_Poster.html           # A3 Landscape Academic Poster (HTML Source)
│   └── PBL_Voiceover_Script.md   # 3-5 Minute Voice-Over Video Presentation Script
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InteractiveGlobe.jsx          # Three.js / Globe.gl 3D Earth
│   │   │   ├── ModelEvaluationDashboard.jsx  # Recharts benchmarks & confusion matrix
│   │   │   ├── FireRiskPredictor.jsx         # Live telemetry sliders & presets
│   │   │   └── DataPipelineInspector.jsx     # 5-stage pipeline visualizer
│   │   ├── App.jsx                           # Main dashboard & tab routing
│   │   └── index.css                         # Tailwind CSS styling
│   ├── package.json
│   └── vite.config.js
├── run_model.py                  # Standalone CLI runner for terminal testing
├── start_backend.bat             # 1-Click launcher for FastAPI server
├── start_frontend.bat            # 1-Click launcher for React Vite dashboard
├── requirements.txt              # Python dependencies
└── README.md
```

---

## ⚡ How to Run

### Option 1: Run ML Models in Terminal Directly

To train the models, inspect metrics, and test sample predictions in your console:

```bash
python run_model.py
```

Or execute the pipeline directly:
```bash
python -m backend.pipeline
```

---

### Option 2: Run Full Web Dashboard & 3D Interactive Globe

#### 1. Start the FastAPI Backend (Terminal 1)
```bash
python -m backend.main
```
*Backend runs on `http://localhost:8000` with interactive OpenAPI docs at `http://localhost:8000/docs`.*

#### 2. Start the React 3D Globe Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 🧪 Unit Tests

Run the backend test suite:
```bash
pytest backend/tests -v
```

---

## 👥 Project Team & Academic Credentials

- **Students:**
  - **Hrishikesh Y N** — Reg. No: `2104251040304` *(ML Pipeline, Feature Engineering & Model Optimization)*
  - **Jenish Jeba** — Reg. No: `2105251040354` *(FastAPI Backend, React + Globe.gl 3D UI & Integration)*
- **Class / Semester:** II Year / III Semester / Section L (Computer Science and Engineering)
- **Institution:** **Chennai Institute of Technology (CIT)**, Chennai – 600069
- **Faculty Mentor & Project Co-ordinator:** **Dr. Prasanna** (Associate Professor, Dept. of CSE)
- **Class Advisor:** **Ms. Geeta**
- **Head of Department:** **Dr. S. Pavithra, M.E., Ph.D.**
- **Academic Year:** 2025–2026

---

## 📄 License

This project is developed for academic purposes under the Project-Based Learning curriculum at Chennai Institute of Technology.
