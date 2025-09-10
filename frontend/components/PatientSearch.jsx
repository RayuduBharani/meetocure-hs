import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { AppointmentHistoryItem } from './AppointmentHistoryItem';
import { Header } from './Header';
import { UserCircleIcon } from './icons/Icons';

const AppointmentDetailModal = ({ appointment, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Appointment Details</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-gray-500">Doctor</p>
                    <p className="font-semibold text-gray-800">{appointment.doctor.name} ({appointment.doctor.specialty})</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-semibold text-gray-800">{appointment.date} at {appointment.time}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold text-gray-800">{appointment.status}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">{appointment.details || 'No additional details available.'}</p>
                </div>
            </div>
            <div className="mt-6 text-right">
                <button
                    onClick={onClose}
                    className="bg-gray-200 text-gray-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
);

const PatientRow = ({ patient, onView }) => (
    <div onClick={() => onView(patient)} className="grid grid-cols-5 items-center py-4 px-2 border-b border-gray-200/80 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer">
        <div className="flex items-center gap-4 col-span-2">
            <UserCircleIcon className="w-10 h-10 text-gray-400" />
            <span className="font-medium text-gray-800">{patient.name}</span>
        </div>
        <div className="text-gray-600">{patient.patientId}</div>
        <div className="text-gray-600">{patient.email}</div>
        <div className="text-gray-600">{patient.phone}</div>
    </div>
);

export const PatientSearch = ({ initialSearchTarget, onExitPatientView, getPageTitle }) => {
    // PDF download handler
    const handleDownloadPDF = () => {
        if (filteredPatients.length === 0) {
            alert('No patients to download. Please ensure there are patients in the list.');
            return;
        }

        try {
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(20);
            doc.text('Patient Directory', 14, 22);
            
            // Add hospital name if available
            const hospitalName = localStorage.getItem('hospitalName');
            if (hospitalName) {
                doc.setFontSize(12);
                doc.text(`Hospital: ${hospitalName}`, 14, 30);
            }
            
            // Add generation date
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);
            
            // Prepare table data
            const tableColumn = ["Name", "Patient ID", "Gender", "Phone", "Email", "Date of Birth"];
            const tableRows = filteredPatients.map(patient => [
                patient.name || 'N/A',
                patient.patientId || 'N/A',
                patient.gender || 'N/A',
                patient.phone || 'N/A',
                patient.email || 'N/A',
                patient.dateOfBirth || 'N/A'
            ]);
            
            // Add table
            autoTable(doc, { 
                head: [tableColumn], 
                body: tableRows,
                startY: 45,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [66, 139, 202] },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            });
            
            // Add footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
            }
            
            doc.save(`patients_${hospitalName || 'directory'}_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
    };
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch patients who booked appointments to verified doctors for the hospital
    const fetchPatients = async () => {
        const hospitalName = localStorage.getItem('hospitalName') || '';
        
        if (!hospitalName) {
            setError('Hospital name not found. Please log in again.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/patients?hospitalName=${encodeURIComponent(hospitalName)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (Array.isArray(data)) {
                setPatients(data);
                setFilteredPatients(data);
            } else {
                console.error('Unexpected data format:', data);
                setError('Unexpected data format received from server');
                setPatients([]);
                setFilteredPatients([]);
            }
        } catch (err) {
            console.error("Error fetching patients:", err);
            setError('Failed to fetch patients. Please try again.');
            setPatients([]);
            setFilteredPatients([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);


    useEffect(() => {
        if (initialSearchTarget && patients.length > 0) {
            const patientToView = patients.find(p => p.id === initialSearchTarget.id);
            if (patientToView) {
                setSelectedPatient(patientToView);
                setViewMode('detail');
            }
        } else {
            setViewMode('list');
        }
    }, [initialSearchTarget, patients]);

    useEffect(() => {
        const query = searchQuery.toLowerCase();
        if (!query) {
            setFilteredPatients(patients);
        } else {
            setFilteredPatients(
                patients.filter(p =>
                    (p.name && p.name.toLowerCase().includes(query)) ||
                    (p.patientId && p.patientId.toLowerCase().includes(query)) ||
                    (p.phone && p.phone.includes(query)) ||
                    (p.email && p.email.toLowerCase().includes(query))
                )
            );
        }
    }, [searchQuery, patients]);

    const handleViewAppointmentDetails = (appointment) => {
        setSelectedAppointment(appointment);
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedPatient(null);
        onExitPatientView();
    }

    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        setViewMode('detail');
    }

    const searchPlaceholder = viewMode === 'list' ? 'Search by Patient Name, ID, or Phone...' : undefined;

    if (viewMode === 'detail' && selectedPatient) {
        return (
            <>
                <Header title={getPageTitle(true)} />
                <div className="p-8 space-y-6">
                    <button
                        onClick={handleBackToList}
                        className="text-[#062e3e] font-semibold hover:underline flex items-center gap-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Back to patient list
                    </button>
                    <div className="bg-white p-6 rounded-2xl shadow-md space-y-6 border border-gray-200/80">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                <UserCircleIcon className="w-24 h-24 text-gray-300" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{selectedPatient.name}</h2>
                                <p className="text-gray-500 mt-1">
                                    Patient ID: {selectedPatient.patientId}
                                </p>
                                <p className="text-gray-500">
                                    {selectedPatient.email} | {selectedPatient.phone}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Appointment History</h3>
                            <div className="space-y-3">
                                {selectedPatient.appointments && selectedPatient.appointments.length > 0 ? selectedPatient.appointments.map(app => (
                                    <AppointmentHistoryItem key={app.id} appointment={app} onViewDetails={handleViewAppointmentDetails} />
                                )) : <p className="text-gray-500 p-4 text-center">No appointment history found for this patient.</p>}
                            </div>
                        </div>
                    </div>
                    {selectedAppointment && (
                        <AppointmentDetailModal
                            appointment={selectedAppointment}
                            onClose={() => setSelectedAppointment(null)}
                        />
                    )}
                </div>
            </>
        );
    }

    if (loading) {
        return (
            <>
                <Header title={getPageTitle(false)} />
                <div className="p-8">
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">Loading patients...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header
                title={getPageTitle(false)}
                searchPlaceholder={searchPlaceholder}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
            />
            <div className="p-8">
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200/80">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-gray-800">Patient Directory</h2>
                        <div className="flex gap-3">
                            <button
                                onClick={fetchPatients}
                                disabled={loading}
                                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Refreshing...' : 'Refresh'}
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                disabled={filteredPatients.length === 0}
                                className="bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Download PDF
                            </button>
                        </div>
                    </div>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPatients.map(patient => (
                                    <tr 
                                        key={patient.id} 
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleSelectPatient(patient)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                                            <UserCircleIcon className="w-8 h-8 text-gray-400" />
                                            <span className="font-medium text-gray-800">{patient.name || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{patient.patientId || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{patient.gender || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{patient.phone || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{patient.email || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{patient.dateOfBirth || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredPatients.length === 0 && !error && (
                            <div className="text-center py-8">
                                <p className="text-gray-500 text-lg">No patients found.</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    {searchQuery ? 'Try adjusting your search criteria.' : 'Patients will appear here once they book appointments with verified doctors.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
