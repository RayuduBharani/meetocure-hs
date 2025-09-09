import express from 'express';
const router = express.Router();

// Dummy endpoint for appointments
router.get('/today', (req, res) => {
    res.json([]); // Return empty array for now
});

router.get('/weekly', (req, res) => {
    res.json([]); // Return empty array for now
});

export default router;
