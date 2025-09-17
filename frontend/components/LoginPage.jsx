import { useState } from 'react';
import React from "react";
import { HospitalBuildingIcon, EmailIcon, LockIcon } from './icons/Icons';
import RegisterPage from './RegisterPage';
// eslint-disable-next-line react/prop-types
const LoginPage = ({ onLogin }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [HospitalName, setHospitalName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('http://13.201.97.49:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    password, 
                    hospitalName: HospitalName 
                })
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 409) {
                    alert(data.error || 'Email is registered with a different hospital');
                } else if (res.status === 404) {
                    // Hospital not found, show register page
                    setShowRegister({
                        hospitalName: HospitalName,
                        email,
                        password
                    });
                } else if (res.status === 401) {
                    alert(data.error || 'Invalid credentials');
                } else {
                    alert(data.error || 'Login failed');
                }
                return;
            }

            if (data.success && data.token) {
                // Store user data in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('hospitalName', data.hospitalName);
                localStorage.setItem('email', data.email);
                localStorage.setItem('userId', data.id);
                onLogin();
            } else {
                alert('Login failed: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = "block w-full rounded-lg border border-gray-300 bg-white py-3 pr-3 pl-10 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#062e3e] focus:ring-1 focus:ring-[#062e3e] sm:text-sm transition-colors";

    if (showRegister) {
        return <RegisterPage onRegister={onLogin} initialData={showRegister} />;
    }
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <img src="/assets/logo.png" alt="Logo" className="w-24 h-24 mx-auto mb-2" />
                    <h1 className="mt-4 text-3xl font-bold text-[#062e3e] tracking-tight">
                        Welcome Back!
                    </h1>
                    <p className="mt-2 text-gray-500">
                        Sign in to continue to your dashboard.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200/80">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hospital Name</label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <HospitalBuildingIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    id="hospital-name"
                                    name="Hospital Name"
                                    type="text"
                                    autoComplete="hospital-name"
                                    required
                                    value={HospitalName}
                                    onChange={(e) => setHospitalName(e.target.value)}
                                    className={inputClasses}
                                    placeholder="Your Hospital Name"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EmailIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputClasses}
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete={'current-password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={inputClasses}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#062e3e] hover:bg-[#04222f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#062e3e] disabled:opacity-75 transition-colors"
                        >
                            {isLoading ? 'Processing...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
