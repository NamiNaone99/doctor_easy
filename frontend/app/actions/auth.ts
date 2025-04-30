// app/actions/auth.ts
'use server';

import { cookies } from 'next/headers';

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  error?: string;
}

export async function loginAction(
  formData: LoginFormData
): Promise<LoginResponse> {
  const apiUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  try {
    const response = await fetch(`${apiUrl}/api/v1/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formData.username,
        password: formData.password
      }),
      credentials: 'include'
    });

    const data = await response.json();

    if (response.ok) {
      // Get the cookies store
      const cookieStore = await cookies();

      // Set session token
      cookieStore.set({
        name: 'session_token',
        value: data.access_token,
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 30 * 60, // 30 minutes
        path: '/'
      });

      // Set CSRF token
      cookieStore.set({
        name: 'csrf_token',
        value: data.csrf_token,
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 30 * 60,
        path: '/'
      });

      return { success: true };
    } else {
      return { success: false, error: data.detail || 'Login failed' };
    }
  } catch (error) {
    return { success: false, error: 'An error occurred during login' };
  }
}

interface LogoutResponse {
  success: boolean;
  error?: string;
}

export async function logoutAction(): Promise<LogoutResponse> {
  const apiUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  try {
    // Call FastAPI logout endpoint if needed
    try {
      await fetch(`${apiUrl}/api/v1/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      // Continue even if backend call fails
      console.error('Error calling logout endpoint:', error);
    }

    // Clear cookies
    const cookieStore = await cookies();
    cookieStore.delete('session_token');
    cookieStore.delete('csrf_token');

    return { success: true };
  } catch (error) {
    return { success: false, error: 'An error occurred during logout' };
  }
}
