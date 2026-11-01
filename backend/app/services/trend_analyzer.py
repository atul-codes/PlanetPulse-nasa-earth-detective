
import numpy as np
import pymannkendall as mk

from scipy import stats
from datetime import datetime, timezone
from typing import List, Dict, Any


def _parse_date(date_string: str) -> datetime:
    """
    Parse ISO date and normalize timezone to UTC.
    Naive dates are interpreted as UTC.
    """

    if not isinstance(date_string, str):
        raise ValueError("Date must be a string.")

    date_string = date_string.strip()

    try:
        # Support YYYYMM format
        if len(date_string) == 6 and date_string.isdigit():
            dt = datetime.strptime(date_string, "%Y%m")
        # Support YYYY-MM format
        elif len(date_string) == 7 and date_string[4] == "-":
            dt = datetime.strptime(date_string, "%Y-%m")
        else:
            dt = datetime.fromisoformat(
                date_string.replace("Z", "+00:00")
            )
    except ValueError:
        raise ValueError(f"Invalid ISO date: {date_string}")

    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)

    return dt.astimezone(timezone.utc)


def _decimal_year(dt: datetime) -> float:
    """
    Convert datetime into decimal year.
    Handles leap years correctly.
    """

    start = datetime(
        dt.year, 1, 1, tzinfo=timezone.utc
    )

    end = datetime(
        dt.year + 1, 1, 1, tzinfo=timezone.utc
    )

    elapsed = (dt - start).total_seconds()
    duration = (end - start).total_seconds()

    return dt.year + elapsed / duration


def _classify_trend(
    mk_trend: str,
    sen_slope: float,
    significant: bool
) -> str:
    """
    Classify trend using Mann-Kendall direction
    and Sen's slope.
    """

    if significant:
        if mk_trend == "increasing":
            return "Significant Increasing Trend"

        if mk_trend == "decreasing":
            return "Significant Decreasing Trend"

        return "No Significant Trend"

    if sen_slope > 0:
        return "Non-significant Increasing Trend"

    if sen_slope < 0:
        return "Non-significant Decreasing Trend"

    return "No Clear Monotonic Trend"


