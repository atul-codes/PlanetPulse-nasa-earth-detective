
from app.services.seasonal_analysis import deseasonalize_series


observations = []

# Generate 3 years of monthly demonstration data
for year in range(2022, 2025):

    for month in range(1, 13):

        seasonal_effect = 10 * (
            1 + __import__("math").sin(
                2 * 3.14159 * (month - 1) / 12
            )
        )

        trend_effect = (year - 2022) * 0.5

        observations.append({
            "date": f"{year}-{month:02d}-01",
            "value": 20 + seasonal_effect + trend_effect
        })


result = deseasonalize_series(observations)

print("STATUS:", result["status"])

print("\nSEASONAL CYCLE:")
print(result["seasonalCycle"])

print("\nMONTHLY COVERAGE:")
print(result["monthlyCoverage"])

print("\nFIRST 5 DESEASONALIZED VALUES:")

for item in result.get("series", [])[:5]:
    print(item)
