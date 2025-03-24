const Shipping = require('../models/Shipping');
const Order = require('../models/Order');
const sendEmail = require('../utils/emailService');
const { StatusCodes } = require('http-status-codes');

// ➤ Save shipping details and send email notification
const addShippingDetails = async (req, res) => {
  const { orderId, address, trackingNumber, carrier } = req.body;

  // Check if order exists and populate user field
  const order = await Order.findById(orderId).populate('user');
  if (!order) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Order not found' });
  }

  // Ensure we are using the correct user (the one who placed the order)
  const shipping = await Shipping.create({
    user: order.user._id, // Use order's user, not req.user.userId
    order: orderId,
    address,
    trackingNumber,
    carrier,
    status: 'shipped',
    estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days delivery estimate
  });

  // Send email notification
  const emailSubject = 'Your Order Has Been Shipped!';
  const emailBody = `
  Dear ${order.user.name},

  Your order (#${order._id}) has been shipped! 🎉

  🔹 **Tracking Number:** ${trackingNumber}
  🔹 **Carrier:** ${carrier}
  🔹 **Estimated Delivery:** ${shipping.estimatedDeliveryDate.toDateString()}

  You can track your order with your carrier.

  Thank you for shopping with us! 🛍️

  Best Regards,  
  Your E-commerce Team`;

  // Check if the user has an email before sending
  if (order.user.email) {
    await sendEmail(order.user.email, emailSubject, emailBody);
  } else {
    console.error('No email found for the user');
  }

  res.status(StatusCodes.CREATED).json({ message: 'Shipping details added and email sent', shipping });
};


// ➤ Get shipping status
const getShippingStatus = async (req, res) => {
  const { orderId } = req.params;
  const shipping = await Shipping.findOne({ order: orderId });

  if (!shipping) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Shipping details not found' });

  res.status(StatusCodes.OK).json({ shipping });
};

module.exports = { addShippingDetails, getShippingStatus };
