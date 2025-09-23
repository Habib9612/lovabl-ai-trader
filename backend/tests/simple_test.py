#!/usr/bin/env python3
"""
Simple API Test Script for TradePro AI Backend

This script performs basic tests to verify the API is working correctly.
"""

import requests
import json
import sys

BASE_URL = "http://localhost:5000/api"

def test_health():
    """Test the health endpoint."""
    try:
        print("Testing health endpoint...")
        response = requests.get(f"{BASE_URL}/ai/health", timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health test failed: {e}")
        return False

def test_agent_types():
    """Test the agent types endpoint."""
    try:
        print("\nTesting agent types endpoint...")
        response = requests.get(f"{BASE_URL}/ai/agent-types", timeout=5)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Agent types count: {len(data.get('agent_types', {}))}")
        return response.status_code == 200
    except Exception as e:
        print(f"Agent types test failed: {e}")
        return False

def test_registration():
    """Test user registration."""
    try:
        print("\nTesting user registration...")
        payload = {
            "email": "test@example.com",
            "password": "TestPass123",
            "display_name": "Test User"
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=5)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 409:
            print("User already exists - this is expected")
            return True
        elif response.status_code == 201:
            print("User created successfully")
            return True
        else:
            print(f"Unexpected status: {response.status_code}")
            return False
    except Exception as e:
        print(f"Registration test failed: {e}")
        return False

def test_login():
    """Test user login."""
    try:
        print("\nTesting user login...")
        payload = {
            "email": "test@example.com",
            "password": "TestPass123"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=5)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("Login successful")
            return data.get('access_token') is not None
        else:
            print(f"Login failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"Login test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("🚀 Starting simple API tests...\n")
    
    tests = [
        ("Health Check", test_health),
        ("Agent Types", test_agent_types),
        ("User Registration", test_registration),
        ("User Login", test_login),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"Running: {test_name}")
        if test_func():
            print(f"✅ {test_name} PASSED")
            passed += 1
        else:
            print(f"❌ {test_name} FAILED")
        print("-" * 50)
    
    print(f"\n📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        return True
    else:
        print("⚠️ Some tests failed")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