def analyze_trend(
    observations: List[Dict[str, Any]],
    alpha: float = 0.05
) -> Dict[str, Any]:
    """
    Scientific Earth Observation Trend Analysis.

    Methods:
    1. OLS Linear Regression
    2. Original Mann-Kendall Test
    3. Sen's Slope Estimator
    4. Confidence Intervals
    5. Autocorrelation Diagnostics

    Time unit:
    - Actual elapsed years

    Expected input:
    [
        {"date": "2020-01-01", "value": 25.5},
        {"date": "2020-02-01", "value": 26.1}
    ]
    """

    # ----------------------------------
    # 1. Validate significance level
    # ----------------------------------

    if not isinstance(alpha, (int, float)):
        raise ValueError("Alpha must be numeric.")

    if not np.isfinite(alpha) or not 0 < alpha < 1:
        raise ValueError("Alpha must be between 0 and 1.")

    # ----------------------------------
    # 2. Validate observation count
    # ----------------------------------

    if not observations or len(observations) < 4:
        return {
            "status": "INSUFFICIENT_DATA",
            "trendClassification": "Insufficient Data",
            "observationCount": len(observations or []),
            "message": "At least 4 valid observations are required."
        }

    # ----------------------------------
    # 3. Parse and validate observations
    # ----------------------------------

    parsed = []

    for obs in observations:

        if not isinstance(obs, dict):
            raise ValueError("Each observation must be a dictionary.")

        if "date" not in obs or "value" not in obs:
            raise ValueError(
                "Each observation must contain date and value."
            )

        date = _parse_date(obs["date"])

        try:
            value = float(obs["value"])
        except (ValueError, TypeError):
            raise ValueError("Observation value must be numeric.")

        if not np.isfinite(value):
            raise ValueError("Non-finite observation detected.")

        parsed.append({
            "date": date,
            "value": value
        })

    # ----------------------------------
    # 4. Sort chronologically
    # ----------------------------------

    parsed.sort(key=lambda item: item["date"])

    dates = [item["date"] for item in parsed]

    # Duplicate timestamp validation
    if len(set(dates)) != len(dates):
        raise ValueError(
            "Duplicate observation timestamps detected."
        )

    y = np.array(
        [item["value"] for item in parsed],
        dtype=float
    )

    n = len(y)

    # ----------------------------------
    # 5. Convert actual dates to years
    # ----------------------------------

    x = np.array(
        [_decimal_year(date) for date in dates],
        dtype=float
    )

    duration_years = float(x[-1] - x[0])

    if duration_years <= 0:
        raise ValueError(
            "Observation period must be greater than zero."
        )

    # Center time for numerical stability
    x_centered = x - x[0]

    # ----------------------------------
    # 6. OLS Linear Regression
    # ----------------------------------

    lr = stats.linregress(x_centered, y)

    slope = float(lr.slope)
    intercept = float(lr.intercept)

    r_squared = float(lr.rvalue ** 2)
    lr_p_value = float(lr.pvalue)
    standard_error = float(lr.stderr)

    # Regression confidence interval
    dof = n - 2

    t_value = float(
        stats.t.ppf(1 - alpha / 2, dof)
    )

    lr_ci = [
        float(slope - t_value * standard_error),
        float(slope + t_value * standard_error)
    ]

    # ----------------------------------
    # 7. Mann-Kendall Test
    # ----------------------------------

    mk_result = mk.original_test(
        y,
        alpha=alpha
    )

    mk_trend = str(mk_result.trend)
    mk_p_value = float(mk_result.p)
    mk_z = float(mk_result.z)
    mk_s = float(mk_result.s)
    mk_var_s = float(mk_result.var_s)

    significant = bool(mk_result.h)

    # ----------------------------------
    # 8. Sen's Slope
    # ----------------------------------

    sen_result = stats.theilslopes(
        y,
        x_centered,
        alpha=1 - alpha
    )

    sen_slope = float(sen_result.slope)
    sen_intercept = float(sen_result.intercept)

    sen_ci = [
        float(sen_result.low_slope),
        float(sen_result.high_slope)
    ]

    # ----------------------------------
    # 9. Trend classification
    # ----------------------------------

    classification = _classify_trend(
        mk_trend=mk_trend,
        sen_slope=sen_slope,
        significant=significant
    )

    # ----------------------------------
    # 10. Estimated total change
    # ----------------------------------

    fitted_start = intercept

    fitted_end = (
        intercept + slope * duration_years
    )

    total_change = float(
        fitted_end - fitted_start
    )

    # Do not calculate percentage change for
    # Celsius or other interval-scale variables.

    # ----------------------------------
    # 11. Autocorrelation diagnostic
    # ----------------------------------

    residuals = y - (
        intercept + slope * x_centered
    )

    if n > 2 and np.std(residuals) > 0:
        residual_corr = float(
            np.corrcoef(
                residuals[:-1],
                residuals[1:]
            )[0, 1]
        )
    else:
        residual_corr = None

    # This is only a diagnostic, not an
    # autocorrelation-adjusted significance test.

    # ----------------------------------
    # 12. Fitted time series
    # ----------------------------------

    fitted_series = []

    for i in range(n):

        fitted_linear = (
            intercept + slope * x_centered[i]
        )

        fitted_sen = (
            sen_intercept +
            sen_slope * x_centered[i]
        )

        fitted_series.append({
            "date": parsed[i]["date"].isoformat(),
            "observed": float(y[i]),
            "linear": float(fitted_linear),
            "sen": float(fitted_sen)
        })

    # ----------------------------------
    # 13. Return scientific results
    # ----------------------------------

    return {
        "status": "SUCCESS",
        "trendClassification": classification,
        "isSignificant": significant,
        "significanceLevel": float(alpha),
        "confidenceLevel": float((1 - alpha) * 100),
        "observationCount": n,
        "startDate": dates[0].isoformat(),
        "endDate": dates[-1].isoformat(),
        "durationYears": duration_years,

        "linearRegression": {
            "slope": slope,
            "slopeUnit": "value/year",
            "intercept": intercept,
            "rSquared": r_squared,
            "pValue": lr_p_value,
            "standardError": standard_error,
            "confidenceInterval": lr_ci,
            "ci95": lr_ci if alpha == 0.05 else None,
            "totalChangeAbsolute": total_change

        },

        "mannKendall": {
            "trend": mk_trend,
            "pValue": mk_p_value,
            "zScore": mk_z,
            "sStatistic": mk_s,
            "varS": mk_var_s,
            "isSignificant": significant,
            "method": "Original Mann-Kendall"

        },

        "senSlope": {
            "slope": sen_slope,
            "slopeUnit": "value/year",
            "intercept": sen_intercept,
            "confidenceInterval": sen_ci,
            "ci95": sen_ci if alpha == 0.05 else None

        },

        "diagnostics": {
            "timeUnit": "years",
            "timeMethod": "Actual elapsed decimal years",
            "autocorrelationLag1": residual_corr,
            "autocorrelationAdjusted": False,
            "seasonalityAdjusted": False,
            "statisticalWarning": (
                "Original Mann-Kendall assumes independent "
                "observations. Serial autocorrelation and "
                "seasonality should be evaluated."
            )

        },

        "fittedSeries": fitted_series

    }
