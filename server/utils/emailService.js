const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // or your preferred email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Email templates
const getOrderConfirmationTemplate = (order) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #000000, #FFD700); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .total { font-weight: bold; font-size: 18px; color: #FFD700; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
          <p>Thank you for your order!</p>
        </div>
        <div class="content">
          <h2>Order #${order.orderNumber}</h2>
          <p>Hi ${order.user.name},</p>
          <p>We've received your order and will begin processing it soon.</p>
          
          <div class="order-details">
            <h3>Order Details:</h3>
            ${order.items.map(item => `
              <div class="item">
                <strong>${item.product.name}</strong><br>
                Quantity: ${item.quantity}<br>
                Price: ₹${item.price}
              </div>
            `).join('')}
            <div class="total">
              Total: ₹${order.pricing.total}
            </div>
          </div>
          
          <div class="order-details">
            <h3>Shipping Address:</h3>
            <p>
              ${order.shippingAddress.name}<br>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
            </p>
          </div>
        </div>
        <div class="footer">
          <p>We'll send you updates as your order progresses.</p>
          <p>Thank you for choosing our jewelry store!</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getStatusUpdateTemplate = (order, status, note) => {
  const statusMessages = {
    confirmed: 'Your order has been confirmed and is being prepared.',
    in_production: 'Your custom jewelry is now being crafted by our artisans.',
    quality_check: 'Your jewelry is undergoing final quality checks.',
    ready_to_ship: 'Your order is ready and will be shipped soon.',
    shipped: 'Your order has been shipped and is on its way to you.',
    delivered: 'Your order has been delivered. We hope you love it!'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #000000, #FFD700); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .status-update { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #FFD700; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Update</h1>
          <p>Order #${order.orderNumber}</p>
        </div>
        <div class="content">
          <p>Hi ${order.user.name},</p>
          <div class="status-update">
            <h3>Status: ${status.replace('_', ' ').toUpperCase()}</h3>
            <p>${statusMessages[status] || 'Your order status has been updated.'}</p>
            ${note ? `<p><strong>Note:</strong> ${note}</p>` : ''}
          </div>
        </div>
        <div class="footer">
          <p>Thank you for choosing our jewelry store!</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send order confirmation
const sendOrderConfirmation = async (order) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: getOrderConfirmationTemplate(order)
    };

    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent');
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Send status update
const sendStatusUpdate = async (order, status, note) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.user.email,
      subject: `Order Update - ${order.orderNumber}`,
      html: getStatusUpdateTemplate(order, status, note)
    };

    await transporter.sendMail(mailOptions);
    console.log('Status update email sent');
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

module.exports = {
  sendOrderConfirmation,
  sendStatusUpdate
};