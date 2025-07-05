# Modern Product Site - Supabase Ready

A responsive, accessible product showcase built with vanilla JavaScript, HTML, CSS, and Supabase backend. Features a clean, modern design focused on providing customers with an excellent browsing experience.

## Features

- **Responsive Design**: Mobile-first approach with CSS Grid layout
- **Real-time Data**: Connected to Supabase for live product data
- **Product Browsing**: Clean product grid with detailed product views
- **Product Details**: Modal-based product detail views with fresh data
- **Accessibility**: Keyboard navigation, ARIA labels, and focus management
- **Loading States**: CSS spinner animations and error handling
- **Modern UI**: Clean design with Inter font and consistent color scheme
- **Stock Indicators**: Visual indicators for product availability
- **Database Ready**: Full Supabase integration with migrations

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL database)
- **Database**: PostgreSQL with Row Level Security
- **Styling**: CSS Grid, Flexbox, CSS Variables
- **Fonts**: Inter (Google Fonts)

## Database Schema

### Products Table
```sql
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Security
- Row Level Security (RLS) enabled
- Public read access for customers
- Authenticated user access for admin operations
- Automatic updated_at timestamps

## Project Structure

```
├── index.html                          # Main HTML file
├── style.css                           # All CSS styles and responsive design
├── main.js                             # Main application logic
├── data.js                             # Legacy mock data (for reference)
├── src/
│   ├── lib/
│   │   └── supabase.js                 # Supabase client configuration
│   └── services/
│       └── productService.js           # Product database operations
├── supabase/
│   └── migrations/
│       ├── create_products_table.sql   # Database schema
│       └── seed_products_data.sql      # Initial product data
├── .env.example                        # Environment variables template
├── README.md                           # Project documentation
└── package.json                        # Project dependencies
```

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn
- Supabase account

### Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the database to be ready

2. **Get Your Credentials**
   - Go to Project Settings → API
   - Copy your Project URL and anon public key

3. **Set Up Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run Database Migrations**
   - In your Supabase dashboard, go to SQL Editor
   - Run the contents of `supabase/migrations/create_products_table.sql`
   - Run the contents of `supabase/migrations/seed_products_data.sql`

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - Navigate to `http://localhost:5173`
   - The application will connect to your Supabase database

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Database Operations

### Available Services

The `productService.js` provides these functions:

- `getAllProducts()` - Get all products
- `getProductById(id)` - Get single product
- `getAvailableProducts()` - Get products with stock > 0
- `searchProducts(query)` - Search products by name/description
- `getProductStats()` - Get product count statistics
- `addProduct(data)` - Add new product (admin)
- `updateProduct(id, updates)` - Update product (admin)
- `deleteProduct(id)` - Delete product (admin)

### Example Usage

```javascript
import { getAllProducts, getProductById } from './src/services/productService.js';

// Get all products
const products = await getAllProducts();

// Get specific product
const product = await getProductById('uuid-here');
```

## Deployment

### Vercel
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify
1. Connect your GitHub repository to Netlify
2. Add environment variables in Netlify dashboard
3. Deploy automatically on push

### Environment Variables for Production
Make sure to set these in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Features Overview

### Customer Experience
- Clean, distraction-free interface
- Fast loading with real-time data
- Smooth animations and transitions
- Mobile-optimized design
- Intuitive navigation

### Product Management
- Real-time stock updates
- Automatic product counting
- Image fallback handling
- Error state management
- Loading state indicators

### Accessibility Features
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation (Tab, Enter, Space, Escape)
- Focus management
- Screen reader support
- High contrast mode support

### Performance
- Efficient database queries
- Optimized images from Pexels
- Minimal JavaScript bundle
- CSS custom properties for theming
- Responsive image handling

## Security

### Row Level Security (RLS)
- Public read access for product browsing
- Authenticated access for admin operations
- Secure API key handling
- Environment variable protection

### Data Validation
- Input sanitization
- SQL injection prevention
- XSS protection
- Type checking

## Future Enhancements

### Planned Features
- Product search functionality
- Category filtering
- Shopping cart integration
- User authentication
- Admin dashboard
- Product reviews
- Inventory management

### Admin Features (Ready for Implementation)
- Add new products
- Update existing products
- Delete products
- Manage stock levels
- Upload product images

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env` file is in project root
   - Restart development server after changes
   - Check variable names start with `VITE_`

2. **Database Connection Errors**
   - Verify Supabase URL and key are correct
   - Check if RLS policies are properly set
   - Ensure migrations have been run

3. **Images Not Loading**
   - Check image URLs are accessible
   - Fallback images will display automatically
   - Verify CORS settings if using custom images

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions:
- Check the troubleshooting section
- Review Supabase documentation
- Create an issue in the repository

---

Built with ❤️ using modern web technologies and Supabase for a scalable, real-time product showcase.