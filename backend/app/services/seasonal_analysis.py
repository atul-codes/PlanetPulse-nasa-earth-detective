
import numpy as np

from datetime import datetime, timezone
from typing import List, Dict, Any


def _parse_date(date_string: Any) -> datetime:
    """
    Parse any standard Earth Science date string or object into a UTC datetime.

    Supports:
    - YYYY (e.g., '2005')
    - YYYYMM (e.g., '200501')
    - YYYY-MM or YYYY/MM (e.g., '2005-01', '2005/01', '2005-1')
    - YYYY-MM-DD or YYYY/MM/DD (e.g., '2005-01-01', '2005/01/15')
    - Full ISO 8601 with or without timezone / Z (e.g., '2005-01-01T00:00:00Z')
    - datetime / date instances
    """
    if isinstance(date_string, datetime):
        if date_string.tzinfo is None:
            return date_string.replace(tzinfo=timezone.utc)
        return date_string.astimezone(timezone.utc)

    if hasattr(date_string, "year") and hasattr(date_string, "month") and hasattr(date_string, "day"):
        return datetime(date_string.year, date_string.month, date_string.day, tzinfo=timezone.utc)

    if not isinstance(date_string, str):
        raw_str = str(date_string)
    else:
        raw_str = date_string

    raw_str = raw_str.strip()
    if not raw_str:
        raise ValueError("Date cannot be empty.")

    # 1. 4-digit Year only: '2005'
    if len(raw_str) == 4 and raw_str.isdigit():
        return datetime(int(raw_str), 1, 1, tzinfo=timezone.utc)

    # 2. Compact YYYYMM: '200501'
    if len(raw_str) == 6 and raw_str.isdigit():
        return datetime(int(raw_str[:4]), int(raw_str[4:6]), 1, tzinfo=timezone.utc)

    # Normalize slashes to hyphens
    normalized = raw_str.replace("/", "-")

    # 3. YYYY-MM (e.g. '2005-01' or '2005-1')
    parts = normalized.split("-")
    if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
        return datetime(int(parts[0]), int(parts[1]), 1, tzinfo=timezone.utc)

    # 4. YYYY-MM-DD (e.g. '2005-01-15' or '2005-1-5')
    if len(parts) == 3 and parts[0].isdigit() and parts[1].isdigit() and parts[2].isdigit():
        return datetime(int(parts[0]), int(parts[1]), int(parts[2]), tzinfo=timezone.utc)

    # 5. ISO 8601 strings
    try:
        clean_iso = normalized.replace("Z", "+00:00")
        dt = datetime.fromisoformat(clean_iso)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except ValueError:
        pass

    # 6. Fallback strptime formats
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d", "%Y-%m", "%d-%m-%Y", "%m/%d/%Y"):
        try:
            dt = datetime.strptime(normalized, fmt)
            return dt.replace(tzinfo=timezone.utc)
        except ValueError:
            continue

    raise ValueError(f"Invalid date format: '{date_string}'. Supported formats include YYYY, YYYY-MM, YYYY-MM-DD, and ISO 8601.")


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
