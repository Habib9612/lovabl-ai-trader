/**
 * API Service for TradePro AI Backend Integration
 * 
 * This service handles all communication with the new Flask backend,
 * replacing the previous Supabase integration.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Types
export interface User {
  id: string;
  email: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token?: string;
  refresh_token?: string;
  email_verification_sent?: boolean;
}

export interface AIAgent {
  instance_id: string;
  agent_type: string;
  status: string;
  created_at: string;
  last_message?: {
    content: string;
    timestamp: string;
    requires_input: boolean;
    response: any;
  };
}

export interface AgentType {
  name: string;
  description: string;
  capabilities: string[];
}

export interface ApiError {
  error: string;
  details?: any;
}

// Auth token management
class TokenManager {
  private static ACCESS_TOKEN_KEY = 'tradepro_access_token';
  private static REFRESH_TOKEN_KEY = 'tradepro_refresh_token';

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }
}

// HTTP client with automatic token handling
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const accessToken = TokenManager.getAccessToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Token might be expired, try to refresh
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request with new token
          headers.Authorization = `Bearer ${TokenManager.getAccessToken()}`;
          const retryResponse = await fetch(url, { ...config, headers });
          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }
          return retryResponse.json();
        } else {
          // Refresh failed, redirect to login
          TokenManager.clearTokens();
          window.location.href = '/login';
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        TokenManager.setAccessToken(data.access_token);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// API service instance
const apiClient = new ApiClient(API_BASE_URL);

// Authentication API
export const authApi = {
  async register(email: string, password: string, displayName?: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      display_name: displayName,
    });
    
    if (response.access_token && response.refresh_token) {
      TokenManager.setTokens(response.access_token, response.refresh_token);
    }
    
    return response;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    
    if (response.access_token && response.refresh_token) {
      TokenManager.setTokens(response.access_token, response.refresh_token);
    }
    
    return response;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      TokenManager.clearTokens();
    }
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>('/auth/me');
  },

  async verifyEmail(token: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/verify-email', { token });
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/reset-password', {
      token,
      password,
    });
  },

  isAuthenticated(): boolean {
    return !!TokenManager.getAccessToken();
  },
};

// AI Agents API
export const aiAgentsApi = {
  async getHealth(): Promise<any> {
    return apiClient.get('/ai/health');
  },

  async getAgentTypes(): Promise<{ agent_types: Record<string, AgentType> }> {
    return apiClient.get('/ai/agent-types');
  },

  async createAgent(agentType: string, config: any = {}): Promise<{
    message: string;
    instance_id: string;
    agent_type: string;
    status: string;
  }> {
    return apiClient.post('/ai/agents', {
      agent_type: agentType,
      config,
    });
  },

  async listAgents(): Promise<{ agents: AIAgent[]; count: number }> {
    return apiClient.get('/ai/agents');
  },

  async getAgent(instanceId: string): Promise<{ agent: AIAgent }> {
    return apiClient.get(`/ai/agents/${instanceId}`);
  },

  async sendMessage(
    instanceId: string,
    content: string,
    requiresInput: boolean = false
  ): Promise<{ message: string; response: any }> {
    return apiClient.post(`/ai/agents/${instanceId}/message`, {
      content,
      requires_input: requiresInput,
    });
  },

  async stopAgent(instanceId: string): Promise<{ message: string }> {
    return apiClient.post(`/ai/agents/${instanceId}/stop`);
  },

  async createTradingAnalysisAgent(
    symbol: string,
    analysisType: string = 'comprehensive'
  ): Promise<{
    message: string;
    instance_id: string;
    symbol: string;
    analysis_type: string;
  }> {
    return apiClient.post('/ai/agents/trading-analysis', {
      symbol,
      analysis_type: analysisType,
    });
  },

  async createPortfolioManagerAgent(
    portfolioId: string = 'default'
  ): Promise<{
    message: string;
    instance_id: string;
    portfolio_id: string;
  }> {
    return apiClient.post('/ai/agents/portfolio-manager', {
      portfolio_id: portfolioId,
    });
  },

  async requestTradingDecision(
    instanceId: string,
    marketData: any
  ): Promise<{ message: string; response: any }> {
    return apiClient.post(`/ai/agents/${instanceId}/trading-decision`, {
      market_data: marketData,
    });
  },

  async getAgentInsights(instanceId: string): Promise<{ insights: any }> {
    return apiClient.get(`/ai/agents/${instanceId}/insights`);
  },
};

// Trading API (placeholder for future implementation)
export const tradingApi = {
  // TODO: Implement trading endpoints when available
};

// Export token manager for external use
export { TokenManager };

// Export API client for custom requests
export { apiClient };
