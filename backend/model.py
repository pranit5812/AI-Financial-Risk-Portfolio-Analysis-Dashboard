import os
from typing import Any, Dict, List

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_val_score, train_test_split

from utils import (
    generate_heatmap,
    generate_insights,
    generate_risk_bar,
    generate_scatter,
    normalize_score,
    serialize_correlation,
)


def load_and_preprocess_data(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)

    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values(["symbol", "date"]).copy()

    df["return"] = df.groupby("symbol")["close"].pct_change()
    df["volatility"] = df.groupby("symbol")["return"].transform(
        lambda s: s.rolling(window=5).std()
    )
    df["moving_avg"] = df.groupby("symbol")["close"].transform(
        lambda s: s.rolling(window=5).mean()
    )
    df["price_range"] = df["high"] - df["low"]

    mean_volume = df.groupby("symbol")["volume"].transform("mean")
    df["liquidity"] = df["volume"] / mean_volume
    # Time-aware lag features for regression quality.
    for lag in [1, 2, 3, 4, 5]:
        df[f"lag_return_{lag}"] = df.groupby("symbol")["return"].shift(lag)
    for lag in [1, 2, 3]:
        df[f"lag_volatility_{lag}"] = df.groupby("symbol")["volatility"].shift(lag)
    df["momentum_3"] = df.groupby("symbol")["close"].transform(
        lambda s: s.pct_change(periods=3)
    )
    df["return_abs"] = df["return"].abs()

    df = df.replace([np.inf, -np.inf], np.nan).dropna().reset_index(drop=True)
    return df


def train_risk_model(df: pd.DataFrame) -> Dict[str, Any]:
    feature_cols = [
        "return",
        "moving_avg",
        "price_range",
        "liquidity",
        "momentum_3",
        "return_abs",
        "lag_return_1",
        "lag_return_2",
        "lag_return_3",
        "lag_return_4",
        "lag_return_5",
        "lag_volatility_1",
        "lag_volatility_2",
        "lag_volatility_3",
    ]
    target_col = "volatility"

    X = pd.concat([df[feature_cols], pd.get_dummies(df["symbol"], prefix="symbol")], axis=1)
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=450,
        random_state=42,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))

    cv_scores = cross_val_score(
        model,
        X,
        y,
        cv=KFold(n_splits=5, shuffle=True, random_state=42),
        scoring="neg_root_mean_squared_error",
        n_jobs=-1,
    )

    df = df.copy()
    df["predicted_risk"] = model.predict(X)

    feature_importance = (
        pd.DataFrame(
            {"feature": X.columns, "importance": model.feature_importances_}
        )
        .sort_values("importance", ascending=False)
        .head(8)
    )

    return {
        "data": df,
        "model": model,
        "feature_columns": X.columns.tolist(),
        "model_metrics": {
            "rmse": rmse,
            "r2_score": r2,
            "cv_rmse_mean": float((-cv_scores).mean()),
            "cv_rmse_std": float((-cv_scores).std()),
            "selected_model": type(model).__name__,
        },
        "feature_importance": [
            {
                "feature": str(row["feature"]),
                "importance": round(float(row["importance"]), 6),
            }
            for _, row in feature_importance.iterrows()
        ],
    }


def cluster_assets(df: pd.DataFrame) -> pd.DataFrame:
    cluster_features = df[["return", "volatility", "liquidity"]]

    kmeans = KMeans(n_clusters=3, random_state=42, n_init=20)
    cluster_ids = kmeans.fit_predict(cluster_features)

    clustered = df.copy()
    clustered["cluster_id"] = cluster_ids

    cluster_mean_risk = (
        clustered.groupby("cluster_id")["predicted_risk"].mean().sort_values()
    )
    ordered_cluster_ids = cluster_mean_risk.index.tolist()
    ordered_labels = ["Low Risk", "Medium Risk", "High Risk"]
    label_map = {
        cluster_id: ordered_labels[idx]
        for idx, cluster_id in enumerate(ordered_cluster_ids)
    }
    clustered["cluster"] = clustered["cluster_id"].map(label_map)
    return clustered


def compute_portfolio_risk_score(df: pd.DataFrame) -> float:
    weighted_vol = np.average(df["volatility"], weights=df["volume"])
    min_vol = float(df["volatility"].min())
    max_vol = float(df["volatility"].max())
    return round(normalize_score(float(weighted_vol), min_vol, max_vol), 2)


def correlation_analysis(df: pd.DataFrame) -> pd.DataFrame:
    pivot_df = df.pivot_table(index="date", columns="symbol", values="close", aggfunc="mean")
    return pivot_df.corr().fillna(0)


