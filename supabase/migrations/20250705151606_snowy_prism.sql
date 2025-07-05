/*
  # Seed products table with initial data

  1. Data
    - Insert 8 sample products with realistic data
    - Include varied stock levels and prices
    - Use Pexels images for product photos

  2. Notes
    - This migration populates the products table with the same data
      that was previously in the mock data array
    - Stock levels vary to demonstrate different availability states
*/

INSERT INTO products (name, description, price, stock, image_url) VALUES
(
  'Wireless Noise-Cancelling Headphones',
  'Premium over-ear headphones with active noise cancellation and 30-hour battery life. Perfect for travel and daily use.',
  299.99,
  15,
  'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Smart Fitness Watch',
  'Advanced fitness tracking with heart rate monitoring, GPS, and smartphone connectivity. Water-resistant up to 50 meters.',
  249.99,
  8,
  'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Portable Bluetooth Speaker',
  'Compact speaker with 360-degree sound, 12-hour battery, and IPX7 waterproof rating. Great for outdoor adventures.',
  79.99,
  25,
  'https://images.pexels.com/photos/1631181/pexels-photo-1631181.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Wireless Charging Pad',
  'Fast wireless charging for compatible devices with LED indicator and non-slip surface. Includes AC adapter.',
  39.99,
  0,
  'https://images.pexels.com/photos/4218883/pexels-photo-4218883.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'USB-C Hub with 7 Ports',
  'Multi-port hub with HDMI, USB 3.0, USB-C, and SD card slots. Perfect for laptops and tablets.',
  49.99,
  12,
  'https://images.pexels.com/photos/163130/usb-stick-usb-flash-drive-data-storage-163130.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Ergonomic Wireless Mouse',
  'Comfortable wireless mouse with precision tracking, programmable buttons, and long battery life.',
  34.99,
  18,
  'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'LED Desk Lamp with USB Charging',
  'Adjustable LED desk lamp with multiple brightness levels, USB charging port, and touch controls.',
  59.99,
  3,
  'https://images.pexels.com/photos/1484690/pexels-photo-1484690.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Phone Camera Lens Kit',
  'Professional lens kit with wide-angle, macro, and fisheye lenses. Compatible with most smartphones.',
  24.99,
  22,
  'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800'
);