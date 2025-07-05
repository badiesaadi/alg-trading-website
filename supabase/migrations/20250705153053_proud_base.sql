/*
  # Seed products table with sample data

  1. Sample Products
    - Premium Wireless Headphones
    - Smart Fitness Watch
    - Portable Bluetooth Speaker
    - Wireless Charging Pad
    - USB-C Hub
    - Laptop Stand
    - Blue Light Glasses
    - Ergonomic Mouse Pad

  2. Data Features
    - Realistic product names and descriptions
    - Varied pricing ($15 - $299)
    - Different stock levels (including some out of stock)
    - High-quality product images from Pexels
*/

INSERT INTO products (name, description, price, stock, image_url) VALUES
(
  'Premium Wireless Headphones',
  'High-quality over-ear headphones with active noise cancellation, 30-hour battery life, and premium sound quality. Perfect for music lovers and professionals.',
  299.99,
  15,
  'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg'
),
(
  'Smart Fitness Watch',
  'Advanced fitness tracker with heart rate monitoring, GPS, sleep tracking, and 7-day battery life. Compatible with iOS and Android.',
  199.99,
  8,
  'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg'
),
(
  'Portable Bluetooth Speaker',
  'Compact waterproof speaker with 360-degree sound, 12-hour battery, and deep bass. Perfect for outdoor adventures and home use.',
  79.99,
  22,
  'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg'
),
(
  'Wireless Charging Pad',
  'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator and overcharge protection.',
  34.99,
  0,
  'https://images.pexels.com/photos/4526414/pexels-photo-4526414.jpeg'
),
(
  'USB-C Hub',
  '7-in-1 USB-C hub with HDMI, USB 3.0 ports, SD card reader, and power delivery. Essential for modern laptops and tablets.',
  49.99,
  12,
  'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg'
),
(
  'Adjustable Laptop Stand',
  'Ergonomic aluminum laptop stand with adjustable height and angle. Improves posture and reduces neck strain during long work sessions.',
  59.99,
  18,
  'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg'
),
(
  'Blue Light Blocking Glasses',
  'Stylish glasses that filter harmful blue light from screens. Reduces eye strain and improves sleep quality for digital workers.',
  24.99,
  3,
  'https://images.pexels.com/photos/947885/pexels-photo-947885.jpeg'
),
(
  'Ergonomic Mouse Pad',
  'Large gaming mouse pad with wrist support and non-slip base. Smooth surface optimized for both optical and laser mice.',
  19.99,
  25,
  'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg'
),
(
  'Mechanical Keyboard',
  'Premium mechanical keyboard with RGB backlighting, tactile switches, and programmable keys. Built for gaming and productivity.',
  129.99,
  7,
  'https://images.pexels.com/photos/2115217/pexels-photo-2115217.jpeg'
),
(
  'Smartphone Camera Lens Kit',
  'Professional 3-in-1 lens kit with wide-angle, macro, and fisheye lenses. Transform your smartphone into a powerful camera.',
  39.99,
  14,
  'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg'
),
(
  'Portable Power Bank',
  '20,000mAh high-capacity power bank with fast charging and multiple USB ports. Keep your devices powered on the go.',
  45.99,
  0,
  'https://images.pexels.com/photos/4526414/pexels-photo-4526414.jpeg'
),
(
  'Smart LED Light Strip',
  '16.4ft RGB LED strip with app control, music sync, and voice control compatibility. Create the perfect ambiance for any room.',
  29.99,
  31,
  'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg'
);