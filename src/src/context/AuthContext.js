import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, clearSession, hasStoredAccessToken } from '../api/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(async () => {
        if (!hasStoredAccessToken()) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const data = await getMe();
            if (!data) {
                clearSession();
                setUser(null);
            } else {
                setUser(data);
            }
        } catch {
            clearSession();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const logout = () => {
        clearSession();
        setUser(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, loadUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
