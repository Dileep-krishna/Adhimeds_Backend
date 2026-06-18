import dotenv from 'dotenv';
import Order from '../model/Order.js';

dotenv.config();

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req, res) => {
  console.log("📨 Create order request received");
  console.log("   Body:", req.body);
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    console.log("❌ Missing cart items");
    return res.status(400).json({ success: false, message: 'Cart items are required' });
  }

  try {
    const total = items.reduce(
      (sum, item) => sum + (item.mrp || 0) * item.quantity,
      0
    );

    const order = new Order({
      items,
      total,
      status: 'pending', // overall order status (optional)
    });

    await order.save();
    console.log("✅ Order created with ID:", order._id);

    res.status(201).json({
      success: true,
      data: { orderId: order._id, order },
      message: 'Order placed successfully!',
    });
  } catch (error) {
    console.error("🔥 Order creation error:", error);
    res.status(500).json({ success: false, message: error.message || 'Failed to place order' });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Public
export const getAllOrders = async (req, res) => {
  console.log("📨 Fetching all orders");
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${orders.length} orders`);
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("🔥 Error fetching orders:", error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch orders' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public
export const getOrderById = async (req, res) => {
  const { id } = req.params;
  console.log(`📨 Fetching order with ID: ${id}`);
  try {
    const order = await Order.findById(id);
    if (!order) {
      console.log("❌ Order not found");
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    console.log("✅ Order found");
    res.json({ success: true, data: order });
  } catch (error) {
    console.error("🔥 Error fetching order:", error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch order' });
  }
};

// @desc    Update a single item's status inside an order
// @route   PUT /api/orders/:orderId/items/:itemId
// @access  Public
export const updateItemStatus = async (req, res) => {
  const { orderId, itemId } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    item.status = status;
    await order.save();

    res.json({ success: true, data: order, message: 'Item status updated' });
  } catch (error) {
    console.error("🔥 Error updating item status:", error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update item status' });
  }
};

// @desc    Delete a single item from an order
// @route   DELETE /api/orders/:orderId/items/:itemId
// @access  Public
export const deleteItemFromOrder = async (req, res) => {
  const { orderId, itemId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Remove the item
    order.items.pull(itemId);

    // If no items left, delete the entire order
    if (order.items.length === 0) {
      await Order.findByIdAndDelete(orderId);
      return res.json({
        success: true,
        message: 'Last item deleted, order removed',
      });
    }

    // Recalculate total
    order.total = order.items.reduce(
      (sum, i) => sum + (i.mrp || 0) * (i.quantity || 1),
      0
    );

    await order.save();

    res.json({
      success: true,
      data: order,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    console.error("🔥 Error deleting item:", error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete item',
    });
  }
};