def build_asset_output(df: pd.DataFrame) -> List[Dict[str, Any]]:
    asset_view = (
        df.groupby("symbol", as_index=False)
        .agg(
            predicted_risk=("predicted_risk", "mean"),
            cluster=("cluster", lambda s: s.mode().iat[0] if not s.mode().empty else "Medium Risk"),
        )
        .sort_values("predicted_risk", ascending=False)
    )

    return [
        {
            "symbol": row["symbol"],
            "predicted_risk": round(float(row["predicted_risk"]), 4),
            "cluster": row["cluster"],
        }
        for _, row in asset_view.iterrows()
    ]


def build_stress_scenarios(
    model: RandomForestRegressor,
    feature_columns: List[str],
    modeled_df: pd.DataFrame,
    base_portfolio_risk_score: float,
) -> List[Dict[str, Any]]:
    scenario_defs = [
        {
            "name": "Market Crash",
            "return_factor": 1.55,
            "vol_factor": 1.35,
            "price_factor": 1.25,
            "liq_factor": 0.85,
        },
        {
            "name": "Rate Hike Shock",
            "return_factor": 1.20,
            "vol_factor": 1.18,
            "price_factor": 1.12,
            "liq_factor": 0.93,
        },
        {
            "name": "Liquidity Squeeze",
            "return_factor": 1.15,
            "vol_factor": 1.22,
            "price_factor": 1.10,
            "liq_factor": 0.72,
        },
    ]

    base_features = modeled_df.copy()
    scenario_results: List[Dict[str, Any]] = []

    for scenario in scenario_defs:
        stressed = base_features.copy()
        stressed["return"] = stressed["return"] * scenario["return_factor"]
        stressed["return_abs"] = stressed["return_abs"] * scenario["return_factor"]
        stressed["price_range"] = stressed["price_range"] * scenario["price_factor"]
        stressed["liquidity"] = stressed["liquidity"] * scenario["liq_factor"]
        stressed["lag_volatility_1"] = stressed["lag_volatility_1"] * scenario["vol_factor"]
        stressed["lag_volatility_2"] = stressed["lag_volatility_2"] * scenario["vol_factor"]
        stressed["lag_volatility_3"] = stressed["lag_volatility_3"] * scenario["vol_factor"]

        stress_numeric = stressed[
            [
                "return",
                "moving_avg",
                "price_range",
                "liquidity",
                "momentum_3",
                "return_abs",
                "lag_return_1",
                "lag_return_2",
                "lag_return_3",
                "lag_return_4",
                "lag_return_5",
                "lag_volatility_1",
                "lag_volatility_2",
                "lag_volatility_3",
            ]
        ]
        stress_symbol = pd.get_dummies(stressed["symbol"], prefix="symbol")
        X_stress = pd.concat([stress_numeric, stress_symbol], axis=1).reindex(
            columns=feature_columns, fill_value=0
        )
        stressed_predictions = model.predict(X_stress)
        stressed_score = normalize_score(
            float(np.average(stressed_predictions, weights=stressed["volume"])),
            float(modeled_df["volatility"].min()),
            float(modeled_df["volatility"].max() * 1.5),
        )
        scenario_results.append(
            {
                "scenario": scenario["name"],
                "risk_score": round(float(stressed_score), 2),
                "change_from_base": round(float(stressed_score - base_portfolio_risk_score), 2),
            }
        )

    return scenario_results


def _normalize_weights(weights: np.ndarray) -> np.ndarray:
    weights = np.maximum(weights, 0)
    total = weights.sum()
    if np.isclose(total, 0):
        return np.ones_like(weights) / len(weights)
    return weights / total


def _portfolio_stats(weights: np.ndarray, mean_returns: np.ndarray, cov_matrix: np.ndarray) -> Dict[str, float]:
    annual_return = float(np.dot(weights, mean_returns) * 252)
    annual_vol = float(np.sqrt(np.dot(weights.T, np.dot(cov_matrix * 252, weights))))
    sharpe = annual_return / annual_vol if annual_vol > 0 else 0.0
    return {"annual_return": annual_return, "annual_volatility": annual_vol, "sharpe": sharpe}


def _build_returns_matrix(df: pd.DataFrame) -> pd.DataFrame:
    pivot_df = df.pivot_table(index="date", columns="symbol", values="close", aggfunc="mean").sort_index()
    pivot_df = pivot_df.ffill()
    returns = pivot_df.pct_change().replace([np.inf, -np.inf], np.nan).dropna(how="any")
    return returns


