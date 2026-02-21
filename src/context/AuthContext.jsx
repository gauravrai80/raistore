import { createContext, useContext, useState } from 'react';
import api from '@/api/client';
import { toast } from 'sonner';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('raistore_user');
        return stored ? JSON.parse(stored) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('raistore_token'));
    const [isLoading, setIsLoading] = useState(false);
    const saveSession = (nextToken, nextUser) => {
        localStorage.setItem('raistore_token', nextToken);
        localStorage.setItem('raistore_user', JSON.stringify(nextUser));
        setToken(nextToken);
        setUser(nextUser);
    };
    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            saveSession(data.token, data.user);
            toast.success(`Welcome back, ${data.user.full_name}!`);
        }
        finally {
            setIsLoading(false);
        }
    };
    const register = async (full_name, email, password) => {
        setIsLoading(true);
        try {
            const { data } = await api.post('/auth/register', { full_name, email, password });
            saveSession(data.token, data.user);
            toast.success('Account created!');
        }
        finally {
            setIsLoading(false);
        }
    };
    const logout = () => {
        localStorage.removeItem('raistore_token');
        localStorage.removeItem('raistore_user');
        setToken(null);
        setUser(null);
        toast.success('Logged out');
    };
    const updateProfile = async (data) => {
        const response = await api.put('/auth/profile', data);
        const updatedUser = { ...user, ...response.data };
        setUser(updatedUser);
        localStorage.setItem('raistore_user', JSON.stringify(updatedUser));
    };
    return (<AuthContext.Provider value={{
            user,
            token,
            isLoading,
            isAdmin: user?.role === 'admin',
            login,
            register,
            logout,
            updateProfile,
        }}>
      {children}
    </AuthContext.Provider>);
}
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
