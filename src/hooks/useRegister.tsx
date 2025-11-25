import { useState } from 'react';
import { useRouter } from 'next/router';
import { registerSchema } from '@/lib/validators';
import { AuthService } from '@/server/study-sessions/services/auth/AuthService';
import { RegisterCredentials, AuthState } from '@/types/auth.types';

export function useRegister() {
  const router = useRouter();
  
  const [values, setValues] = useState<RegisterCredentials>({ 
    name: '',
    email: '', 
    password: '' 
  });
  
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: false,
    errors: {},
    serverError: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setValues((prev) => ({ 
      ...prev, 
      [name]: value 
    }));
    
    setAuthState({
      isLoading: false,
      errors: {},
      serverError: null,
    });
  };

  const validateForm = (): boolean => {
    const parsed = registerSchema.safeParse(values);
    
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      
      setAuthState((prev) => ({
        ...prev,
        errors: fieldErrors,
        serverError: null,
      }));
      
      return false;
    }
    
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setAuthState({
      isLoading: true,
      errors: {},
      serverError: null,
    });

    if (!validateForm()) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const { session, error } = await AuthService.register(values);

    if (error || !session) {
      setAuthState({
        isLoading: false,
        errors: {},
        serverError: error || 'Registration failed',
      });
      return;
    }

    router.push('/dashboard');
  };

  return {
    values,
    isLoading: authState.isLoading,
    errors: authState.errors,
    serverError: authState.serverError,
    handleChange,
    handleRegister,
  };
}