const router = require('express').Router();
const Job = require('../models/Job');
const auth = require('../middleware/auth');

// Create job (customer only)
router.post('/', auth, async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user.id });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all jobs with filters
router.get('/', async (req, res) => {
  try {
    const { category, location, minBudget, maxBudget, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (location) filter.location = new RegExp(location, 'i');
    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.$gte = Number(minBudget);
      if (maxBudget) filter.budget.$lte = Number(maxBudget);
    }
    if (search) filter.title = new RegExp(search, 'i');

    const jobs = await Job.find(filter).populate('postedBy', 'name city').sort('-createdAt');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name city')
      .populate('applicants', 'name city bio')
      .populate('hiredProvider', 'name city');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Apply to job (provider)
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.applicants.includes(req.user.id))
      return res.status(400).json({ message: 'Already applied' });

    job.applicants.push(req.user.id);
    await job.save();
    res.json({ message: 'Applied successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Hire a provider
router.post('/:id/hire/:providerId', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.postedBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    job.hiredProvider = req.params.providerId;
    job.status = 'in-progress';
    await job.save();
    res.json({ message: 'Provider hired' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark job complete
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    job.status = 'completed';
    await job.save();
    res.json({ message: 'Job marked complete' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my jobs
router.get('/user/mine', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id }).sort('-createdAt');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
