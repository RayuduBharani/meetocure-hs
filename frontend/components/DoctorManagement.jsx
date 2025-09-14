/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { Header } from "./Header";
import { UserCircleIcon } from "./icons/Icons";
import { useNavigate } from 'react-router-dom';

/* ---------------------- Doctor Management ---------------------- */
const DoctorManagement = ({ hospitalName }) => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDoctors = async () => {
        if (!hospitalName) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const res = await fetch(
                `/api/doctors/verified?hospitalName=${encodeURIComponent(hospitalName)}`
            );
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            
            // Handle the new data structure - data is now an array of objects with doctorVerification and doctor
            if (Array.isArray(data)) {
                setDoctors(data);
            } else {
                console.error('Unexpected data format:', data);
                setDoctors([]);
                setError('Unexpected data format received from server');
            }
        } catch (err) {
            console.error('Error fetching verified doctors:', err);
            setDoctors([]);
            setError('Failed to fetch verified doctors. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, [hospitalName]);

    if (loading) return <p className="p-8 text-gray-500">Loading verified doctors...</p>;

    return (
        <div>
            <Header title="Doctor Management" />
            <div className="p-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Verified Doctors</h2>
                    <button
                        onClick={fetchDoctors}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-1">
                    {doctors.length === 0 && !error && (
                        <div className="col-span-full text-center py-8">
                            <p className="text-gray-500 text-lg">No verified doctors found for this hospital.</p>
                            <p className="text-gray-400 text-sm mt-2">Doctors will appear here once they are verified.</p>
                        </div>
                    )}
                    {doctors.map((doctorData) => {
                        // Extract doctor verification data from the new structure
                        const doctorVerification = doctorData.doctorVerification;
                        return (
                            <DoctorCard 
                                key={doctorVerification._id} 
                                doctor={doctorVerification} 
                                onViewProfile={() => navigate(`/doctor/${doctorVerification._id}/stats`)} 
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

/* ---------------------- Doctor Card ---------------------- */
const DoctorCard = ({ doctor, onViewProfile }) => {
    const isVerified = doctor.verified === true;
    const doctorName = doctor.name || doctor.doctorName || doctor.fullName || doctor.email || 'No Name';
    const specialty = doctor.specialty || doctor.specialization || 'General Practice';
    
    return (
        <div
            className="bg-white rounded-2xl shadow-md border border-gray-200/80 flex flex-col items-center justify-center p-4 relative transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
            style={{ width: '250px', height: '220px', minWidth: '160px', minHeight: '160px' }}
            onClick={onViewProfile}
        >
            <span
                className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-full ${isVerified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
                {isVerified ? "Verified" : "Unverified"}
            </span>
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3 overflow-hidden">
                {doctor.profileImage ? (
                    <img 
                        src={doctor.profileImage} 
                        alt="Profile" 
                        className={`w-20 h-20 object-cover rounded-full border-4 ${isVerified ? 'border-green-400' : 'border-red-300'}`} 
                    />
                ) : (
                    <UserCircleIcon className="w-20 h-20 text-gray-300" />
                )}
            </div>
            <h3 className="text-lg font-bold text-gray-800 text-center mb-1">
                {doctorName}
            </h3>
            <p className="text-gray-500 text-xs text-center mt-1 truncate w-full">
                {specialty}
            </p>
            {doctor.hospitalInfo?.hospitalName && (
                <p className="text-gray-400 text-xs text-center mt-1 truncate w-full">
                    {doctor.hospitalInfo.hospitalName}
                </p>
            )}
        </div>
    );
};

export { DoctorManagement };
