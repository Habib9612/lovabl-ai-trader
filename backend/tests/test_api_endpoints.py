"""
Comprehensive API Endpoint Tests for TradePro AI Backend

This test suite validates all API endpoints including authentication,
AI agents management, and email functionality.
"""

import pytest
import requests
import json
import time
from typing import Dict, Any

# Test configuration
BASE_URL = "http://localhost:5000/api"
TEST_USER_EMAIL = "test@tradepro-ai.com"
TEST_USER_PASSWORD = "TestPassword123"
TEST_USER_DISPLAY_NAME = "Test User"

class TestAPIEndpoints:
    """Test suite for all API endpoints."""
    
    def __init__(self):
        self.access_token = None
        self.refresh_token = None
        self.user_id = None
        self.agent_instance_id = None
    
    def test_health_check(self) -> bool:
        """Test basic API health check."""
        try:
            response = requests.get(f"{BASE_URL}/ai/health")
            assert response.status_code == 200
            
            data = response.json()
            assert "service" in data
            assert "status" in data
            assert "timestamp" in data
            
            print("✅ Health check passed")
            return True
        except Exception as e:
            print(f"❌ Health check failed: {e}")
            return False
    
    def test_user_registration(self) -> bool:
        """Test user registration endpoint."""
        try:
            payload = {
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD,
                "display_name": TEST_USER_DISPLAY_NAME
            }
            
            response = requests.post(f"{BASE_URL}/auth/register", json=payload)
            
            # Handle case where user already exists
            if response.status_code == 409:
                print("ℹ️ User already exists, proceeding with login test")
                return True
            
            assert response.status_code == 201
            
            data = response.json()
            assert "user" in data
            assert "message" in data
            assert data["user"]["email"] == TEST_USER_EMAIL
            
            self.user_id = data["user"]["id"]
            
            print("✅ User registration passed")
            return True
        except Exception as e:
            print(f"❌ User registration failed: {e}")
            return False
    
    def test_user_login(self) -> bool:
        """Test user login endpoint."""
        try:
            payload = {
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
            
            response = requests.post(f"{BASE_URL}/auth/login", json=payload)
            assert response.status_code == 200
            
            data = response.json()
            assert "access_token" in data
            assert "refresh_token" in data
            assert "user" in data
            
            self.access_token = data["access_token"]
            self.refresh_token = data["refresh_token"]
            self.user_id = data["user"]["id"]
            
            print("✅ User login passed")
            return True
        except Exception as e:
            print(f"❌ User login failed: {e}")
            return False
    
    def test_get_current_user(self) -> bool:
        """Test get current user endpoint."""
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
            assert response.status_code == 200
            
            data = response.json()
            assert "user" in data
            assert data["user"]["id"] == self.user_id
            
            print("✅ Get current user passed")
            return True
        except Exception as e:
            print(f"❌ Get current user failed: {e}")
            return False
    
    def test_token_refresh(self) -> bool:
        """Test token refresh endpoint."""
        try:
            headers = {"Authorization": f"Bearer {self.refresh_token}"}
            response = requests.post(f"{BASE_URL}/auth/refresh", headers=headers)
            assert response.status_code == 200
            
            data = response.json()
            assert "access_token" in data
            
            # Update access token for subsequent tests
            self.access_token = data["access_token"]
            
            print("✅ Token refresh passed")
            return True
        except Exception as e:
            print(f"❌ Token refresh failed: {e}")
            return False
    
    def test_get_agent_types(self) -> bool:
        """Test get agent types endpoint."""
        try:
            response = requests.get(f"{BASE_URL}/ai/agent-types")
            assert response.status_code == 200
            
            data = response.json()
            assert "agent_types" in data
            
            agent_types = data["agent_types"]
            expected_types = [
                "trading-analyst",
                "portfolio-manager", 
                "risk-manager",
                "sentiment-analyst",
                "technical-analyst"
            ]
            
            for agent_type in expected_types:
                assert agent_type in agent_types
                assert "name" in agent_types[agent_type]
                assert "description" in agent_types[agent_type]
                assert "capabilities" in agent_types[agent_type]
            
            print("✅ Get agent types passed")
            return True
        except Exception as e:
            print(f"❌ Get agent types failed: {e}")
            return False
    
    def test_create_ai_agent(self) -> bool:
        """Test create AI agent endpoint."""
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            payload = {
                "agent_type": "trading-analyst",
                "config": {
                    "symbol": "AAPL",
                    "analysis_type": "technical"
                }
            }
            
            response = requests.post(f"{BASE_URL}/ai/agents", json=payload, headers=headers)
            assert response.status_code == 201
            
            data = response.json()
            assert "instance_id" in data
            assert "agent_type" in data
            assert "status" in data
            assert data["agent_type"] == "trading-analyst"
            assert data["status"] == "active"
            
            self.agent_instance_id = data["instance_id"]
            
            print("✅ Create AI agent passed")
            return True
        except Exception as e:
            print(f"❌ Create AI agent failed: {e}")
            return False
    
    def test_list_agents(self) -> bool:
        """Test list agents endpoint."""
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            response = requests.get(f"{BASE_URL}/ai/agents", headers=headers)
            assert response.status_code == 200
            
            data = response.json()
            assert "agents" in data
            assert "count" in data
            assert data["count"] >= 1
            
            # Verify our created agent is in the list
            agent_found = False
            for agent in data["agents"]:
                if agent["instance_id"] == self.agent_instance_id:
                    agent_found = True
                    assert agent["agent_type"] == "trading-analyst"
                    break
            
            assert agent_found, "Created agent not found in list"
            
            print("✅ List agents passed")
            return True
        except Exception as e:
            print(f"❌ List agents failed: {e}")
            return False
    
    def test_get_agent_status(self) -> bool:
        """Test get agent status endpoint."""
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            response = requests.get(
                f"{BASE_URL}/ai/agents/{self.agent_instance_id}", 
                headers=headers
            )
            assert response.status_code == 200
            
            data = response.json()
            assert "agent" in data
            
            agent = data["agent"]
            assert agent["instance_id"] == self.agent_instance_id
            assert agent["agent_type"] == "trading-analyst"
            assert agent["user_id"] == self.user_id
            
            print("✅ Get agent status passed")
            return True
        except Exception as e:
            print(f"❌ Get agent status failed: {e}")
            return False
    
    def test_send_agent_message(self) -> bool:
        """Test send message to agent endpoint."""
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            payload = {
                "content": "Analyze AAPL stock for potential trading opportunities",
                "requires_input": False
            }
            
            response = requests.post(
                f"{BASE_URL}/ai/agents/{self.agent_instance_id}/message",
                json=payload,
                headers=headers
            )
            assert response.status_code == 200
            
            data = response.json()
            assert "message" in data
            assert "response" in data
            
            print("✅ Send agent message passed")
            return True
        except Exception as e:
            print(f"❌ Send agent message failed: {e}")
            return False
    
    def test_create_trading_analysis_agent(self) -> bool:
        """Test create trading analysis agent endpoint."""
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            payload = {
                "symbol": "TSLA",
                "analysis_type": "comprehensive"
            }
            
            response = requests.post(
                f"{BASE_URL}/ai/agents/trading-analysis",
                json=payload,
                headers=headers
            )
            assert response.status_code == 201
            
            data = response.json()
            assert "instance_id" in data
            assert "symbol" in data
            assert "analysis_type" in data
            assert data["symbol"] == "TSLA"
            
            print("✅ Create trading analysis agent passed")
            return True
        except Exception as e:
            print(f"❌ Create trading analysis agent failed: {e}")
            return False
    
    def test_create_portfolio_manager_agent(self) -> bool:
        """Test create portfolio manager agent endpoint."""
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            payload = {
                "portfolio_id": "test_portfolio"
            }
            
            response = requests.post(
                f"{BASE_URL}/ai/agents/portfolio-manager",
                json=payload,
                headers=headers
            )
            assert response.status_code == 201
            
            data = response.json()
            assert "instance_id" in data
            assert "portfolio_id" in data
            assert data["portfolio_id"] == "test_portfolio"
            
            print("✅ Create portfolio manager agent passed")
            return True
        except Exception as e:
            print(f"❌ Create portfolio manager agent failed: {e}")
            return False
    
    def test_request_trading_decision(self) -> bool:
        """Test request trading decision endpoint."""
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            payload = {
                "market_data": {
                    "symbol": "AAPL",
                    "price": 150.00,
                    "volume": 1000000,
                    "trend": "bullish"
                }
            }
            
            response = requests.post(
                f"{BASE_URL}/ai/agents/{self.agent_instance_id}/trading-decision",
                json=payload,
                headers=headers
            )
            assert response.status_code == 200
            
            data = response.json()
            assert "message" in data
            assert "response" in data
            
            print("✅ Request trading decision passed")
            return True
        except Exception as e:
            print(f"❌ Request trading decision failed: {e}")
            return False
    
    def test_get_agent_insights(self) -> bool:
        """Test get agent insights endpoint."""
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            response = requests.get(
                f"{BASE_URL}/ai/agents/{self.agent_instance_id}/insights",
                headers=headers
            )
            assert response.status_code == 200
            
            data = response.json()
            assert "insights" in data
            
            print("✅ Get agent insights passed")
            return True
        except Exception as e:
            print(f"❌ Get agent insights failed: {e}")
            return False
    
    def test_stop_agent(self) -> bool:
        """Test stop agent endpoint."""
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            response = requests.post(
                f"{BASE_URL}/ai/agents/{self.agent_instance_id}/stop",
                headers=headers
            )
            assert response.status_code == 200
            
            data = response.json()
            assert "message" in data
            
            print("✅ Stop agent passed")
            return True
        except Exception as e:
            print(f"❌ Stop agent failed: {e}")
            return False
    
    def test_forgot_password(self) -> bool:
        """Test forgot password endpoint."""
        try:
            payload = {
                "email": TEST_USER_EMAIL
            }
            
            response = requests.post(f"{BASE_URL}/auth/forgot-password", json=payload)
            assert response.status_code == 200
            
            data = response.json()
            assert "message" in data
            
            print("✅ Forgot password passed")
            return True
        except Exception as e:
            print(f"❌ Forgot password failed: {e}")
            return False
    
    def test_logout(self) -> bool:
        """Test logout endpoint."""
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            response = requests.post(f"{BASE_URL}/auth/logout", headers=headers)
            assert response.status_code == 200
            
            data = response.json()
            assert "message" in data
            
            print("✅ Logout passed")
            return True
        except Exception as e:
            print(f"❌ Logout failed: {e}")
            return False
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all API endpoint tests."""
        print("🚀 Starting comprehensive API endpoint tests...\n")
        
        test_results = {
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0,
            "test_details": []
        }
        
        tests = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("Get Current User", self.test_get_current_user),
            ("Token Refresh", self.test_token_refresh),
            ("Get Agent Types", self.test_get_agent_types),
            ("Create AI Agent", self.test_create_ai_agent),
            ("List Agents", self.test_list_agents),
            ("Get Agent Status", self.test_get_agent_status),
            ("Send Agent Message", self.test_send_agent_message),
            ("Create Trading Analysis Agent", self.test_create_trading_analysis_agent),
            ("Create Portfolio Manager Agent", self.test_create_portfolio_manager_agent),
            ("Request Trading Decision", self.test_request_trading_decision),
            ("Get Agent Insights", self.test_get_agent_insights),
            ("Stop Agent", self.test_stop_agent),
            ("Forgot Password", self.test_forgot_password),
            ("Logout", self.test_logout),
        ]
        
        for test_name, test_func in tests:
            test_results["total_tests"] += 1
            print(f"\n🧪 Running: {test_name}")
            
            try:
                success = test_func()
                if success:
                    test_results["passed_tests"] += 1
                    test_results["test_details"].append({
                        "name": test_name,
                        "status": "PASSED",
                        "error": None
                    })
                else:
                    test_results["failed_tests"] += 1
                    test_results["test_details"].append({
                        "name": test_name,
                        "status": "FAILED",
                        "error": "Test returned False"
                    })
            except Exception as e:
                test_results["failed_tests"] += 1
                test_results["test_details"].append({
                    "name": test_name,
                    "status": "FAILED",
                    "error": str(e)
                })
                print(f"❌ {test_name} failed with exception: {e}")
            
            # Small delay between tests
            time.sleep(0.5)
        
        return test_results

def main():
    """Main test execution function."""
    tester = TestAPIEndpoints()
    results = tester.run_all_tests()
    
    print("\n" + "="*60)
    print("📊 TEST RESULTS SUMMARY")
    print("="*60)
    print(f"Total Tests: {results['total_tests']}")
    print(f"Passed: {results['passed_tests']} ✅")
    print(f"Failed: {results['failed_tests']} ❌")
    print(f"Success Rate: {(results['passed_tests']/results['total_tests']*100):.1f}%")
    
    if results['failed_tests'] > 0:
        print("\n❌ FAILED TESTS:")
        for test in results['test_details']:
            if test['status'] == 'FAILED':
                print(f"  - {test['name']}: {test['error']}")
    
    print("\n" + "="*60)
    
    return results['failed_tests'] == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
