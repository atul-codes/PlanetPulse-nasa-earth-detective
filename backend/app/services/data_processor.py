
import numpy as np

from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple


# NASA POWER commonly uses -999 for missing observations.
# Other datasets may require different sentinel values.
DEFAULT_SENTINEL_VALUES = (-999.0,)


def _parse_date(date_string: Any) -> datetime:
    """
    Parse ISO 8601 dates and normalize them to UTC.

    Supports:
    - 2024-01-01
    - 2024-01-01T12:00:00
    - 2024-01-01T12:00:00Z
    - 2024-01-01T12:00:00+05:30
    """

    if not isinstance(date_string, str):
        raise ValueError("Date must be a string.")

    date_string = date_string.strip()

    if not date_string:
        raise ValueError("Date cannot be empty.")

    try:
        # Support YYYYMM format
        if len(date_string) == 6 and date_string.isdigit():
            parsed = datetime.strptime(date_string, "%Y%m")
        # Support YYYY-MM format
        elif len(date_string) == 7 and date_string[4] == "-":
            parsed = datetime.strptime(date_string, "%Y-%m")
        else:
            parsed = datetime.fromisoformat(
                date_string.replace("Z", "+00:00")
            )

    except ValueError:
        raise ValueError(
            f"Invalid ISO date format: {date_string}"
        )

    # Interpret timezone-naive dates as UTC.
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)

    # Normalize all timestamps to UTC.
    return parsed.astimezone(timezone.utc)


def _validate_value(
    value: Any,
    sentinel_values: Tuple[float, ...]
) -> float:
    """
    Validate numerical Earth science observations.

    Removes:
    - None
    - Invalid numeric values
    - NaN
    - Positive and negative infinity
    - Configured missing-data sentinel values
    """

    if value is None or isinstance(value, bool):
        raise ValueError("Invalid observation value.")

    try:
        numeric_value = float(value)

    except (ValueError, TypeError, OverflowError):
        raise ValueError("Observation must be numeric.")

    if not np.isfinite(numeric_value):
        raise ValueError("Non-finite observation detected.")

    if numeric_value in sentinel_values:
        raise ValueError("Missing-data sentinel detected.")

    return numeric_value


def clean_time_series(
    observations: List[Dict[str, Any]],
    sentinel_values: Tuple[float, ...] = DEFAULT_SENTINEL_VALUES,
    duplicate_policy: str = "first",
    return_report: bool = False
) -> Any:
    """
    Clean and validate NASA Earth Science time-series data.

    Features:
    1. Validates input structure.
    2. Validates ISO 8601 dates.
    3. Normalizes timestamps to UTC.
    4. Removes None and invalid observations.
    5. Removes NaN and infinite values.
    6. Filters configured NASA missing-data sentinels.
    7. Detects duplicate timestamps.
    8. Sorts observations chronologically.
    9. Generates optional data-quality report.

    Duplicate policies:
    - first: Keep the first valid observation.
    - last: Keep the last valid observation.

    Default return:
        List of cleaned observations.

    If return_report=True:
        {
            "observations": [...],
            "report": {...}
        }
    """

    # ----------------------------------
    # 1. Validate input
    # ----------------------------------

    if not isinstance(observations, list):
        raise ValueError("Observations must be a list.")

    if duplicate_policy not in ("first", "last"):
        raise ValueError(
            "duplicate_policy must be 'first' or 'last'."
        )

    normalized_sentinels = tuple(
        float(value) for value in sentinel_values
    )

    if not all(np.isfinite(v) for v in normalized_sentinels):
        raise ValueError("Sentinel values must be finite.")

    # ----------------------------------
    # 2. Initialize quality counters
    # ----------------------------------

    report = {
        "totalObservations": len(observations),
        "validObservations": 0,
        "invalidRecords": 0,
        "invalidDates": 0,
        "invalidValues": 0,
        "missingValues": 0,
        "sentinelValues": 0,
        "duplicateObservations": 0,
        "dataQuality": "PENDING"
    }

    valid_obs = {}
    
    # ----------------------------------
    # 3. Process observations
    # ----------------------------------

    for item in observations:

        if not isinstance(item, dict):
            report["invalidRecords"] += 1
            continue

        date_str = item.get("date")
        raw_value = item.get("value")

        # Check missing values
        if raw_value is None:
            report["missingValues"] += 1
            continue

        # Validate date
        try:
            parsed_date = _parse_date(date_str)

        except (ValueError, TypeError):
            report["invalidDates"] += 1
            continue

        # Validate numerical value
        try:
            numeric_value = _validate_value(
                raw_value,
                normalized_sentinels
            )

        except ValueError as error:

            if "sentinel" in str(error):
                report["sentinelValues"] += 1

            else:
                report["invalidValues"] += 1

            continue

        # UTC ISO timestamp is the unique key.
        normalized_date = parsed_date.isoformat()

        # Duplicate timestamp detection
        if normalized_date in valid_obs:

            report["duplicateObservations"] += 1

            if duplicate_policy == "last":
                valid_obs[normalized_date] = numeric_value

            continue

        valid_obs[normalized_date] = numeric_value

    # ----------------------------------
    # 4. Sort chronologically
    # ----------------------------------

    cleaned = [
        {
            "date": date,
            "value": value
        }
        for date, value in sorted(valid_obs.items())
    ]

    # ----------------------------------
    # 5. Generate data quality report
    # ----------------------------------

    report["validObservations"] = len(cleaned)

    report["invalidRecords"] = (
        report["invalidRecords"]
        + report["invalidDates"]
        + report["invalidValues"]
    )

    if len(cleaned) == 0:
        report["dataQuality"] = "NO_VALID_DATA"

    elif report["invalidRecords"] > 0 or (
        report["missingValues"] > 0
        or report["sentinelValues"] > 0
        or report["duplicateObservations"] > 0
    ):
        report["dataQuality"] = "REQUIRES_REVIEW"

    else:
        report["dataQuality"] = "GOOD"

    # ----------------------------------
    # 6. Return results
    # ----------------------------------

    if return_report:
        return {
            "observations": cleaned,
            "report": report
        }

    return cleaned
