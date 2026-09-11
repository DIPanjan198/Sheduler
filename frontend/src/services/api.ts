import { User, Shift, TimeOffRequest, ShiftSwapRequest, TimeClockEntry, NotificationItem } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api/v1';

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
    
    let response: Response;
    try {
      response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    } catch (networkErr: any) {
      console.error('[API Network Error]', networkErr);
      throw new Error('Unable to connect to the server. Please verify your connection or ensure the server is running.');
    }

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
      const errorCode = data?.error?.code;
      const errorMessage = data?.error?.message;

      if (response.status === 401) {
        const isAuthEndpoint = endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register') || endpoint.startsWith('/auth/accept-invite');
        
        if (!isAuthEndpoint) {
          // Force logout for expired/deleted/disabled accounts
          localStorage.removeItem('accessToken');
          localStorage.removeItem('currentUser');
          const reason = errorCode === 'ACCOUNT_DELETED'
            ? 'Your account has been removed. Please contact your manager.'
            : errorCode === 'ACCOUNT_DISABLED'
            ? 'Your account has been disabled. Please contact your manager.'
            : 'Your session expired. Please Sign In again.';
          window.dispatchEvent(new CustomEvent('shift-scheduler:force-logout', { detail: { reason } }));
          throw new Error(reason);
        }
        throw new Error(errorMessage || 'Invalid email or password');
      }
      throw new Error(errorMessage || data?.message || `HTTP Error ${response.status}`);
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
