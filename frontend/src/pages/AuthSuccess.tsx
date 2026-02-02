
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            // Redirect to dashboard after successful login
            navigate('/dashboard');
        } else {
            console.error('No token found in OAuth callback');
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-cream-100">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-richred-600 rounded-full mb-4"></div>
                <h2 className="text-xl font-bold text-slate-900">Authenticating...</h2>
            </div>
        </div>
    );
};

export default AuthSuccess;
