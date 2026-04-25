import os
import asyncio
import random
from typing import Any, Dict

import pandas as pd
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from model import run_full_analysis


BASE_DIR = os.path.dirname(__file__)
STATIC_DIR = os.path.join(BASE_DIR, "static")
os.makedirs(STATIC_DIR, exist_ok=True)

app = FastAPI(title="AI Financial Risk Portfolio Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

ANALYSIS_CACHE: Dict[str, Any] = {
    "csv_mtime": None,
    "result": None,
}


@app.get("/analyze")
def analyze_portfolio(force_refresh: bool = False):
    try:
        csv_path = os.path.join(BASE_DIR, "portfolio.csv")
        csv_mtime = os.path.getmtime(csv_path)

        should_use_cache = (
            (not force_refresh)
            and ANALYSIS_CACHE["result"] is not None
            and ANALYSIS_CACHE["csv_mtime"] == csv_mtime
        )
        if should_use_cache:
            cached_result = dict(ANALYSIS_CACHE["result"])
            cached_result["served_from_cache"] = True
            return cached_result

        result = run_full_analysis()
        ANALYSIS_CACHE["csv_mtime"] = csv_mtime
        ANALYSIS_CACHE["result"] = result

        response = dict(result)
        response["served_from_cache"] = False
        return response
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(exc)}") from exc


@app.get("/")
def health_check():
    return {"message": "Financial Risk Portfolio Analysis API is running"}


@app.websocket("/ws/prices")
async def websocket_prices(websocket: WebSocket):
    await websocket.accept()
    csv_path = os.path.join(BASE_DIR, "portfolio.csv")
    try:
        df = pd.read_csv(csv_path)
        df["date"] = pd.to_datetime(df["date"])
        latest = (
            df.sort_values(["symbol", "date"])
            .groupby("symbol", as_index=False)
            .tail(1)[["symbol", "close"]]
        )
        prices = {row["symbol"]: float(row["close"]) for _, row in latest.iterrows()}

        while True:
            payload = []
            for symbol, price in prices.items():
                drift = random.uniform(-0.005, 0.005)
                new_price = max(0.01, price * (1 + drift))
                prices[symbol] = new_price
                payload.append(
                    {
                        "symbol": symbol,
                        "price": round(new_price, 2),
                    }
                )
            await websocket.send_json({"type": "live_prices", "data": payload})
            await asyncio.sleep(1.5)
    except WebSocketDisconnect:
        return
