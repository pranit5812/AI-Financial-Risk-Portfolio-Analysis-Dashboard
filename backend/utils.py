import os
from typing import Dict, List

import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

matplotlib.use("Agg")
sns.set_theme(style="whitegrid")

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")


def ensure_static_dir() -> None:
    os.makedirs(STATIC_DIR, exist_ok=True)


def normalize_score(value: float, min_value: float, max_value: float) -> float:
    if np.isclose(max_value, min_value):
        return 50.0
    normalized = (value - min_value) / (max_value - min_value)
    return float(np.clip(normalized * 100, 0, 100))


def generate_heatmap(correlation_df: pd.DataFrame) -> str:
    ensure_static_dir()
    output_path = os.path.join(STATIC_DIR, "heatmap.png")

    plt.figure(figsize=(10, 7), dpi=160)
    sns.heatmap(correlation_df, annot=True, cmap="coolwarm", fmt=".2f", linewidths=0.5)
    plt.title("Asset Correlation Heatmap", fontsize=14, fontweight="bold")
    plt.tight_layout()
    plt.savefig(output_path, bbox_inches="tight")
    plt.close()
    return "static/heatmap.png"


def generate_scatter(data: pd.DataFrame) -> str:
    ensure_static_dir()
    output_path = os.path.join(STATIC_DIR, "scatter.png")

    plt.figure(figsize=(10, 7), dpi=160)
    sns.scatterplot(
        data=data,
        x="return",
        y="volatility",
        hue="symbol",
        palette="viridis",
        alpha=0.9,
        s=75,
        edgecolor="white",
        linewidth=0.4,
    )
    plt.title("Return vs Volatility", fontsize=14, fontweight="bold")
    plt.xlabel("Return")
    plt.ylabel("Volatility")
    plt.tight_layout()
    plt.savefig(output_path, bbox_inches="tight")
    plt.close()
    return "static/scatter.png"


def generate_risk_bar(asset_df: pd.DataFrame) -> str:
    ensure_static_dir()
    output_path = os.path.join(STATIC_DIR, "bar.png")

    sorted_df = asset_df.sort_values("predicted_risk", ascending=False)
    plt.figure(figsize=(10, 7), dpi=160)
    sns.barplot(
        data=sorted_df,
        x="symbol",
        y="predicted_risk",
        hue="symbol",
        palette="magma",
        dodge=False,
        legend=False,
    )
    plt.title("Predicted Risk per Asset", fontsize=14, fontweight="bold")
    plt.xlabel("Symbol")
    plt.ylabel("Predicted Risk")
    plt.tight_layout()
    plt.savefig(output_path, bbox_inches="tight")
    plt.close()
    return "static/bar.png"


def generate_insights(
    portfolio_risk_score: float,
    asset_df: pd.DataFrame,
    correlation_df: pd.DataFrame,
) -> List[str]:
    insights: List[str] = []

    if portfolio_risk_score >= 70:
        insights.append("Portfolio risk is high. Consider reducing exposure to volatile assets.")
    elif portfolio_risk_score >= 40:
        insights.append("Portfolio risk is moderate. Monitor market fluctuations closely.")
    else:
        insights.append("Portfolio risk is relatively low under current market behavior.")

    top_high_risk = (
        asset_df.sort_values("predicted_risk", ascending=False)
        .head(3)["symbol"]
        .tolist()
    )
    if top_high_risk:
        insights.append(
            f"Top 3 high-risk assets: {', '.join(top_high_risk)}."
        )

    high_corr_pairs: List[str] = []
    cols = correlation_df.columns.tolist()
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            corr = correlation_df.iloc[i, j]
            if corr > 0.7:
                high_corr_pairs.append(f"{cols[i]}-{cols[j]} ({corr:.2f})")

    if high_corr_pairs:
        insights.append(
            "High correlation detected across assets: "
            + "; ".join(high_corr_pairs[:3])
            + ". Diversification is recommended."
        )
    else:
        insights.append("Correlation structure suggests reasonable diversification.")

    return insights


def serialize_correlation(correlation_df: pd.DataFrame) -> Dict[str, Dict[str, float]]:
    return {
        row_label: {
            col_label: float(value) for col_label, value in row_data.items()
        }
        for row_label, row_data in correlation_df.round(4).to_dict(orient="index").items()
    }
