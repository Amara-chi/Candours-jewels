import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Star, 
  ShoppingBag, 
  Truck, 
  Shield, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Palette,
  Ruler,
  Type
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: Array<{
    url: string;
    alt?: string;
  }>;
  category: {
    name: string;
    slug: string;
  };
  isCustomizable: boolean;
  customizationOptions: {
    materials: string[];
    sizes: string[];
    colors: string[];
    engravingOptions: {
      available: boolean;
      maxCharacters: number;
      additionalCost: number;
    };
  };
  specifications: {
    material: string;
    weight: string;
    dimensions: string;
    gemstones: string[];
  };
  flashSale: {
    active: boolean;
    discountPercentage?: number;
  };
  ratings: {
    average: number;
    count: number;
  };
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomization, setSelectedCustomization] = useState({
    material: '',
    size: '',
    color: '',
    engraving: {
      text: '',
      font: 'Arial',
      position: 'center'
    },
    specialInstructions: ''
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/products/${id}`);
      setProduct(response.data);
      
      // Set default customization options
      if (response.data.isCustomizable) {
        setSelectedCustomization(prev => ({
          ...prev,
          material: response.data.customizationOptions.materials[0] || '',
          size: response.data.customizationOptions.sizes[0] || '',
          color: response.data.customizationOptions.colors[0] || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    const customization = product.isCustomizable ? selectedCustomization : undefined;

    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || '',
      quantity,
      customization
    });
  };

  const nextImage = () => {
    if (product) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Product not found
          </h2>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={product.images[currentImageIndex]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {product.flashSale.active && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{product.flashSale.discountPercentage}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index
                        ? 'border-yellow-500'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                  {product.category.name}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Heart className="w-6 h-6" />
                </motion.button>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {product.name}
              </h1>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${
                        i < Math.floor(product.ratings.average) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                  <span className="ml-2 text-gray-600 dark:text-gray-300">
                    {product.ratings.average} ({product.ratings.count} reviews)
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Customization Options */}
            {product.isCustomizable && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Palette className="w-5 h-5 mr-2 text-yellow-500" />
                  Customize Your Jewelry
                </h3>

                {/* Material Selection */}
                {product.customizationOptions.materials.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Material
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {product.customizationOptions.materials.map((material) => (
                        <button
                          key={material}
                          onClick={() => setSelectedCustomization(prev => ({ ...prev, material }))}
                          className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                            selectedCustomization.material === material
                              ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                              : 'border-gray-200 dark:border-gray-600 hover:border-yellow-300'
                          }`}
                        >
                          {material}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {product.customizationOptions.sizes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Size
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.customizationOptions.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedCustomization(prev => ({ ...prev, size }))}
                          className={`px-4 py-2 text-sm rounded-lg border-2 transition-colors ${
                            selectedCustomization.size === size
                              ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                              : 'border-gray-200 dark:border-gray-600 hover:border-yellow-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {product.customizationOptions.colors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.customizationOptions.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedCustomization(prev => ({ ...prev, color }))}
                          className={`px-4 py-2 text-sm rounded-lg border-2 transition-colors ${
                            selectedCustomization.color === color
                              ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                              : 'border-gray-200 dark:border-gray-600 hover:border-yellow-300'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Engraving Options */}
                {product.customizationOptions.engravingOptions.available && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Type className="w-4 h-4 inline mr-1" />
                      Engraving (₹{product.customizationOptions.engravingOptions.additionalCost} extra)
                    </label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder={`Enter text (max ${product.customizationOptions.engravingOptions.maxCharacters} characters)`}
                        maxLength={product.customizationOptions.engravingOptions.maxCharacters}
                        value={selectedCustomization.engraving.text}
                        onChange={(e) => setSelectedCustomization(prev => ({
                          ...prev,
                          engraving: { ...prev.engraving, text: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={selectedCustomization.engraving.font}
                          onChange={(e) => setSelectedCustomization(prev => ({
                            ...prev,
                            engraving: { ...prev.engraving, font: e.target.value }
                          }))}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Times">Times</option>
                          <option value="Script">Script</option>
                        </select>
                        <select
                          value={selectedCustomization.engraving.position}
                          onChange={(e) => setSelectedCustomization(prev => ({
                            ...prev,
                            engraving: { ...prev.engraving, position: e.target.value }
                          }))}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="center">Center</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Any special requests or instructions..."
                    value={selectedCustomization.specialInstructions}
                    onChange={(e) => setSelectedCustomization(prev => ({
                      ...prev,
                      specialInstructions: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantity:
                </label>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add to Cart</span>
              </motion.button>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg">
                <Truck className="w-6 h-6 text-yellow-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Free Shipping</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">On orders above ₹10,000</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg">
                <Shield className="w-6 h-6 text-yellow-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Lifetime Warranty</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Complete protection</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg">
                <RotateCcw className="w-6 h-6 text-yellow-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Easy Returns</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">30-day return policy</p>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Material</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {product.specifications.material}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Weight</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {product.specifications.weight}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Dimensions</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {product.specifications.dimensions}
                  </p>
                </div>
                {product.specifications.gemstones.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Gemstones</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {product.specifications.gemstones.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;