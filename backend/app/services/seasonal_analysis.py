
import numpy as np

from datetime import datetime
from typing import List, Dict, Any


def _parse_date(date_string: str) -> datetime:
    """
    Supports:
    YYYYMM
    YYYY-MM
    YYYY-MM-DD
    ISO datetime strings
    """

    if not isinstance(date_string, str):
        raise ValueError("Date must be a string.")

    date_string = date_string.strip()

    try:
        # YYYYMM format
        if len(date_string) == 6 and date_string.isdigit():
            return datetime.strptime(date_string, "%Y%m")

        # YYYY-MM format
        if len(date_string) == 7:
            return datetime.strptime(date_string, "%Y-%m")

        # ISO date / datetime
        return datetime.fromisoformat(
            date_string.replace("Z", "+00:00")
        )

    except ValueError:
        raise ValueError(f"Invalid date: {date_string}")


def deseasonalize_series(
    observations: List[Dict[str, Any]],
    min_years: int = 2,
    min_samples_per_month: int = 2
) -> Dict[str, Any]:
    """
    Monthly climatological deseasonalization.

    Formula:

    Deseasonalized =
        Observed Value - Monthly Climatology + Overall Mean

    Features:
    1. ISO date validation.
    2. YYYYMM and YYYY-MM support.
    3. NaN and Infinity filtering.
    4. Duplicate timestamp detection.
    5. Chronological sorting.
    6. Monthly climatology calculation.
    7. Seasonal anomaly calculation.
    8. Seasonal coverage reporting.
    9. Minimum yearly coverage validation.

    Returns:
        Seasonal profile and deseasonalized time series.
    """

    # ----------------------------------
    # 1. Validate input
    # ----------------------------------

    if not isinstance(observations, list):
        raise ValueError("Observations must be a list.")

    if not isinstance(min_years, int) or min_years < 1:
        raise ValueError("min_years must be a positive integer.")

    if (
        not isinstance(min_samples_per_month, int)
        or min_samples_per_month < 1
    ):
        raise ValueError(
            "min_samples_per_month must be positive."
        )

    if not observations:
        return {
            "status": "SKIPPED",
            "message": "No observations provided.",
            "series": [],
            "seasonalCycle": {}
        }

    # ----------------------------------
    # 2. Initialize data structures
    # ----------------------------------

    valid_data = {}

    report = {
        "inputCount": len(observations),
        "validCount": 0,
        "invalidDates": 0,
        "invalidValues": 0,
        "duplicateDates": 0
    }

    # ----------------------------------
    # 3. Validate observations
    # ----------------------------------

    for obs in observations:

        if not isinstance(obs, dict):
            report["invalidValues"] += 1
            continue

        if "date" not in obs or "value" not in obs:
            report["invalidValues"] += 1
            continue

        try:
            parsed_date = _parse_date(str(obs["date"]))

        except (ValueError, TypeError):
            report["invalidDates"] += 1
            continue

        raw_value = obs["value"]

        if raw_value is None or isinstance(raw_value, bool):
            report["invalidValues"] += 1
            continue

        try:
            value = float(raw_value)

        except (ValueError, TypeError, OverflowError):
            report["invalidValues"] += 1
            continue

        if not np.isfinite(value) or value <= -900:
            report["invalidValues"] += 1
            continue

        # Normalize timestamps to month-level keys.
        # This is appropriate for monthly observations.
        timestamp_key = (
            parsed_date.year,
            parsed_date.month
        )

        if timestamp_key in valid_data:
            report["duplicateDates"] += 1
            continue

        valid_data[timestamp_key] = {
            "date": str(obs["date"]),
            "parsedDate": parsed_date,
            "value": value
        }

    # ----------------------------------
    # 4. Sort observations
    # ----------------------------------

    cleaned = sorted(
        valid_data.values(),
        key=lambda item: item["parsedDate"]
    )

    report["validCount"] = len(cleaned)

    # ----------------------------------
    # 5. Check minimum data
    # ----------------------------------

    if not cleaned:
        return {
            "status": "SKIPPED",
            "message": "No valid observations available.",
            "series": [],
            "seasonalCycle": {},
            "qualityReport": report
        }

    years = sorted({
        item["parsedDate"].year
        for item in cleaned
    })

    if len(years) < min_years:
        return {
            "status": "SKIPPED",
            "message": (
                f"At least {min_years} distinct years "
                "are required for climatological "
                "deseasonalization."
            ),
            "observationCount": len(cleaned),
            "yearsAvailable": len(years),
            "series": [],
            "seasonalCycle": {},
            "qualityReport": report
        }

    # ----------------------------------
    # 6. Create monthly buckets
    # ----------------------------------

    month_buckets = {
        month: []
        for month in range(1, 13)
    }

    for item in cleaned:

        month = item["parsedDate"].month

        month_buckets[month].append(
            item["value"]
        )

    # ----------------------------------
    # 7. Calculate monthly climatology
    # ----------------------------------

    monthly_means = {}
    monthly_counts = {}

    for month in range(1, 13):

        values = month_buckets[month]

        monthly_counts[month] = len(values)

        if len(values) < min_samples_per_month:

            return {
                "status": "SKIPPED",
                "message": (
                    f"Insufficient observations for month "
                    f"{month}. Required: "
                    f"{min_samples_per_month}, "
                    f"Available: {len(values)}."
                ),
                "observationCount": len(cleaned),
                "seasonalCycle": {},
                "series": [],
                "monthlyCoverage": monthly_counts,
                "qualityReport": report
            }

        monthly_means[month] = float(
            np.mean(values)
        )

    # ----------------------------------
    # 8. Calculate overall mean
    # ----------------------------------

    all_values = np.array(
        [item["value"] for item in cleaned],
        dtype=float
    )

    overall_mean = float(np.mean(all_values))

    # ----------------------------------
    # 9. Calculate deseasonalized series
    # ----------------------------------

    deseasonalized_series = []

    for item in cleaned:

        month = item["parsedDate"].month

        original_value = item["value"]

        seasonal_component = monthly_means[month]

        anomaly = (
            original_value - seasonal_component
        )

        deseasonalized_value = (
            anomaly + overall_mean
        )

        deseasonalized_series.append({

            "date": item["date"],

            "original": round(
                float(original_value), 6
            ),

            "deseasonalized": round(
                float(deseasonalized_value), 6
            ),

            "anomaly": round(
                float(anomaly), 6
            ),

            "seasonalBaseline": round(
                float(seasonal_component), 6
            )

        })

    # ----------------------------------
    # 10. Seasonal coverage
    # ----------------------------------

    monthly_coverage = {
        month: {
            "count": monthly_counts[month],
            "climatologicalMean": round(
                monthly_means[month], 6
            )
        }
        for month in range(1, 13)
    }

    # ----------------------------------
    # 11. Seasonal profile
    # ----------------------------------

    seasonal_cycle = {
        month: round(
            monthly_means[month], 6
        )
        for month in range(1, 13)
    }

    # ----------------------------------
    # 12. Return results
    # ----------------------------------

    return {

        "status": "SUCCESS",

        "method": "Monthly Climatological Anomaly Deseasonalization",

        "description": (
            "Monthly climatological means are removed "
            "and the overall mean is restored."
        ),

        "observationCount": len(cleaned),

        "yearsCovered": len(years),

        "startDate": cleaned[0]["date"],

        "endDate": cleaned[-1]["date"],

        "overallMean": round(
            overall_mean, 6
        ),

        "seasonalCycle": seasonal_cycle,

        "monthlyCoverage": monthly_coverage,

        "qualityReport": report,

        "series": deseasonalized_series

    }
