/**
 * OAuth Service for handling Google and GitHub authentication
 */

import { OAuthProvider, OAuthCallbackData } from '../types';

export class OAuthService {
  private static readonly BASE_URL = 'http://localhost:3001';

  /**
   * Initiate OAuth login flow
   */
  static initiateOAuth(provider: OAuthProvider): void {
    const oauthUrl = `${this.BASE_URL}/auth/${provider}`;
    window.location.href = oauthUrl;
  }

  /**
   * Initiate Google OAuth login
   */
  static loginWithGoogle(): void {
    this.initiateOAuth('google');
  }

  /**
   * Initiate GitHub OAuth login
   */
  static loginWithGitHub(): void {
    this.initiateOAuth('github');
  }

  /**
   * Parse OAuth callback data from URL parameters
   */
  static parseCallbackData(): OAuthCallbackData | null {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const userParam = urlParams.get('user');

    if (!accessToken || !refreshToken || !userParam) {
      return null;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam));
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: user,
      };
    } catch (error) {
      console.error('Error parsing OAuth callback data:', error);
      return null;
    }
  }

  /**
   * Clear OAuth callback parameters from URL
   */
  static clearCallbackParams(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('access_token');
    url.searchParams.delete('refresh_token');
    url.searchParams.delete('user');
    window.history.replaceState({}, document.title, url.pathname);
  }

  /**
   * Check if current URL is an OAuth callback
   */
  static isOAuthCallback(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('access_token') && urlParams.has('user');
  }

  /**
   * Handle OAuth errors
   */
  static handleOAuthError(error?: string): void {
    console.error('OAuth Error:', error || 'Unknown OAuth error occurred');
    
    // Clear any OAuth-related parameters
    this.clearCallbackParams();
    
    // You can add user-friendly error handling here
    // For example, show a toast notification or redirect to login page
  }
}
