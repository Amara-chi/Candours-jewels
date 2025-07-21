const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    alt: String
  }],
  isCustomizable: {
    type: Boolean,
    default: false
  },
  customizationOptions: {
    materials: [String],
    sizes: [String],
    colors: [String],
    engravingOptions: {
      available: {
        type: Boolean,
        default: false
      },
      maxCharacters: Number,
      additionalCost: Number
    }
  },
  inventory: {
    inStock: {
      type: Boolean,
      default: true
    },
    quantity: {
      type: Number,
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 5
    }
  },
  specifications: {
    material: String,
    weight: String,
    dimensions: String,
    gemstones: [String]
  },
  tags: [String],
  featured: {
    type: Boolean,
    default: false
  },
  flashSale: {
    active: {
      type: Boolean,
      default: false
    },
    endDate: Date,
    discountPercentage: Number
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for search functionality
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);