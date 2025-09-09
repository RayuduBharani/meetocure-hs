import express from 'express';
const router = express.Router();

// Dummy endpoint for hospitals
router.get('/', (req, res) => {
    res.json([]); // Return empty array for now
});

export default router;
