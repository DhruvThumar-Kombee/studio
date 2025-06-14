
"use server";

import { loginUser } from '@/services/authService';
import type { LoginResponse } from '@/types';

export async function loginAction(prevState: any, formData: FormData): Promise<LoginResponse> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, message: 'Email and password are required.' };
  }

  try {
    const response = await loginUser(email, password);
    return response;
  } catch (error) {
    console.error("Login action failed:", error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
