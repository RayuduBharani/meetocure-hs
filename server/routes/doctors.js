import express from 'express';
import mongoose from 'mongoose';
import DoctorVerification from '../models/DoctorVerification.js';
import Doctor from '../models/Doctor.js';

const router = express.Router();

// GET doctors with verified filter and hospitalInfo.hospitalName match
router.get('/', async (req, res) => {
    try {
        const { hospitalName, verified } = req.query;
        const query = {};
        
        // Handle verified parameter - if not specified, default to unverified
        if (typeof verified !== 'undefined') {
            query.verified = String(verified).toLowerCase() === 'true';
        } else {
            // Default to unverified doctors if no verified parameter
            query.verified = false;
        }
        
        if (hospitalName) {
            query['hospitalInfo.hospitalName'] = { $regex: `^${hospitalName}$`, $options: 'i' };
        }
        
        // Find doctor verifications based on query
        const doctorVerifications = await DoctorVerification.find(query);
        
        // Get corresponding doctor records for each verification
        const doctorsWithVerifications = await Promise.all(
            doctorVerifications.map(async (verification) => {
                // Find doctor where verificationDetails points to this verification
                const doctor = await Doctor.findOne({ verificationDetails: verification._id });
                return {
                    doctorVerification: verification,
                    doctor: doctor
                };
            })
        );
        
        // Filter based on verification status
        let filteredDoctors;
        if (query.verified === true) {
            // For verified doctors, include only those that are verified in both collections
            filteredDoctors = doctorsWithVerifications.filter(item => 
                item.doctor && item.doctor.registrationStatus === "verified"
            );
        } else {
            // For unverified doctors, include only those that are not verified in the main Doctor collection
            filteredDoctors = doctorsWithVerifications.filter(item => 
                item.doctor && item.doctor.registrationStatus !== "verified"
            );
        }
        
        res.json(filteredDoctors);
            
    } catch (err) {
        console.error('Error fetching doctors:', err);
        res.status(500).json({ error: 'Failed to fetch doctors', details: err.message });
    }
});

// GET unverified doctors for a specific hospital
router.get('/unverified', async (req, res) => {
    try {
        const { hospitalName } = req.query;
        const query = { verified: false };
        
        if (hospitalName) {
            query['hospitalInfo.hospitalName'] = { $regex: `^${hospitalName}$`, $options: 'i' };
        }
        
        // Find unverified doctor verifications
        const doctorVerifications = await DoctorVerification.find(query);
        
        // Get corresponding doctor records for each verification
        const doctorsWithVerifications = await Promise.all(
            doctorVerifications.map(async (verification) => {
                // Find doctor where verificationDetails points to this verification
                const doctor = await Doctor.findOne({ verificationDetails: verification._id });
                return {
                    doctorVerification: verification,
                    doctor: doctor
                };
            })
        );
        
        // Filter to only include doctors that are not verified in the main Doctor collection
        const unverifiedDoctors = doctorsWithVerifications.filter(item => 
            item.doctor && item.doctor.registrationStatus !== "verified"
        );
        
        res.json(unverifiedDoctors);
    } catch (err) {
        console.error('Error fetching unverified doctors:', err);
        res.status(500).json({ error: 'Failed to fetch unverified doctors', details: err.message });
    }
});

// GET verified doctors for a specific hospital
router.get('/verified', async (req, res) => {
    try {
        const { hospitalName } = req.query;
        const query = { verified: true };
        
        if (hospitalName) {
            query['hospitalInfo.hospitalName'] = { $regex: `^${hospitalName}$`, $options: 'i' };
        }
        
        // Find verified doctor verifications
        const doctorVerifications = await DoctorVerification.find(query);
        
        // Get corresponding doctor records for each verification
        const doctorsWithVerifications = await Promise.all(
            doctorVerifications.map(async (verification) => {
                // Find doctor where verificationDetails points to this verification
                const doctor = await Doctor.findOne({ verificationDetails: verification._id });
                return {
                    doctorVerification: verification,
                    doctor: doctor
                };
            })
        );
        
        // Filter to only include doctors that are verified in both collections
        const verifiedDoctors = doctorsWithVerifications.filter(item => 
            item.doctor && item.doctor.registrationStatus === "verified"
        );
        
        res.json(verifiedDoctors);
    } catch (err) {
        console.error('Error fetching verified doctors:', err);
        res.status(500).json({ error: 'Failed to fetch verified doctors', details: err.message });
    }
});

