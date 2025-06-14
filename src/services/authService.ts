
import type { User, UserRole, LoginResponse } from '@/types';

const mockUsers: User[] = [
  { id: '1', email: 'super@example.com', role: 'super-admin', name: 'Super Admin User' },
  { id: '2', email: 'admin@example.com', role: 'admin', name: 'Admin User' },
  { id: '3', email: 'staff@example.com', role: 'staff', name: 'Staff User' },
  { id: '4', email: 'hospital@example.com', role: 'hospital', name: 'Hospital User' },
];

// Simulate a backend API call for login
export async function loginUser(email: string, password?: string): Promise<LoginResponse> {
  // In a real app, password would be used and sent to a secure backend.
  // Here, we're just matching email for simplicity and mocking.
  const foundUser = mockUsers.find(u => u.email === email);

  return new Promise((resolve) => {
    setTimeout(() => {
      if (foundUser && password === 'password') { // Basic password check for mock
        resolve({
          success: true,
          user: foundUser,
          token: `mock-jwt-token-for-${foundUser.id}`,
        });
      } else {
        resolve({
          success: false,
          message: 'Invalid email or password.',
        });
      }
    }, 1000); // Simulate network delay
  });
}
