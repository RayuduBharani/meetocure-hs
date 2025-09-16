/* eslint-disable react/prop-types */
import React, { useState } from 'react';
const RegisterPage = ({ onRegister, initialData }) => {
    const [form, setForm] = useState({
        address: '',
        contact: '',
        image: null
    });
    // Use initialData for hospitalName, email, password
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('hospitalName', initialData?.hospitalName || '');
            formData.append('email', initialData?.email || '');
            formData.append('password', initialData?.password || '');
            formData.append('address', form.address);
            formData.append('contact', form.contact);
            if (form.image) formData.append('image', form.image);
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                onRegister();
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            console.log(err)
            setError('Network error');
        }
        setIsLoading(false);
    };



    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="mt-4 text-3xl font-bold text-[#062e3e] tracking-tight">
                        Register Hospital
                    </h1>
                    <p className="mt-2 text-gray-500">
                        Please fill in the details to register your hospital.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200/80">
                    <form className="space-y-6" onSubmit={handleSubmit} encType="multipart/form-data">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hospital Name</label>
                            <input name="hospitalName" type="text" required value={initialData?.hospitalName || ''} disabled className="block w-full rounded-lg border border-gray-300 py-3 px-4 bg-gray-100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input name="email" type="email" required value={initialData?.email || ''} disabled className="block w-full rounded-lg border border-gray-300 py-3 px-4 bg-gray-100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input name="password" type="password" required value={initialData?.password || ''} disabled className="block w-full rounded-lg border border-gray-300 py-3 px-4 bg-gray-100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input name="address" type="text" required value={form.address} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 py-3 px-4" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contact</label>
                            <input name="contact" type="text" required value={form.contact} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 py-3 px-4" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hospital Image</label>
                            <input name="image" type="file" accept="image/*" onChange={handleChange} className="block w-full rounded-lg border border-gray-300 py-3 px-4" />
                        </div>
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        <button type="submit" disabled={isLoading} className="w-full py-3 px-4 rounded-lg bg-[#062e3e] text-white font-bold">
                            {isLoading ? 'Registering...' : 'Register'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
