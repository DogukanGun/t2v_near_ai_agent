import { authService, ApiResponse } from './auth';

export interface UserProfile {
  username: string;
  account_id: string;
  public_key: string;
  private_key: string;
  twitter_username?: string;
}

export interface UpdateProfileRequest {
  username?: string;
  twitter_username?: string;
}

class ProfileService {
  private readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  private async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const url = `${this.API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        authService.clearAuth();
        window.location.reload();
        throw new Error('Authentication expired');
      }
      
      let errorMessage = `Server error (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async getProfile(): Promise<UserProfile> {
    try {
      const response = await this.makeAuthenticatedRequest<ApiResponse<UserProfile>>('/profile/');
      
      if (!response.success || !response.data) {
        throw new Error('Invalid response from server');
      }

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateProfile(updates: UpdateProfileRequest): Promise<UserProfile> {
    try {
      const response = await this.makeAuthenticatedRequest<ApiResponse<UserProfile>>('/profile/', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      if (!response.success || !response.data) {
        throw new Error('Invalid response from server');
      }

      return response.data;
    } catch (error) {
      throw new Error(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper method to copy private key to clipboard
  async copyPrivateKeyToClipboard(privateKey: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(privateKey);
    } catch (_) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = privateKey;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }
  }
}

export const profileService = new ProfileService(); 