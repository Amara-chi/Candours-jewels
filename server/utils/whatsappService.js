const axios = require('axios');

const sendWhatsAppNotification = async (order) => {
  try {
    // This is a placeholder for WhatsApp API integration
    // You'll need to replace this with your actual WhatsApp API credentials and endpoint
    
    const message = `
🆕 New Order Received!

Order #: ${order.orderNumber}
Customer: ${order.user.name}
Phone: ${order.user.phone || order.shippingAddress.phone}
Total: ₹${order.pricing.total}

Items:
${order.items.map(item => `• ${item.product.name} (Qty: ${item.quantity})`).join('\n')}

Address: ${order.shippingAddress.street}, ${order.shippingAddress.city}

Please check the admin panel for full details.
    `;

    // Example using a WhatsApp Business API service
    // Replace with your actual API endpoint and credentials
    if (process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN) {
      await axios.post(process.env.WHATSAPP_API_URL, {
        phone: process.env.ADMIN_WHATSAPP_NUMBER,
        message: message
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('WhatsApp notification sent');
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    // Don't throw error to prevent order creation failure
  }
};

module.exports = {
  sendWhatsAppNotification
};