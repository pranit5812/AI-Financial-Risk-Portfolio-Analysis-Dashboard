# AI Financial Risk Portfolio Analysis Dashboard

**Tagline:** Smart portfolio risk intelligence — from data to decisions in one interactive dashboard.

A comprehensive financial portfolio risk analysis and optimization platform built with:
- **React + Vite** frontend
- **FastAPI** backend
- **RandomForestRegressor** risk modeling
- Real-time **live prices** via WebSocket
- **Portfolio stress testing**, **feature importance**, **Monte Carlo**, and **backtesting** insights

---

## 🚀 What this project does

This project helps you:
- analyze portfolio risk from `backend/portfolio.csv`
- compute volume-weighted risk scores
- train and evaluate a machine learning risk model
- cluster assets by risk and liquidity
- visualize portfolio metrics, risk trends, and correlation charts
- generate interactive portfolio analysis reports
- stream simulated live prices in the dashboard

---

## 🔧 Project structure

- `backend/`
  - `main.py` — FastAPI server and `/analyze` API endpoint
  - `model.py` — portfolio preprocessing, risk modeling, clustering, stress scenarios
  - `portfolio.csv` — input dataset for analysis
  - `requirements.txt` — Python dependencies
- `frontend/`
  - `src/` — React app source files
  - `package.json` — frontend dependencies and scripts
  - `vite.config.js` — Vite app config
- `.gitignore` — ignored files for Node, Python, and editor artifacts

---

## ▶️ Run the app locally

### 1. Start the backend

Windows PowerShell:
```powershell
cd /d d:\guvi\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

macOS / Linux:
```bash
cd /d d:/guvi/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The backend will be available at `http://127.0.0.1:8000`.

### 2. Start the frontend

```bash
cd d:\guvi\frontend
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

---

## 💡 How to use the dashboard

1. Open the frontend in your browser.
2. Click **Run Analysis**.
3. Wait for the backend to compute risk metrics and return the data.
4. Explore the dashboard panels:
   - Portfolio risk score
   - Model performance metrics (RMSE, R²)
   - Live prices panel
   - Asset risk table
   - Stress testing scenarios
   - Feature importance
   - Optimization and Monte Carlo outputs
   - Backtesting and charts
5. Use **Export** and **Print Report** if available.

---

## 🧠 Backend API endpoints

- `GET /analyze` — runs the portfolio analysis and returns results
- `GET /` — health check endpoint
- `WebSocket /ws/prices` — simulated live asset prices stream

---

## 📁 Data source

The analysis uses `backend/portfolio.csv` as the input dataset. To analyze your own portfolio data:
1. replace the contents of `backend/portfolio.csv`
2. keep the same columns used by the model
3. restart the backend and run analysis again

---

## 🛠️ Notes

- The frontend expects the backend at `http://127.0.0.1:8000`.
- If you change the backend host or port, update `frontend/src/services/api.js`.
- The backend caches analysis results and re-runs only when `portfolio.csv` changes.

---

## ✅ Quick commands

```powershell
cd /d d:\guvi\backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 127.0.0.1 --port 8000

cd /d d:\guvi\frontend
npm install
npm run dev
```

---

## 📌 Recommended improvements

- add a `README` to `backend/` with API docs
- add `README` to `frontend/` with UI component descriptions
- add TypeScript support for stronger frontend types
- add automated tests for backend analysis and frontend components

---

## 🙌 You're ready

Your project is now documented with a detailed interactive README. Open the app and click **Run Analysis** to begin.
