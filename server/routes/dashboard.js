import express from 'express';
const router = express.Router();

// Dummy endpoint for dashboard activity
router.get('/activity', (req, res) => {
    res.json([]); // Return empty array for now
});

export default router;
