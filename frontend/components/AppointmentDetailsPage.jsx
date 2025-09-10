import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from './Header';

const AppointmentDetailsPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    console.log(appointment);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        fetch(`/api/appointments/${appointmentId}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                if (data.success) {
                    setAppointment(data.data);
                } else {
                    setError(data.error || 'Failed to fetch appointment details');
                }
            })
            .catch((err) => {
                console.error("Error fetching appointment:", err);
                setError(`Error fetching appointment: ${err.message}`);
            })
            .finally(() => setLoading(false));
    }, [appointmentId]);

    const handlePreviewDocument = (fileUrl) => {
        setPreviewUrl(fileUrl);
        setShowPreview(true);
    };

    const closePreview = () => {
        setShowPreview(false);
        setPreviewUrl(null);
    };

    const getFileType = (url) => {
        const extension = url.split('.').pop().toLowerCase();
        if (['pdf'].includes(extension)) return 'pdf';
        if (['jpg', 'jpeg', 'png', 'g   if', 'webp'].includes(extension)) return 'image';
        if (['doc', 'docx'].includes(extension)) return 'document';
        return 'other';
    };

    const getFileIcon = (recordType, fileUrl) => {
        const fileType = getFileType(fileUrl);
        
        if (fileType === 'pdf') {
            return (
                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
            );
        } else if (fileType === 'image') {
            return (
                <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
            );
        } else {
            return (
                <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
            );
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 font-inter">
            <Header title="Appointment Details" />
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">Loading appointment details...</span>
                </div>
            </div>
        </div>
    );

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 font-inter">
                <Header title="Appointment Details" />
                <div className="w-full px-8 py-10">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <strong>Error:</strong> {error}
                    </div>
                </div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="min-h-screen bg-gray-50 font-inter">
                <Header title="Appointment Details" />
                <div className="w-full px-8 py-10">
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                        <strong>Warning:</strong> Appointment not found
                    </div>
                </div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'refunded': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-inter">
            <Header title="Appointment Details" />
            <div className="w-full px-8 py-10 space-y-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                {/* Appointment Overview */}
                <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
                    <div className="flex justify-between items-start mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                            <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Appointment Overview
                        </h2>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(appointment.status)}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Appointment Information</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Date</span>
                                    <span className="text-gray-900 font-semibold">
                                        {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Time</span>
                                    <span className="text-gray-900 font-semibold">{appointment.appointment_time}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Type</span>
                                    <span className="text-gray-900 font-semibold capitalize">{appointment.appointment_type}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Reason</span>
                                    <span className="text-gray-900 font-semibold">{appointment.reason || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Payment Information</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Amount:</span>
                                    <span className="text-lg font-bold text-gray-900">
                                     ₹ {appointment.payment?.amount || 0}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Status:</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(appointment.payment?.status)}`}>
                                        {appointment.payment?.status || 'pending'}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Payment Method:</span>
                                    <span className="text-gray-700">
                                        {appointment.payment?.payment_method ? 
                                            appointment.payment.payment_method.replace('_', ' ').toUpperCase() : 
                                            'Not specified'
                                        }
                                    </span>
                                </div>
                                
                                {appointment.payment?.transaction_id && (
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Transaction ID:</span>
                                        <span className="text-gray-700 font-mono text-sm">
                                            {appointment.payment.transaction_id}
                                        </span>
                                    </div>
                                )}
                                
                                {appointment.payment?.paid_at && (
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Paid At:</span>
                                        <span className="text-gray-700">
                                            {new Date(appointment.payment.paid_at).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                
                                {!appointment.payment?.paid_at && appointment.payment?.status === 'pending' && (
                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-yellow-800 text-sm">
                                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            Payment pending - No payment method specified
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


                {/* Patient Information */}
                <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                        <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Patient Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-700 mb-3">Basic Details</h4>
                            <div className="space-y-2">
                                <p><span className="font-medium">Name:</span> {appointment.patientInfo?.name || appointment.patient?.name || 'N/A'}</p>
                                <p><span className="font-medium">Email:</span> {appointment.patient?.email || 'N/A'}</p>
                                <p><span className="font-medium">Phone:</span> {appointment.patientInfo?.phone || appointment.patient?.phone || 'N/A'}</p>
                                <p><span className="font-medium">Age:</span> {appointment.patientInfo?.age || 'N/A'}</p>
                                <p><span className="font-medium">Gender:</span> <span className="capitalize">{appointment.patientInfo?.gender || appointment.patient?.gender || 'N/A'}</span></p>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="text-lg font-semibold text-gray-700 mb-3">Medical Information</h4>
                            <div className="space-y-2">
                                <p><span className="font-medium">Blood Group:</span> {appointment.patientInfo?.blood_group || appointment.patient?.medicalInfo?.bloodType || 'N/A'}</p>
                                <p><span className="font-medium">Allergies:</span> {appointment.patientInfo?.allergies?.length > 0 ? appointment.patientInfo.allergies.join(', ') : (appointment.patient?.medicalInfo?.allergies?.length > 0 ? appointment.patient.medicalInfo.allergies.join(', ') : 'None')}</p>
                                <p><span className="font-medium">Medical History:</span> {appointment.patientInfo?.medical_history_summary || appointment.patient?.medicalInfo?.medicalHistory || 'No medical history provided'}</p>
                            </div>
                        </div>
                    </div>
                    
                    {appointment.patientInfo?.note && appointment.patientInfo.note.trim() !== '' && (
                        <div className="mt-6">
                            <h4 className="text-lg font-semibold text-gray-700 mb-3">Appointment Notes</h4>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-gray-700">
                                    {appointment.patientInfo.note}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Medical Records */}
                {appointment.medicalRecords && appointment.medicalRecords.length > 0 && (
                    <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                                <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Medical Records
                            </h3>
                            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                                {appointment.medicalRecords.length} Document{appointment.medicalRecords.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {appointment.medicalRecords.map((record, index) => (
                                <div key={record._id || index} className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            {getFileIcon(record.record_type, record.file_url)}
                                            <div>
                                                <h4 className="font-semibold text-gray-900 capitalize text-lg group-hover:text-blue-600 transition-colors">
                                                    {record.record_type.replace('_', ' ')}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(record.upload_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                                            {record.record_type.toUpperCase()}
                                        </span>
                                    </div>

                                    {record.description && (
                                        <div className="mb-4">
                                            <p className="text-gray-600 font-medium mb-2 text-sm">Description:</p>
                                            <p className="text-gray-700 bg-white p-3 rounded-lg border border-gray-100 text-sm line-clamp-3">
                                                {record.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Additional Appointment Details for the Record */}
                                    <div className="space-y-2 mt-4">
                                        <p>
                                            <span className="font-medium">Appointment Date:</span>{' '}
                                            {record.appointment_date ? new Date(record.appointment_date).toLocaleDateString() : 'N/A'}
                                        </p>
                                        <p>
                                            <span className="font-medium">Appointment Time:</span>{' '}
                                            {record.appointment_time || 'N/A'}
                                        </p>
                                        <p>
                                            <span className="font-medium">Appointment Type:</span>{' '}
                                            <span className="capitalize">{record.appointment_type || 'N/A'}</span>
                                        </p>
                                        <p>
                                            <span className="font-medium">Reason:</span>{' '}
                                            {record.reason || 'N/A'}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center space-x-2 text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="text-xs">Medical Document</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handlePreviewDocument(record.file_url)}
                                                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Preview
                                            </button>
                                            <a 
                                                href={record.file_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Timestamps */}
                <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <svg className="w-6 h-6 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Timestamps
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-600 text-sm font-medium">Created At</p>
                            <p className="text-gray-900 font-semibold">{new Date(appointment.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-600 text-sm font-medium">Last Updated</p>
                            <p className="text-gray-900 font-semibold">{new Date(appointment.updatedAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Preview Modal */}
            {showPreview && previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">Document Preview</h3>
                            <button
                                onClick={closePreview}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            {getFileType(previewUrl) === 'pdf' ? (
                                <iframe
                                    src={previewUrl}
                                    className="w-full h-96 border border-gray-200 rounded-lg"
                                    title="Document Preview"
                                />
                            ) : getFileType(previewUrl) === 'image' ? (
                                <img
                                    src={previewUrl}
                                    alt="Document Preview"
                                    className="w-full h-auto max-h-96 object-contain border border-gray-200 rounded-lg"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg">
                                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-500 mb-4">Preview not available for this file type</p>
                                    <a
                                        href={previewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Open in New Tab
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentDetailsPage;

