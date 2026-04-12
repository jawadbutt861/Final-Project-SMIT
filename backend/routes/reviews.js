const router = require('express').Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth');

// Post review
router.post('/', auth, async (req, res) => {
  try {
    const review = await Review.create({ ...req.body, reviewer: req.user.id });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get reviews for a provider
router.get('/provider/:providerId', async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('reviewer', 'name')
      .sort('-createdAt');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
