const router = require('express').Router();
const Service = require('../models/Service');
const auth = require('../middleware/auth');

// Create service
router.post('/', auth, async (req, res) => {
  try {
    const service = await Service.create({ ...req.body, provider: req.user.id });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all services with filters
router.get('/', async (req, res) => {
  try {
    const { category, location, minPrice, maxPrice, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (location) filter.location = new RegExp(location, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.title = new RegExp(search, 'i');

    const services = await Service.find(filter).populate('provider', 'name city bio').sort('-createdAt');
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my services
router.get('/user/mine', auth, async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user.id }).sort('-createdAt');
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update service
router.put('/:id', auth, async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, provider: req.user.id },
      req.body,
      { new: true }
    );
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete service
router.delete('/:id', auth, async (req, res) => {
  try {
    await Service.findOneAndDelete({ _id: req.params.id, provider: req.user.id });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
