import React, {type ReactNode, useEffect, useState} from 'react';
import {authService} from '../services/api';
import type {LoginRequest, User} from '../types';
import {AuthContext} from "./BaseContext";

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
}


interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Check if user is already logged in
        const accessToken = localStorage.getItem('accessToken');
        const userJson = localStorage.getItem('user');

        if (accessToken && userJson) {
            try {
                const userData = JSON.parse(userJson);
                setUser(userData);
            } catch (error) {
                console.error('Failed to parse user data:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
            }
        }

        setIsLoading(false);
    }, []);

    const login = async (data: LoginRequest) => {
        setIsLoading(true);
        try {
            const response = await authService.login(data);

            localStorage.setItem('accessToken', response.accessToken);

            // Create a user object from the email
            const userData: User = {
                id: 'admin',
                email: response.email,
                username: 'Admin',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
