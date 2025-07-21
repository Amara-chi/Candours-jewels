const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@jewelrystore.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 98765 43210'
    });
    await adminUser.save();

    // Create regular user
    const regularUser = new User({
      name: 'John Doe',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
      phone: '+91 98765 43211',
      address: {
        street: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      }
    });
    await regularUser.save();

    console.log('Created users');

    // Create categories
    const categories = [
      {
        name: 'Necklaces',
        slug: 'necklaces',
        description: 'Beautiful necklaces for every occasion',
        isActive: true,
        sortOrder: 1
      },
      {
        name: 'Rings',
        slug: 'rings',
        description: 'Elegant rings including engagement and wedding rings',
        isActive: true,
        sortOrder: 2
      },
      {
        name: 'Bracelets',
        slug: 'bracelets',
        description: 'Stylish bracelets and bangles',
        isActive: true,
        sortOrder: 3
      },
      {
        name: 'Earrings',
        slug: 'earrings',
        description: 'Stunning earrings for all styles',
        isActive: true,
        sortOrder: 4
      },
      {
        name: 'Anklets',
        slug: 'anklets',
        description: 'Delicate anklets and ankle chains',
        isActive: true,
        sortOrder: 5
      }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log('Created categories');

    // Create products
    const products = [
      {
        name: 'Diamond Eternity Ring',
        description: 'A stunning diamond eternity ring crafted with precision. Features brilliant cut diamonds set in 18k white gold. Perfect for engagements, anniversaries, or as a symbol of eternal love.',
        price: 45000,
        originalPrice: 50000,
        category: createdCategories[1]._id, // Rings
        images: [
          {
            url: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=800',
            publicId: 'diamond-ring-1',
            alt: 'Diamond Eternity Ring'
          }
        ],
        isCustomizable: true,
        customizationOptions: {
          materials: ['18k White Gold', '18k Yellow Gold', 'Platinum'],
          sizes: ['5', '6', '7', '8', '9', '10'],
          colors: ['White Gold', 'Yellow Gold', 'Rose Gold'],
          engravingOptions: {
            available: true,
            maxCharacters: 20,
            additionalCost: 2000
          }
        },
        specifications: {
          material: '18k White Gold',
          weight: '3.5g',
          dimensions: '2mm width',
          gemstones: ['Diamond']
        },
        featured: true,
        ratings: {
          average: 4.8,
          count: 24
        },
        status: 'active'
      },
      {
        name: 'Gold Pearl Necklace',
        description: 'Elegant gold necklace featuring lustrous pearls. Handcrafted with 22k gold and natural freshwater pearls. A timeless piece that adds sophistication to any outfit.',
        price: 32000,
        category: createdCategories[0]._id, // Necklaces
        images: [
          {
            url: 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=800',
            publicId: 'gold-pearl-necklace-1',
            alt: 'Gold Pearl Necklace'
          }
        ],
        isCustomizable: true,
        customizationOptions: {
          materials: ['22k Gold', '18k Gold'],
          sizes: ['16 inches', '18 inches', '20 inches'],
          colors: ['Yellow Gold', 'Rose Gold']
        },
        specifications: {
          material: '22k Gold with Freshwater Pearls',
          weight: '15g',
          dimensions: '18 inches length',
          gemstones: ['Pearl']
        },
        featured: true,
        ratings: {
          average: 4.9,
          count: 18
        },
        status: 'active'
      },
      {
        name: 'Emerald Tennis Bracelet',
        description: 'Luxurious tennis bracelet featuring emerald gemstones. Set in sterling silver with a secure clasp. Perfect for special occasions and formal events.',
        price: 28000,
        originalPrice: 35000,
        category: createdCategories[2]._id, // Bracelets
        images: [
          {
            url: 'https://images.pexels.com/photos/1454172/pexels-photo-1454172.jpeg?auto=compress&cs=tinysrgb&w=800',
            publicId: 'emerald-bracelet-1',
            alt: 'Emerald Tennis Bracelet'
          }
        ],
        isCustomizable: false,
        specifications: {
          material: 'Sterling Silver',
          weight: '8g',
          dimensions: '7 inches length',
          gemstones: ['Emerald']
        },
        flashSale: {
          active: true,
          discountPercentage: 20
        },
        ratings: {
          average: 4.7,
          count: 12
        },
        status: 'active'
      },
      {
        name: 'Ruby Drop Earrings',
        description: 'Exquisite ruby drop earrings that catch the light beautifully. Crafted in 18k gold with natural ruby gemstones. Elegant and perfect for evening wear.',
        price: 22000,
        category: createdCategories[3]._id, // Earrings
        images: [
          {
            url: 'https://images.pexels.com/photos/1454173/pexels-photo-1454173.jpeg?auto=compress&cs=tinysrgb&w=800',
            publicId: 'ruby-earrings-1',
            alt: 'Ruby Drop Earrings'
          }
        ],
        isCustomizable: true,
        customizationOptions: {
          materials: ['18k Gold', '14k Gold'],
          colors: ['Yellow Gold', 'White Gold', 'Rose Gold']
        },
        specifications: {
          material: '18k Gold',
          weight: '4g',
          dimensions: '1.5 inches drop',
          gemstones: ['Ruby']
        },
        ratings: {
          average: 4.6,
          count: 8
        },
        status: 'active'
      },
      {
        name: 'Silver Chain Anklet',
        description: 'Delicate silver chain anklet with a beautiful charm. Made from pure sterling silver with an adjustable length. Perfect for summer and beach wear.',
        price: 8500,
        category: createdCategories[4]._id, // Anklets
        images: [
          {
            url: 'https://images.pexels.com/photos/1454174/pexels-photo-1454174.jpeg?auto=compress&cs=tinysrgb&w=800',
            publicId: 'silver-anklet-1',
            alt: 'Silver Chain Anklet'
          }
        ],
        isCustomizable: true,
        customizationOptions: {
          materials: ['Sterling Silver', '925 Silver'],
          sizes: ['8 inches', '9 inches', '10 inches'],
          engravingOptions: {
            available: true,
            maxCharacters: 15,
            additionalCost: 500
          }
        },
        specifications: {
          material: 'Sterling Silver',
          weight: '2g',
          dimensions: '9 inches adjustable',
          gemstones: []
        },
        ratings: {
          average: 4.5,
          count: 15
        },
        status: 'active'
      },
      {
        name: 'Sapphire Engagement Ring',
        description: 'Breathtaking sapphire engagement ring with diamond accents. Features a center sapphire surrounded by brilliant diamonds in a classic setting.',
        price: 65000,
        category: createdCategories[1]._id, // Rings
        images: [
          {
            url: 'https://images.pexels.com/photos/1454175/pexels-photo-1454175.jpeg?auto=compress&cs=tinysrgb&w=800',
            publicId: 'sapphire-ring-1',
            alt: 'Sapphire Engagement Ring'
          }
        ],
        isCustomizable: true,
        customizationOptions: {
          materials: ['Platinum', '18k White Gold', '18k Yellow Gold'],
          sizes: ['4', '5', '6', '7', '8', '9', '10'],
          colors: ['White Gold', 'Yellow Gold', 'Platinum'],
          engravingOptions: {
            available: true,
            maxCharacters: 25,
            additionalCost: 3000
          }
        },
        specifications: {
          material: 'Platinum',
          weight: '4.2g',
          dimensions: '8mm center stone',
          gemstones: ['Sapphire', 'Diamond']
        },
        featured: true,
        ratings: {
          average: 5.0,
          count: 6
        },
        status: 'active'
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log('Created products');

    // Create sample orders
    const sampleOrders = [
      {
        user: regularUser._id,
        items: [
          {
            product: createdProducts[0]._id,
            quantity: 1,
            price: createdProducts[0].price,
            customization: {
              material: '18k White Gold',
              size: '7',
              engraving: {
                text: 'Forever Yours',
                font: 'Script',
                position: 'center'
              }
            }
          }
        ],
        shippingAddress: {
          name: 'John Doe',
          phone: '+91 98765 43211',
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        pricing: {
          subtotal: 45000,
          tax: 8100,
          shipping: 0,
          discount: 0,
          total: 53100
        },
        status: 'confirmed',
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
          },
          {
            status: 'confirmed',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            note: 'Order confirmed and payment received'
          }
        ],
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      {
        user: regularUser._id,
        items: [
          {
            product: createdProducts[1]._id,
            quantity: 1,
            price: createdProducts[1].price
          },
          {
            product: createdProducts[4]._id,
            quantity: 1,
            price: createdProducts[4].price
          }
        ],
        shippingAddress: {
          name: 'John Doe',
          phone: '+91 98765 43211',
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        pricing: {
          subtotal: 40500,
          tax: 7290,
          shipping: 500,
          discount: 0,
          total: 48290
        },
        status: 'shipped',
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          },
          {
            status: 'confirmed',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
          },
          {
            status: 'in_production',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          },
          {
            status: 'shipped',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            note: 'Package shipped via Express Delivery'
          }
        ],
        trackingNumber: 'TRK123456789',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      }
    ];

    await Order.insertMany(sampleOrders);
    console.log('Created sample orders');

    console.log('✅ Database seeded successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('Admin: admin@jewelrystore.com / admin123');
    console.log('User: user@example.com / user123');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Connect to MongoDB and seed data
const connectAndSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelry-store');
    console.log('Connected to MongoDB');
    await seedData();
    process.exit(0);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

connectAndSeed();