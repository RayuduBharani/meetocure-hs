import React, { useState } from 'react';
import { MeetoCureLogoIcon, EmailIcon, HospitalBuildingIcon, LockIcon } from './icons/Icons';

export const LoginPage = ({ onLogin }) => {
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [HospitalName, setHospitalName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, hospitalName: HospitalName })
            });
            const data = await res.json();
            if (res.status === 409) {
                alert(data.error || 'This email is already registered for another hospital.');
            } else if (data.success && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('hospitalName', data.hospitalName);
                onLogin();
            } else {
                alert('Login failed: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            alert('Login error: ' + err.message);
        }
        setIsLoading(false);
    };

    const inputClasses = "block w-full rounded-lg border border-gray-300 bg-white py-3 pr-3 pl-10 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#062e3e] focus:ring-1 focus:ring-[#062e3e] sm:text-sm transition-colors";

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
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Hospital Name
                            </label>
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
