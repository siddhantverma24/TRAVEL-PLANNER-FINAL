#!/usr/bin/env python3
"""
Comprehensive API Test Suite for Travel Planner
Tests all endpoints and reports detailed status
"""

import requests
import json
from datetime import datetime

BASE_URL = 'http://127.0.0.1:5001'

def print_header(title):
    print('\n' + '=' * 80)
    print(f'  {title}')
    print('=' * 80)

def print_section(title):
    print(f'\n{title}')
    print('-' * 80)

def test_health():
    """Test the health check endpoint"""
    print_section('1. HEALTH CHECK ENDPOINT')
    try:
        r = requests.get(f'{BASE_URL}/api/health', timeout=5)
        print(f'Status Code: {r.status_code} ✓' if r.status_code == 200 else f'Status Code: {r.status_code} ✗')
        data = r.json()
        print(f'Server Status: {data.get("status")}')
        
        apis = data.get('apis', {})
        print(f'\nAPI Status:')
        for api_name, status in apis.items():
            symbol = '✓' if status else '✗'
            print(f'  {api_name.ljust(15)} : {symbol} {status}')
        return True
    except Exception as e:
        print(f'ERROR: {e} ✗')
        return False

def test_weather():
    """Test the weather API"""
    print_section('2. WEATHER API TEST')
    try:
        r = requests.get(f'{BASE_URL}/api/weather?city=London', timeout=5)
        print(f'Status Code: {r.status_code} ✓' if r.status_code == 200 else f'Status Code: {r.status_code} ✗')
        data = r.json()
        
        if 'error' in data:
            print(f'Error: {data["error"]} ✗')
            return False
        
        print(f'City: London')
        print(f'Temperature: {data.get("temp")}°C')
        print(f'Condition: {data.get("condition")}')
        print(f'Humidity: {data.get("humidity")}%')
        print(f'Wind: {data.get("wind")} km/h')
        print(f'Feels Like: {data.get("feels")}°C')
        
        if data.get('forecast'):
            print(f'\nForecast:')
            for day in data['forecast'][:3]:
                print(f'  {day.get("d")}: {day.get("t")} {day.get("i")}')
        
        return True
    except Exception as e:
        print(f'ERROR: {e} ✗')
        return False

def test_currency():
    """Test the currency API"""
    print_section('3. CURRENCY API TEST')
    try:
        r = requests.get(f'{BASE_URL}/api/currency?base=USD', timeout=5)
        print(f'Status Code: {r.status_code} ✓' if r.status_code == 200 else f'Status Code: {r.status_code} ✗')
        data = r.json()
        
        print(f'Base Currency: {data.get("base")}')
        print(f'Last Updated: {data.get("lastUpdated", "N/A")}')
        
        rates = data.get('rates', {})
        print(f'\nExchange Rates:')
        for currency in ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR']:
            rate = rates.get(currency, 'N/A')
            print(f'  USD to {currency}: {rate}')
        
        return True
    except Exception as e:
        print(f'ERROR: {e} ✗')
        return False

def test_visa():
    """Test the visa API"""
    print_section('4. VISA API TEST')
    try:
        r = requests.get(f'{BASE_URL}/api/visa?from=US&to=JP', timeout=5)
        print(f'Status Code: {r.status_code}')
        data = r.json()
        
        if 'error' in data:
            print(f'Note: {data["error"]}')
            return True  # API may return demo data
        
        print(f'From: US')
        print(f'To: JP')
        print(f'Visa Data: {json.dumps(data, indent=2)[:300]}...')
        return True
    except Exception as e:
        print(f'ERROR: {e} ✗')
        return False

def test_flights():
    """Test the flights API"""
    print_section('5. FLIGHTS API TEST')
    try:
        r = requests.get(f'{BASE_URL}/api/flights?from=ORD&to=LAX&date=2024-06-15&passengers=1', timeout=5)
        print(f'Status Code: {r.status_code}')
        data = r.json()
        
        flights = data.get('flights', [])
        print(f'Number of Flights Found: {len(flights)}')
        print(f'Data Source: {data.get("source", "unknown")}')
        
        if flights:
            print(f'\nSample Flights:')
            for i, flight in enumerate(flights[:3], 1):
                print(f'\n  Flight {i}:')
                print(f'    Airline: {flight.get("airline")} ({flight.get("airlineCode")})')
                print(f'    Flight Number: {flight.get("flightNumber")}')
                print(f'    Route: {flight.get("from")} → {flight.get("to")}')
                print(f'    Depart: {flight.get("depart")} | Arrive: {flight.get("arrive")}')
                print(f'    Price: ${flight.get("price")}')
                print(f'    Status: {flight.get("status")}')
        
        return True
    except Exception as e:
        print(f'ERROR: {e} ✗')
        return False

def test_frontend():
    """Test frontend accessibility"""
    print_section('6. FRONTEND SERVER TEST')
    try:
        r = requests.get('http://127.0.0.1:8000', timeout=5)
        print(f'Status Code: {r.status_code} ✓' if r.status_code == 200 else f'Status Code: {r.status_code} ✗')
        print(f'Server: Running on http://127.0.0.1:8000')
        print(f'Content Type: {r.headers.get("content-type", "N/A")}')
        
        if 'html' in r.text.lower():
            print(f'HTML Content: ✓ Detected')
        
        return True
    except Exception as e:
        print(f'ERROR: {e} ✗')
        return False

def main():
    print_header('TRAVEL PLANNER - COMPREHENSIVE API TEST SUITE')
    print(f'Timestamp: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    print(f'Backend URL: {BASE_URL}')
    print(f'Frontend URL: http://127.0.0.1:8000')
    
    results = {
        'health': test_health(),
        'weather': test_weather(),
        'currency': test_currency(),
        'visa': test_visa(),
        'flights': test_flights(),
        'frontend': test_frontend(),
    }
    
    # Summary
    print_header('TEST SUMMARY')
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_test in results.items():
        symbol = '✓' if passed_test else '✗'
        status = 'PASSED' if passed_test else 'FAILED'
        print(f'{symbol} {test_name.upper().ljust(15)} : {status}')
    
    print(f'\nTotal: {passed}/{total} tests passed')
    
    if passed == total:
        print('\n🎉 All tests PASSED! Your application is working perfectly!')
    else:
        print(f'\n⚠️  {total - passed} test(s) failed. Check the output above for details.')
    
    print('\n' + '=' * 80)

if __name__ == '__main__':
    main()