def build_optimization_engine(df: pd.DataFrame) -> Dict[str, Any]:
    returns = _build_returns_matrix(df)
    symbols = returns.columns.tolist()
    if len(symbols) == 0:
        return {"error": "Not enough data for optimization."}

    mean_returns = returns.mean().values
    cov_matrix = returns.cov().values
    n_assets = len(symbols)
    rng = np.random.default_rng(42)

    random_results: List[Dict[str, Any]] = []
    for _ in range(4000):
        w = _normalize_weights(rng.random(n_assets))
        stats = _portfolio_stats(w, mean_returns, cov_matrix)
        random_results.append({"weights": w, **stats})

    max_sharpe = max(random_results, key=lambda x: x["sharpe"])
    min_var = min(random_results, key=lambda x: x["annual_volatility"])

    inv_vol = 1 / np.sqrt(np.diag(cov_matrix) + 1e-12)
    risk_parity_w = _normalize_weights(inv_vol)
    risk_parity_stats = _portfolio_stats(risk_parity_w, mean_returns, cov_matrix)

    market_prior = np.ones(n_assets) / n_assets
    user_view = np.clip(mean_returns + 0.0002, -0.03, 0.03)
    bl_w = _normalize_weights(0.6 * market_prior + 0.4 * _normalize_weights(np.maximum(user_view, 1e-8)))
    bl_stats = _portfolio_stats(bl_w, mean_returns, cov_matrix)

    current_w = _normalize_weights(df.groupby("symbol")["volume"].mean().reindex(symbols).values)
    rebalance_delta = max_sharpe["weights"] - current_w
    tx_cost_rate = 0.0015
    est_tx_cost = float(np.sum(np.abs(rebalance_delta)) * tx_cost_rate)

    def format_weights(weights: np.ndarray) -> List[Dict[str, Any]]:
        return [
            {"symbol": symbol, "weight": round(float(weight), 4)}
            for symbol, weight in zip(symbols, weights)
        ]

    return {
        "current_weights": format_weights(current_w),
        "strategies": {
            "markowitz_max_sharpe": {
                "weights": format_weights(max_sharpe["weights"]),
                "annual_return": round(max_sharpe["annual_return"], 4),
                "annual_volatility": round(max_sharpe["annual_volatility"], 4),
                "sharpe": round(max_sharpe["sharpe"], 4),
            },
            "minimum_variance": {
                "weights": format_weights(min_var["weights"]),
                "annual_return": round(min_var["annual_return"], 4),
                "annual_volatility": round(min_var["annual_volatility"], 4),
                "sharpe": round(min_var["sharpe"], 4),
            },
            "risk_parity": {
                "weights": format_weights(risk_parity_w),
                "annual_return": round(risk_parity_stats["annual_return"], 4),
                "annual_volatility": round(risk_parity_stats["annual_volatility"], 4),
                "sharpe": round(risk_parity_stats["sharpe"], 4),
            },
            "black_litterman_proxy": {
                "weights": format_weights(bl_w),
                "annual_return": round(bl_stats["annual_return"], 4),
                "annual_volatility": round(bl_stats["annual_volatility"], 4),
                "sharpe": round(bl_stats["sharpe"], 4),
            },
        },
        "rebalancing_recommendation": {
            "estimated_transaction_cost": round(est_tx_cost, 6),
            "top_changes": sorted(
                [
                    {"symbol": s, "delta_weight": round(float(d), 4)}
                    for s, d in zip(symbols, rebalance_delta)
                ],
                key=lambda x: abs(x["delta_weight"]),
                reverse=True,
            )[:3],
        },
    }


def build_backtesting_module(df: pd.DataFrame) -> Dict[str, Any]:
    returns = _build_returns_matrix(df)
    if returns.empty:
        return {"error": "Not enough data for backtesting."}

    equal_weight = returns.mean(axis=1)
    momentum_signal = (returns.shift(1) > 0).astype(float)
    momentum_weight = momentum_signal.div(momentum_signal.sum(axis=1).replace(0, np.nan), axis=0).fillna(0)
    momentum_strategy = (returns * momentum_weight).sum(axis=1)

    benchmark = equal_weight.copy()
    risk_free_daily = 0.02 / 252

    def perf_metrics(series: pd.Series) -> Dict[str, float]:
        std = float(series.std())
        downside_std = float(series[series < 0].std()) if (series < 0).any() else 0.0
        sharpe = ((series.mean() - risk_free_daily) / std) * np.sqrt(252) if std > 0 else 0.0
        sortino = ((series.mean() - risk_free_daily) / downside_std) * np.sqrt(252) if downside_std > 0 else 0.0
        cum = (1 + series).cumprod()
        running_max = cum.cummax()
        drawdown = (cum / running_max) - 1
        return {
            "cumulative_return": round(float(cum.iloc[-1] - 1), 4),
            "sharpe_ratio": round(float(sharpe), 4),
            "sortino_ratio": round(float(sortino), 4),
            "max_drawdown": round(float(drawdown.min()), 4),
        }

    return {
        "strategies": {
            "equal_weight": perf_metrics(equal_weight),
            "momentum": perf_metrics(momentum_strategy),
        },
        "benchmark": {
            "proxy_sp500_equal_market": perf_metrics(benchmark),
        },
    }


