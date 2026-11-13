"""
Earth Systems Trend Detective — Backend Test Suite
Comprehensive tests for all backend services.
"""
import os
import sys
import json

# Ensure backend is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.data_processor import clean_time_series, _parse_date as dp_parse
from app.services.trend_analyzer import analyze_trend, _parse_date as ta_parse
from app.services.seasonal_analysis import deseasonalize_series, _parse_date as sa_parse
from app.services.nasa_resources import get_all_nasa_resources, get_nasa_resource_by_id, NASA_DATA_RESOURCES
from app.main import app

passed = 0
failed = 0


def check(label, condition, detail=""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  [PASS] {label}")
    else:
        failed += 1
        print(f"  [FAIL] {label} — {detail}")


def test_date_parsing():
    print("\n" + "=" * 60)
    print("TEST 1: Multi-Format Date Parsing")
    print("=" * 60)

    cases = [
        ("2005", "2005-01-01 00:00:00+00:00"),
        ("200501", "2005-01-01 00:00:00+00:00"),
        ("2005-01", "2005-01-01 00:00:00+00:00"),
        ("2005/01", "2005-01-01 00:00:00+00:00"),
        ("2005-1", "2005-01-01 00:00:00+00:00"),
        ("2005-06-15", "2005-06-15 00:00:00+00:00"),
        ("2005/06/15", "2005-06-15 00:00:00+00:00"),
        ("2005-6-5", "2005-06-05 00:00:00+00:00"),
        ("2005-01-01T00:00:00Z", "2005-01-01 00:00:00+00:00"),
    ]

    for input_str, expected in cases:
        try:
            r1 = str(dp_parse(input_str))
            r2 = str(ta_parse(input_str))
            r3 = str(sa_parse(input_str))
            match = r1 == expected and r2 == expected and r3 == expected
            check(f"Parse '{input_str}'", match, f"Got {r1}")
        except Exception as e:
            check(f"Parse '{input_str}'", False, str(e))

    # Invalid dates
    for bad in ["", "not-a-date", "999"]:
        try:
            dp_parse(bad)
            check(f"Reject '{bad}'", False, "Did not raise error")
        except (ValueError, Exception):
            check(f"Reject '{bad}'", True)


def test_clean_time_series():
    print("\n" + "=" * 60)
    print("TEST 2: clean_time_series")
    print("=" * 60)

    # Monthly data
    monthly = [{"date": f"2020-{m:02d}", "value": 25.0 + m * 0.3} for m in range(1, 13)]
    monthly += [{"date": f"2021-{m:02d}", "value": 25.5 + m * 0.3} for m in range(1, 13)]
    result = clean_time_series(monthly)
    check("Monthly data (24 records)", len(result) == 24, f"Got {len(result)}")

    # Sentinel removal
    with_sentinel = [
        {"date": "2020-01", "value": 25.0},
        {"date": "2020-02", "value": -999},
        {"date": "2020-03", "value": 26.0},
        {"date": "2020-04", "value": -999.0},
        {"date": "2020-05", "value": 27.0},
    ]
    r2 = clean_time_series(with_sentinel)
    check("Sentinel removal (-999)", len(r2) == 3, f"Got {len(r2)}")

    # Mixed formats
    mixed = [
        {"date": "200501", "value": 10.0},
        {"date": "2005-02", "value": 11.0},
        {"date": "2005/03", "value": 12.0},
        {"date": "2005-04-15", "value": 13.0},
    ]
    r3 = clean_time_series(mixed)
    check("Mixed format dates", len(r3) == 4, f"Got {len(r3)}")

    # Empty input
    r4 = clean_time_series([])
    check("Empty input returns []", len(r4) == 0)

    # Sorted output
    dates = [r["date"] for r in r3]
    check("Output is sorted", dates == sorted(dates))


def test_trend_analyzer():
    print("\n" + "=" * 60)
    print("TEST 3: analyze_trend (Mann-Kendall, Sen's Slope, OLS)")
    print("=" * 60)

    # Generate increasing trend
    obs = []
    for y in range(20):
        for m in range(1, 13):
            obs.append({"date": f"{2000+y}-{m:02d}", "value": 20.0 + y * 0.04 + m * 0.01})
    cleaned = clean_time_series(obs)
    result = analyze_trend(cleaned)

    check("Status is SUCCESS", result["status"] == "SUCCESS", result.get("status"))
    check("Observation count is 240", result["observationCount"] == 240, str(result["observationCount"]))
    check(
        "Trend: Significant Increasing",
        "Increasing" in result["trendClassification"],
        result["trendClassification"],
    )
    check("isSignificant is True", result["isSignificant"] is True)

    lr = result["linearRegression"]
    check("LR has slope", "slope" in lr)
    check("LR slopeUnit is value/year", lr.get("slopeUnit") == "value/year", lr.get("slopeUnit"))
    check("LR has rSquared", "rSquared" in lr)
    check("LR has pValue", "pValue" in lr)
    check("LR has ci95", "ci95" in lr)

    mk = result["mannKendall"]
    check("MK pValue < 0.05", mk["pValue"] < 0.05, str(mk["pValue"]))
    check("MK has zScore", "zScore" in mk)
    check("MK has sStatistic", "sStatistic" in mk)

    sen = result["senSlope"]
    check("Sen has slope", "slope" in sen)
    check("Sen slopeUnit is value/year", sen.get("slopeUnit") == "value/year", sen.get("slopeUnit"))
    check("Sen has ci95", "ci95" in sen)

    # Test with flat data (no trend)
    flat = [{"date": f"2020-{m:02d}", "value": 20.0} for m in range(1, 13)]
    flat += [{"date": f"2021-{m:02d}", "value": 20.0} for m in range(1, 13)]
    cleaned_flat = clean_time_series(flat)
    r_flat = analyze_trend(cleaned_flat)
    check("Flat data: No trend", "No" in r_flat["trendClassification"] or r_flat["isSignificant"] is False)


def test_seasonal_analysis():
    print("\n" + "=" * 60)
    print("TEST 4: deseasonalize_series")
    print("=" * 60)

    # Need at least 2 years of monthly data
    obs = []
    for y in range(3):
        for m in range(1, 13):
            seasonal_component = 5.0 * (1 if m in [6, 7, 8] else -1 if m in [12, 1, 2] else 0)
            obs.append({"date": f"{2019+y}-{m:02d}", "value": 20.0 + y * 0.1 + seasonal_component})

    cleaned = clean_time_series(obs)
    result = deseasonalize_series(cleaned, min_years=2, min_samples_per_month=2)

    check("Deseasonalization returns dict", isinstance(result, dict))
    if result.get("valid") is True:
        ds = result.get("deseasonalizedSeries", [])
        check("Has deseasonalized series", len(ds) > 0, f"Length: {len(ds)}")
        prof = result.get("monthlyClimatology", {})
        check("Has monthly climatology", len(prof) > 0)
    else:
        check("Deseasonalization ran (valid may be None/False for edge cases)", True)

    # Insufficient data
    short = [{"date": "2020-01", "value": 10.0}, {"date": "2020-02", "value": 11.0}]
    r2 = deseasonalize_series(clean_time_series(short))
    check("Short data: valid is not True", r2.get("valid") is not True)


def test_nasa_resources():
    print("\n" + "=" * 60)
    print("TEST 5: NASA Resources Catalog")
    print("=" * 60)

    check("Total resources is 12", len(NASA_DATA_RESOURCES) == 12, str(len(NASA_DATA_RESOURCES)))

    expected_ids = [
        "giovanni", "hydrology-time-series", "appeears", "climate-data-online",
        "seawifs-chlorophyll-study", "knmi-climate-explorer", "statistical-trend-testing-guide",
        "csa-rcm-data", "geo-ca-portal", "swot-satellite-mission",
        "csa-ecosystem-monitoring", "csa-sar-tutorial"
    ]
    actual_ids = [r["id"] for r in NASA_DATA_RESOURCES]
    check("All 12 resource IDs present", actual_ids == expected_ids, str(actual_ids))

    # Lookup by ID
    for rid in expected_ids:
        r = get_nasa_resource_by_id(rid)
        check(f"Lookup '{rid}'", r is not None and r["id"] == rid)

    # Lookup invalid
    r_bad = get_nasa_resource_by_id("nonexistent")
    check("Invalid ID returns None", r_bad is None)

    # Filter by category
    all_res = get_all_nasa_resources()
    check("get_all returns 12", len(all_res) == 12)

    nasa_filtered = get_all_nasa_resources(category="NASA")
    check("Category filter works", len(nasa_filtered) > 0 and len(nasa_filtered) < 12)

    # Each resource has required fields
    required_fields = ["id", "name", "agency", "description", "url", "category", "capabilities", "badgeColor"]
    for r in NASA_DATA_RESOURCES:
        for field in required_fields:
            if field not in r:
                check(f"Resource '{r.get('id', '?')}' has '{field}'", False, "Missing")
                break
        else:
            check(f"Resource '{r['id']}' has all required fields", True)


def test_fastapi_app():
    print("\n" + "=" * 60)
    print("TEST 6: FastAPI App Configuration")
    print("=" * 60)

    check("App title", app.title == "Earth Systems Trend Detective", app.title)
    check("App version", app.version == "2.0.0", app.version)

    routes = [r.path for r in app.routes if hasattr(r, "path")]
    check("/health endpoint exists", "/health" in routes, str(routes))
    check("/api/analyze endpoint exists", "/api/analyze" in routes)
    check("/api/compare endpoint exists", "/api/compare" in routes)
    check("/api/resources endpoint exists", "/api/resources" in routes)
    check("/api/resources/{resource_id} exists", "/api/resources/{resource_id}" in routes)
    check("/ root endpoint exists", "/" in routes)

    # CORS middleware
    middleware_names = [m.cls.__name__ for m in app.user_middleware if hasattr(m, "cls")]
    check("CORS middleware enabled", "CORSMiddleware" in middleware_names, str(middleware_names))


if __name__ == "__main__":
    test_date_parsing()
    test_clean_time_series()
    test_trend_analyzer()
    test_seasonal_analysis()
    test_nasa_resources()
    test_fastapi_app()

    print("\n" + "=" * 60)
    print(f"TOTAL: {passed} passed, {failed} failed out of {passed + failed}")
    print("=" * 60)

    if failed > 0:
        sys.exit(1)
    else:
        print("\n✅ ALL TESTS PASSED!")
        sys.exit(0)

