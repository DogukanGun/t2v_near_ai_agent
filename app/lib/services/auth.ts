interface AuthResponse {
  access_token: string;
  token_type: string;
  account_id: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

class AuthService {
  private readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly ACCOUNT_ID_KEY = 'account_id';

  // Token management
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getAccountId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCOUNT_ID_KEY);
  }

  setAccountId(accountId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.ACCOUNT_ID_KEY, accountId);
  }

  clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ACCOUNT_ID_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // API calls
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearAuth();
        window.location.reload();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Authentication methods
  async initiateLogin(userIdentifier: string): Promise<ApiResponse> {
    try {
      const url = `${this.API_BASE_URL}/auth/login/${encodeURIComponent(userIdentifier)}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check if the response is ok
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      
      // Check if the backend indicates success
      if (result.success === false) {
        throw new Error(result.message || 'Login failed on server');
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Login failed: ${error}`);
    }
  }

  async verifyOTP(username: string, otpCode: string): Promise<AuthResponse> {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', otpCode);

      const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Server error (${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If we can't parse JSON, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const authData: AuthResponse = await response.json();
      
      // Validate the response structure
      if (!authData.access_token || !authData.account_id) {
        throw new Error('Invalid response from server: missing authentication data');
      }
      
      // Store the token and account ID
      this.setToken(authData.access_token);
      this.setAccountId(authData.account_id);
      
      return authData;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`OTP verification failed: ${error}`);
    }
  }

  async sendMessage(message: string): Promise<ApiResponse> {
    try {
      const response = await this.makeRequest<ApiResponse>(
        `/agent/chat/${encodeURIComponent(message)}`,
        {
          method: 'POST',
        }
      );
      return response;
    } catch (error) {
      throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  logout(): void {
    this.clearAuth();
    window.location.reload();
  }
}

export const authService = new AuthService();
export type { AuthResponse, ApiResponse }; 