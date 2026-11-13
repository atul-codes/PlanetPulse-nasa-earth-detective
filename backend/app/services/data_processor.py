
import numpy as np

from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple


# NASA POWER commonly uses -999 for missing observations.
# Other datasets may require different sentinel values.
DEFAULT_SENTINEL_VALUES = (-999.0,)


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
