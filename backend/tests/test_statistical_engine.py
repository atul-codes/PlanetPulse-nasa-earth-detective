import unittest
import sys
import os

sys.path.insert(0, os.path.abspath('.'))

from backend.app.services.data_processor import clean_time_series
from backend.app.services.trend_analyzer import analyze_trend
from backend.app.services.seasonal_analysis import deseasonalize_series

class TestScientificStatistics(unittest.TestCase):
    def test_clean_time_series(self):
        raw = [
            {"date": "2020-01", "value": 25.4},
            {"date": "2020-02", "value": -999.0}, # NASA sentinel
            {"date": "2020-03", "value": 26.1},
            {"date": "2020-01", "value": 25.4}, # Duplicate
        ]
        cleaned = clean_time_series(raw)
        self.assertEqual(len(cleaned), 2)
        self.assertEqual(cleaned[0]["value"], 25.4)
        self.assertEqual(cleaned[1]["value"], 26.1)

    def test_mann_kendall_monotonic_trend(self):
        # Strongly increasing series
        obs = [{"date": f"2010-{i:02d}", "value": 10.0 + i * 2.0} for i in range(1, 15)]
        res = analyze_trend(obs)
        self.assertEqual(res["trendClassification"], "Significant Increasing Trend")
        self.assertTrue(res["isSignificant"])
        self.assertLess(res["mannKendall"]["pValue"], 0.05)
        self.assertAlmostEqual(res["senSlope"]["slope"], 2.0, places=2)

    def test_deseasonalization(self):
        # 2 years with strong summer cycle (months 6-8)
        obs = []
        for year in [2020, 2021]:
            for m in range(1, 13):
                base = 20.0
                cycle = 10.0 if m in [6, 7, 8] else -5.0
                obs.append({"date": f"{year}-{m:02d}", "value": base + cycle})
        
        decomp = deseasonalize_series(obs)
        self.assertEqual(decomp["status"], "SUCCESS")
        # Deseasonalized values should be approximately equal to overall mean
        for item in decomp["series"]:
            self.assertAlmostEqual(item["deseasonalized"], decomp["overallMean"], delta=0.5)

if __name__ == '__main__':
    unittest.main()

