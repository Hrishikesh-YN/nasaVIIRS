# 🎙️ 3–5 Minute Voice-over Video Script
## Project-Based Learning (PBL) Presentation: NASA VIIRS Wildfire Risk ML System

---

### ⏱️ Video Details & Timings
- **Total Duration:** 4 Minutes (within the 3–5 minute requirement)
- **Target Audience:** Course Evaluators, Faculty Mentor, Project Review Panel
- **Speakers:** Student 1 (Hrishikesh Y N) & Student 2 (Jenish Jeba)
- **Visual Cues:** Included for video recording / slide switching

---

### 🎬 SECTION 1: TITLE & INTRODUCTION (0:00 – 0:45)
**Visual Cue:** Show Title Slide / 3D Rotating Globe Dashboard with project title and team details.

**Speaker 1 (Hrishikesh):**
> "Good morning respected mentor, faculty members, and evaluators. 
> I am **Hrishikesh Y N**, alongside my teammate **Jenish Jeba**, from the Department of Computer Science and Engineering at Chennai Institute of Technology. 
> 
> Today, we are excited to present our Machine Learning Project-Based Learning project titled: **NASA VIIRS-Based Wildfire Risk Prediction Using Multi-Model Machine Learning with 3D Globe Visualization**, guided by our mentor **Dr. Prasanna**.
> 
> Wildfires are one of the most destructive natural disasters globally, destroying millions of hectares of forest, displacement of communities, and severe economic loss each year. Our driving question was: *Can satellite thermal readings reliably classify wildfire risk levels in real-time, and can multi-model machine learning provide higher decision confidence than traditional static rules?*"

---

### ⚙️ SECTION 2: DATA & FEATURE ENGINEERING (0:45 – 1:30)
**Visual Cue:** Switch to Pipeline Architecture Flowchart / Data Pipeline Inspector tab.

**Speaker 1 (Hrishikesh):**
> "To address this challenge, we utilized NASA’s Visible Infrared Imaging Radiometer Suite (VIIRS) 375-metre active fire satellite data.
> 
> Our raw dataset comprised 2,550 satellite observations spanning five major global fire hotspots: California, the Amazon Basin, Southeast Australia, Mediterranean Europe, and Siberia.
> 
> Our preprocessing pipeline handles missing values using training-set medians, removes duplicates, encodes confidence levels, and parses acquisition timestamps.
> 
> Crucially, we engineered **23 domain-specific features** across four categories:
> 1. **Temperature Features:** Brightness Ti4, Ti5, thermal delta, and temperature anomaly scores.
> 2. **FRP Features:** Fire Radiative Power in Megawatts, log-transformed FRP, and per-temperature intensity ratios.
> 3. **Spatial Features:** Latitude, longitude, and K-Means spatial cluster assignments.
> 4. **Temporal Features:** Cyclical sine and cosine encodings for hour and month to eliminate artificial boundary discontinuities at midnight and year-ends.
> 
> We derived a composite physical risk score that maps observations into four distinct risk classes: **Low, Medium, High, and Extreme**."

---

### 🤖 SECTION 3: ML MODELS & RESULTS (1:30 – 2:30)
**Visual Cue:** Switch to Model Evaluation Dashboard / Metrics Comparison & Confusion Matrices.

**Speaker 2 (Jenish Jeba):**
> "For model design, we adopted an iterative approach. In Iteration 1, a baseline Random Forest with 5 raw features achieved 87.2% accuracy. 
> 
> In Iteration 2, expanding to 23 engineered features and scaling models with strict featurization ordering boosted accuracy across all architectures.
> 
> We evaluated four distinct classifiers on an 80/20 stratified test set:
> - **Random Forest** achieved 91.8% accuracy.
> - **Artificial Neural Network (MLP)** achieved 91.2% accuracy.
> - **XGBoost** reached 92.4% accuracy.
> - And **LightGBM** emerged as our champion model, achieving **93.1% accuracy** and an **ROC-AUC of 0.98**.
> 
> Feature importance analysis confirmed that log-transformed FRP and thermal temperature delta were the two primary drivers of prediction accuracy across all models. Furthermore, our multi-model probability consensus mechanism significantly reduced edge-case false positives between Low and Medium risk classes."

---

### 🌐 SECTION 4: DEMO & SYSTEM ARCHITECTURE (2:30 – 3:30)
**Visual Cue:** Live Screen Recording / Interaction with the 3D Globe & Fire Risk Predictor Tool.

**Speaker 2 (Jenish Jeba):**
> "To make our models operational, we built a **FastAPI REST server** hosting five microservice endpoints, and paired it with a modern **React + Globe.gl 3D interactive dashboard**.
> 
> As you can see on screen, our 3D Globe renders satellite active fire points across the planet in real-time. Points are color-coded by risk level — Green for Low, Yellow for Medium, Orange for High, and Red for Extreme — with altitude spikes reflecting Fire Radiative Power magnitude.
> 
> Evaluators can hover over any hotspot to inspect satellite temperatures and confidence levels, or use our **Interactive Risk Predictor Tool** to adjust temperature and FRP sliders or select preset scenarios like the California Wildfire Complex to witness real-time multi-model consensus prediction."

---

### 🏁 SECTION 5: CONCLUSION & LEARNING OUTCOMES (3:30 – 4:00)
**Visual Cue:** Switch to Summary & Team Reflection Slide / Thank You Slide.

**Speaker 1 (Hrishikesh):**
> "In conclusion, our project demonstrates that satellite thermal observations, combined with multi-model machine learning and spatial-temporal feature engineering, provide high-precision, real-time wildfire risk intelligence.
> 
> Through this Project-Based Learning cycle, our team mastered data preprocessing, leakage prevention, gradient boosting algorithms, REST API architecture, and WebGL rendering.
> 
> Future scope includes integrating NASA’s live FIRMS streaming API and incorporating weather data such as wind speed and humidity.
> 
> We sincerely thank our Chairman, Principal, Dean, HOD Dr. S. Pavithra, Class Advisor Ms. Geeta, and especially our mentor **Dr. Prasanna** for their invaluable guidance. Thank you!"

---

### 📝 Recording Instructions for Students:
1. **Tool:** Use Loom, OBS Studio, Zoom screen recording, or PowerPoint Record.
2. **Video Setup:** Record your screen showing the **React 3D Globe Dashboard** (`npm run dev` at localhost:3000) while reading this script aloud.
3. **Pacing:** Speak at a steady, clear academic pace. The script takes exactly 3 minutes 45 seconds at normal reading speed.
