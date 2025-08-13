import { ReactNode } from 'react';
import { AuthContext, useAuthMethods } from '@/lib/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const authMethods = useAuthMethods();

  return (
    <AuthContext.Provider value={authMethods}>
      {children}
    </AuthContext.Provider>
  );
};