const express = require('express');
const Order = require('../models/Order');
const { auth, adminAuth } = require('../middleware/auth');
const { sendOrderConfirmation, sendStatusUpdate } = require('../utils/emailService');
const { sendWhatsAppNotification } = require('../utils/whatsappService');

const router = express.Router();

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      user: req.user.userId
    };

    const order = new Order(orderData);
    await order.save();
    await order.populate([
      { path: 'user', select: 'name email phone' },
      { path: 'items.product', select: 'name images price' }
    ]);

    // Send notifications
    try {
      await sendOrderConfirmation(order);
      await sendWhatsAppNotification(order);
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
      // Don't fail the order creation if notifications fail
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find({ user: req.user.userId })
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments({ user: req.user.userId });

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders (Admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search
    } = req.query;

    const query = {};
    
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const query = { _id: req.params.id };
    
    // Non-admin users can only see their own orders
    if (req.user.role !== 'admin') {
      query.user = req.user.userId;
    }

    const order = await Order.findOne(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images price category')
      .populate('statusHistory.updatedBy', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (Admin only)
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Add to status history
    order.statusHistory.push({
      status,
      note,
      updatedBy: req.user.userId
    });

    order.status = status;
    await order.save();

    // Send status update notification
    try {
      await sendStatusUpdate(order, status, note);
    } catch (notificationError) {
      console.error('Status notification error:', notificationError);
    }

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;