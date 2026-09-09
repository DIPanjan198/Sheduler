import { User, Shift, TimeOffRequest, ShiftSwapRequest, TimeClockEntry, NotificationItem } from '../types';

const API_BASE = '/api/v1';

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = { ...this.getHeaders(), ...(options.headers || {}) };
    
    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const text = await response.text();
    
    let data: any = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        if (response.ok) {
          data = text;
        } else {
          throw new Error(`Server returned non-JSON response (HTTP ${response.status})`);
        }
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
        const isAuthEndpoint = endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register');
        throw new Error(data?.error?.message || (isAuthEndpoint ? 'Invalid email or password' : 'Your session expired. Please Sign In again.'));
      }
      throw new Error(data?.error?.message || data?.message || `HTTP Error ${response.status}`);
    }

    // Automatically trigger global real-time UI data re-sync on any mutation action
    const method = (options.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      window.dispatchEvent(new CustomEvent('shift-scheduler:data-changed', { detail: { endpoint, method } }));
    }

    return data as T;
  }
}

export const api = new ApiClient();
