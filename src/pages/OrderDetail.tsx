import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  CreditCard, 
  Clock,
  CheckCircle,
  Truck,
  Calendar
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    images: Array<{ url: string }>;
  };
  quantity: number;
  price: number;
  customization?: {
    material?: string;
    size?: string;
    color?: string;
    engraving?: {
      text: string;
      font: string;
      position: string;
    };
    specialInstructions?: string;
  };
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  pricing: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };
  status: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Order not found');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'in_production':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-green-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order Pending';
      case 'confirmed':
        return 'Order Confirmed';
      case 'in_production':
        return 'In Production';
      case 'quality_check':
        return 'Quality Check';
      case 'ready_to_ship':
        return 'Ready to Ship';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.replace('_', ' ').toUpperCase();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Order not found
          </h2>
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate('/orders')}
              className="mr-4 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Order #{order.orderNumber}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Status */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Order Status
                </h2>
                
                <div className="space-y-4">
                  {order.statusHistory.map((status, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(status.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {getStatusText(status.status)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(status.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        {status.note && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {status.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {order.trackingNumber && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-200">
                      <strong>Tracking Number:</strong> {order.trackingNumber}
                    </p>
                  </div>
                )}

                {order.estimatedDelivery && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-green-800 dark:text-green-200">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      <strong>Estimated Delivery:</strong> {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Order Items
                </h2>
                
                <div className="space-y-6">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 pb-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      <img
                        src={item.product.images[0]?.url || '/placeholder-jewelry.jpg'}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {item.product.name}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <div>
                            <p className="text-gray-600 dark:text-gray-300">
                              Quantity: {item.quantity}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                              Price: ₹{item.price.toLocaleString()} each
                            </p>
                          </div>
                          <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>

                        {/* Customization Details */}
                        {item.customization && (
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              Customization Details:
                            </h4>
                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                              {item.customization.material && (
                                <p><strong>Material:</strong> {item.customization.material}</p>
                              )}
                              {item.customization.size && (
                                <p><strong>Size:</strong> {item.customization.size}</p>
                              )}
                              {item.customization.color && (
                                <p><strong>Color:</strong> {item.customization.color}</p>
                              )}
                              {item.customization.engraving?.text && (
                                <p>
                                  <strong>Engraving:</strong> "{item.customization.engraving.text}" 
                                  ({item.customization.engraving.font}, {item.customization.engraving.position})
                                </p>
                              )}
                              {item.customization.specialInstructions && (
                                <p><strong>Special Instructions:</strong> {item.customization.specialInstructions}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Order Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-yellow-500" />
                  Order Summary
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">
                      ₹{order.pricing.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Tax</span>
                    <span className="text-gray-900 dark:text-white">
                      ₹{order.pricing.tax.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Shipping</span>
                    <span className="text-gray-900 dark:text-white">
                      {order.pricing.shipping === 0 ? 'Free' : `₹${order.pricing.shipping.toLocaleString()}`}
                    </span>
                  </div>
                  {order.pricing.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Discount</span>
                      <span className="text-green-600 dark:text-green-400">
                        -₹{order.pricing.discount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-yellow-600 dark:text-yellow-400">
                        ₹{order.pricing.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-yellow-500" />
                  Shipping Address
                </h2>
                
                <div className="text-gray-600 dark:text-gray-300">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.shippingAddress.name}
                  </p>
                  <p>{order.shippingAddress.phone}</p>
                  <p className="mt-2">
                    {order.shippingAddress.street}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                    {order.shippingAddress.country}
                  </p>
                </div>
              </div>

              {/* Need Help */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Need Help?
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                  Contact our customer support for any questions about your order.
                </p>
                <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>📧 support@luxejewels.com</p>
                  <p>📞 +91 98765 43210</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetail;