// src/services/mockAuthService.ts

interface LoginResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  role: string;
}

const mockLogin = (email: string, password: string): Promise<LoginResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate a successful login for any credentials
      // In a real mock, you might check for specific dummy credentials
      if (email && password) {
        resolve({
          token: 'mock-jwt-token-12345',
          type: 'Bearer',
          id: 1,
          username: email,
          role: 'AGENT', // Default role for mock login
        });
      } else {
        reject({ response: { status: 401, data: { message: 'Invalid credentials' } } });
      }
    }, 500); // Simulate network delay
  });
};

export default {
  mockLogin,
};
