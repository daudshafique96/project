'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [totp, setTotp] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleInitialLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        // 1. Submit credentials to the backend
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
            setStep(2); // Move to 2FA screen
            setError('');
        } else {
            setError('Invalid email or password');
        }
    };

    const handleMfaVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        // 2. Submit the TOTP code to finalize authentication
        const res = await fetch('http://localhost:5000/api/auth/verify-mfa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, token: totp }),
        });

        if (res.ok) {
            // The backend sets the HTTP-only cookie and returns the JWT
            const data = await res.json();
            localStorage.setItem('accessToken', data.accessToken);
            router.push('/dashboard');
        } else {
            setError('Invalid 2FA token');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white shadow rounded">
                <h2 className="text-2xl font-bold text-center mb-6">Secure SMS Login</h2>
                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                
                {step === 1 ? (
                    <form onSubmit={handleInitialLogin} className="space-y-4">
                        <input 
                            type="email" 
                            placeholder="Email" 
                            className="w-full p-2 border rounded"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            className="w-full p-2 border rounded"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
                            Login
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleMfaVerification} className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Enter 6-digit Authenticator Code" 
                            className="w-full p-2 border rounded"
                            maxLength={6}
                            value={totp} 
                            onChange={(e) => setTotp(e.target.value)} 
                            required 
                        />
                        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
                            Verify 2FA
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}