// GET doctor by ID (with both verification and doctor data)
router.get('/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;
        
        // Validate doctorId
        if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid doctor ID format' 
            });
        }

        // Find the doctor verification record
        const doctorVerification = await DoctorVerification.findById(doctorId);
        if (!doctorVerification) {
            return res.status(404).json({ 
                success: false, 
                error: 'Doctor verification record not found' 
            });
        }

        // Find the corresponding doctor record
        const doctor = await Doctor.findOne({ verificationDetails: doctorId });
        
        // Return combined data
        res.json({
            success: true,
            data: {
                doctorVerification,
                doctor
            }
        });
    } catch (err) {
        console.error('Error fetching doctor:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch doctor', 
            details: err.message 
        });
    }
});


// PATCH verify doctor
router.patch('/:doctorId/verify', async (req, res) => {
    try {
        const { doctorId } = req.params;
        
        // Validate doctorId
        if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid doctor ID format' 
            });
        }

        // Find the doctor verification record
        const doctorVerification = await DoctorVerification.findById(doctorId);
        if (!doctorVerification) {
            return res.status(404).json({ 
                success: false, 
                error: 'Doctor verification record not found' 
            });
        }

        // Check if already verified
        if (doctorVerification.verified === true) {
            return res.status(400).json({ 
                success: false, 
                error: 'Doctor is already verified' 
            });
        }
        
        // Update verification status
        doctorVerification.verified = true;
        doctorVerification.registrationStatus = 'verified';
        const updatedVerification = await doctorVerification.save();
        
        // Update the main doctor record
        const doctorUpdateResult = await Doctor.updateOne({
            verificationDetails: doctorId
        }, {
            $set: {
                registrationStatus: 'verified'
            }
        });

        // Check if doctor record was updated
        if (doctorUpdateResult.matchedCount === 0) {
            console.warn(`Doctor record not found for verification ID: ${doctorId}`);
        }
        
        res.json({ 
            success: true, 
            message: 'Doctor verified successfully',
            data: {
                doctorVerification: updatedVerification,
                doctorUpdated: doctorUpdateResult.modifiedCount > 0
            }
        });
    } catch (err) {
        console.error('Error verifying doctor:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to verify doctor', 
            details: err.message 
        });
    }
});

// PATCH reject doctor
router.patch('/:doctorId/reject', async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { reason } = req.body; // Optional rejection reason
        
        // Validate doctorId
        if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid doctor ID format' 
            });
        }

        // Find the doctorVerification document
        const doctorVerification = await DoctorVerification.findById(doctorId);
        if (!doctorVerification) {
            return res.status(404).json({ 
                success: false, 
                error: 'Doctor verification record not found' 
            });
        }

        // Check if already rejected
        if (doctorVerification.registrationStatus === 'rejected') {
            return res.status(400).json({ 
                success: false, 
                error: 'Doctor is already rejected' 
            });
        }
        
        // Set verified to false and registrationStatus to rejected
        doctorVerification.verified = false;
        doctorVerification.registrationStatus = 'rejected';
        
        // Add rejection reason if provided
        if (reason) {
            doctorVerification.rejectionReason = reason;
        }
        
        const updatedVerification = await doctorVerification.save();

        // Update registrationStatus in main doctors collection
        const doctorUpdateResult = await Doctor.updateOne(
            { verificationDetails: doctorId },
            { $set: { registrationStatus: 'rejected' } }
        );

        // Check if doctor record was updated
        if (doctorUpdateResult.matchedCount === 0) {
            console.warn(`Doctor record not found for verification ID: ${doctorId}`);
        }

        res.json({ 
            success: true, 
            message: 'Doctor rejected successfully',
            data: {
                doctorVerification: updatedVerification,
                doctorUpdated: doctorUpdateResult.modifiedCount > 0
            }
        });
    } catch (err) {
        console.error('Error rejecting doctor:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to reject doctor', 
            details: err.message 
        });
    }
});

export default router;