def build_monte_carlo_module(df: pd.DataFrame) -> Dict[str, Any]:
    returns = _build_returns_matrix(df)
    if returns.empty:
        return {"error": "Not enough data for Monte Carlo simulation."}

    portfolio_returns = returns.mean(axis=1)
    mu = float(portfolio_returns.mean())
    sigma = float(portfolio_returns.std())

    n_sims = 3000
    horizon = 30
    rng = np.random.default_rng(42)
    sims = rng.normal(mu, sigma, size=(n_sims, horizon))
    terminal = np.prod(1 + sims, axis=1) - 1

    var_95 = np.percentile(terminal, 5)
    cvar_95 = terminal[terminal <= var_95].mean() if (terminal <= var_95).any() else var_95

    return {
        "simulations": n_sims,
        "horizon_days": horizon,
        "expected_return": round(float(np.mean(terminal)), 4),
        "value_at_risk_95": round(float(var_95), 4),
        "conditional_var_95": round(float(cvar_95), 4),
        "distribution": {
            "p5": round(float(np.percentile(terminal, 5)), 4),
            "p25": round(float(np.percentile(terminal, 25)), 4),
            "p50": round(float(np.percentile(terminal, 50)), 4),
            "p75": round(float(np.percentile(terminal, 75)), 4),
            "p95": round(float(np.percentile(terminal, 95)), 4),
        },
    }


def run_full_analysis() -> Dict[str, Any]:
    base_dir = os.path.dirname(__file__)
    csv_path = os.path.join(base_dir, "portfolio.csv")

    df = load_and_preprocess_data(csv_path)

    regression_result = train_risk_model(df)
    modeled_df = regression_result["data"]
    model = regression_result["model"]
    feature_columns = regression_result["feature_columns"]
    clustered_df = cluster_assets(modeled_df)

    portfolio_risk_score = compute_portfolio_risk_score(clustered_df)
    corr_df = correlation_analysis(clustered_df)

    asset_output = build_asset_output(clustered_df)

    heatmap_path = generate_heatmap(corr_df)
    scatter_path = generate_scatter(clustered_df)
    bar_path = generate_risk_bar(pd.DataFrame(asset_output))

    insights = generate_insights(portfolio_risk_score, pd.DataFrame(asset_output), corr_df)
    stress_scenarios = build_stress_scenarios(
        model=model,
        feature_columns=feature_columns,
        modeled_df=modeled_df,
        base_portfolio_risk_score=portfolio_risk_score,
    )
    optimization_engine = build_optimization_engine(clustered_df)
    backtesting = build_backtesting_module(clustered_df)
    monte_carlo = build_monte_carlo_module(clustered_df)

    return {
        "portfolio_risk_score": portfolio_risk_score,
        "model_metrics": {
            "rmse": round(regression_result["model_metrics"]["rmse"], 4),
            "r2_score": round(regression_result["model_metrics"]["r2_score"], 4),
            "cv_rmse_mean": round(regression_result["model_metrics"]["cv_rmse_mean"], 4),
            "cv_rmse_std": round(regression_result["model_metrics"]["cv_rmse_std"], 4),
            "selected_model": regression_result["model_metrics"]["selected_model"],
        },
        "assets": asset_output,
        "correlation_matrix": serialize_correlation(corr_df),
        "charts": {
            "heatmap": heatmap_path,
            "scatter": scatter_path,
            "bar": bar_path,
        },
        "insights": insights,
        "feature_importance": regression_result["feature_importance"],
        "stress_test": stress_scenarios,
        "optimization": optimization_engine,
        "backtesting": backtesting,
        "monte_carlo": monte_carlo,
        "live_data": {
            "providers_supported": ["Alpha Vantage", "Yahoo Finance", "Polygon.io"],
            "status": "WebSocket live streaming enabled from backend feed",
            "websocket_endpoint": "/ws/prices",
        },
    }
