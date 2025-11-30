import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { loginSchema } from '@/lib/validators';
import { AuthService } from '@/server/study-sessions/services/auth/AuthService';
import { LoginCredentials, AuthState } from '@/types/auth.types';

export function useLogin() {
  const router = useRouter();
  
  const [values, setValues] = useState<LoginCredentials>({ 
    email: '', 
    password: '' 
  });
  
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: false,
    errors: {},
    serverError: null,
  });
  
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const session = await AuthService.getSession();
      
      if (session) {
        router.push('/dashboard');
      } else {
        setIsChecking(false);
      }
    };
    
    checkSession();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setValues((prev) => ({ 
      ...prev, 
      [name]: value 
    }));
    
    if (authState.errors[name]) {
      setAuthState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          [name]: '',
        },
      }));
    }
  };

  const validateForm = (): boolean => {
    const parsed = loginSchema.safeParse(values);
    
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

  const handleLogin = async (e: React.FormEvent) => {
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

    const { session, error } = await AuthService.login(values);

    if (error || !session) {
      setAuthState({
        isLoading: false,
        errors: {},
        serverError: error || 'Login failed',
      });
      return;
    }

    router.push('/dashboard');
  };

  return {
    values,
    isChecking,
    isLoading: authState.isLoading,
    errors: authState.errors,
    serverError: authState.serverError,
    handleChange,
    handleLogin,
  };
}