#!/usr/bin/env python3
"""Test all API routes to verify url_prefix and decorators are working"""

import urllib.request
import json
import sys

BASE_URL = 'http://localhost:3001'

tests = [
    ('GET', '/api/currency/?base=USD', 'Currency Exchange'),
    ('GET', '/api/weather/?city=London', 'Weather'),
    ('GET', '/api/visa/?from=US&to=JP', 'Visa Check'),
    ('GET', '/api/visa/countries', 'Visa Countries'),
    ('GET', '/api/flights/?origin=JFK&destination=LAX&date=2024-01-15', 'Flights'),
    ('GET', '/api/hotels/?city=Paris&checkin=2024-01-15&checkout=2024-01-20', 'Hotels'),
    ('GET', '/api/maps/search?query=Eiffel+Tower', 'Maps Search'),
    ('GET', '/api/maps/airport?city=Paris', 'Maps Airport'),
]

print("=" * 70)
print("API ROUTE TESTING - Verifying url_prefix routing")
print("=" * 70)

passed = 0
failed = 0

for method, path, name in tests:
    try:
        url = BASE_URL + path
        if method == 'GET':
            response = urllib.request.urlopen(url)
            status = response.status
            data = json.loads(response.read().decode())
            print(f"✓ {name:20} {status} {method:4} {path}")
            passed += 1
    except urllib.error.HTTPError as e:
        print(f"✗ {name:20} {e.code} {method:4} {path}")
        failed += 1
    except Exception as e:
        print(f"✗ {name:20} ERR  {method:4} {path} - {str(e)[:50]}")
        failed += 1

print("=" * 70)
print(f"Results: {passed} passed, {failed} failed")
print("=" * 70)

sys.exit(0 if failed == 0 else 1)
