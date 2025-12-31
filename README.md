# Jewelry Store Admin Panel

A comprehensive, professional admin panel for jewelry store transaction management built with Next.js, TypeScript, Tailwind CSS, and MongoDB.

## Features

### 🎯 Core Functionality
- **Transaction Management**: Create, edit, delete, and view jewelry transactions with detailed item breakdowns
- **PDF Generation**: Download professional transaction receipts matching the uploaded format
- **Employee Management**: Add, edit, and manage employee accounts with granular permissions
- **Advanced Search**: Search transactions by bill number, customer name, or phone number
- **Date Filtering**: Filter transactions by date range
- **Dashboard Analytics**: View key statistics including total transactions, employees, and gold amounts

### 🔐 Authentication & Authorization
- Secure login system with JWT tokens
- Role-based access control (Admin & Employee)
- Granular permissions system:
  - Create transactions
  - Edit transactions
  - Delete transactions
  - View all records

### 💎 Design Features
- Elegant gold-themed luxury design
- Fully responsive (mobile, tablet, desktop)
- Dark mode interface with glass morphism effects
- Smooth animations and transitions
- Custom fonts (Playfair Display & Outfit)
- Professional UI components

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom theme
- **Database**: MongoDB
- **Authentication**: JWT, bcryptjs
- **PDF Generation**: jsPDF with autoTable
- **Icons**: React Icons
- **Date Handling**: date-fns

## Prerequisites

- Node.js 18+ installed
- MongoDB installed and running (or MongoDB Atlas account)
- npm or yarn package manager

## Installation

### 1. Clone or Extract the Project

```bash
cd jewelry-admin-panel
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/jewelry-store
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-in-production
JWT_SECRET=your-jwt-secret-change-in-production
```

**For Production**: Replace with secure random strings for secrets.

### 4. Initialize Database

Run the initialization script to create demo users and sample data:

```bash
node scripts/init-db.js
```

This creates:
- Admin user: `admin@jewelry.com` / `admin123`
- Employee user: `employee@jewelry.com` / `employee123`
- Sample transaction

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Login
1. Navigate to the homepage
2. Use demo credentials or create your own users
3. Access the dashboard upon successful login

### Creating Transactions
1. Click "New Transaction" from dashboard or transactions page
2. Fill in transaction details:
   - Bill number (unique)
   - Date
   - Customer information (optional)
3. Add items with:
   - Description (e.g., BOMBAY RING)
   - Pieces count
   - Net weight (grams)
   - Additional weight
   - Touch × IBR value
   - Gold content (grams)
4. Configure gold bar details
5. Set closing balance
6. Save transaction

### Managing Transactions
- **View**: Browse all transactions with search and filters
- **Search**: Find by bill number, customer name, or phone
- **Filter**: Date range filtering
- **Download**: Generate PDF receipts
- **Edit**: Modify transaction details (if permitted)
- **Delete**: Remove transactions (if permitted)

### Employee Management (Admin Only)
1. Navigate to Employees section
2. Add new employees with:
   - Name, email, phone
   - Password
   - Role (Admin/Employee)
   - Custom permissions
3. Edit existing employees
4. Delete employees (cannot delete yourself)

### Permissions System
- **Can Create**: Create new transactions
- **Can Edit**: Modify existing transactions
- **Can Delete**: Remove transactions
- **Can View All**: Access all records (vs only own)

Admins have all permissions by default.

## Project Structure

```
jewelry-admin-panel/
├── app/
│   ├── api/
│   │   ├── auth/login/        # Login endpoint
│   │   ├── users/             # User CRUD operations
│   │   ├── transactions/      # Transaction CRUD
│   │   └── dashboard/         # Dashboard statistics
│   ├── dashboard/
│   │   ├── page.tsx           # Dashboard home
│   │   ├── transactions/      # Transaction pages
│   │   └── employees/         # Employee management
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Login page
├── components/
│   └── Sidebar.tsx            # Navigation sidebar
├── lib/
│   ├── mongodb.ts             # Database connection
│   ├── auth.ts                # Authentication utilities
│   └── pdfGenerator.ts        # PDF generation
├── types/
│   └── index.ts               # TypeScript definitions
├── scripts/
│   └── init-db.js             # Database initialization
└── public/                    # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users` - Update user
- `DELETE /api/users?id={id}` - Delete user

### Transactions
- `GET /api/transactions?search={query}&startDate={date}&endDate={date}` - Get transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions` - Update transaction
- `DELETE /api/transactions?id={id}` - Delete transaction

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

## Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'employee',
  phone: String,
  permissions: {
    canCreate: Boolean,
    canEdit: Boolean,
    canDelete: Boolean,
    canViewAll: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Transactions Collection
```javascript
{
  billNo: String (unique),
  date: String,
  customerName: String,
  customerPhone: String,
  items: [{
    description: String,
    pcs: Number,
    netWt: Number,
    addWt: Number,
    inchIbr: Number,
    gold: Number
  }],
  total: {
    pcs: Number,
    netWt: Number,
    inchIbr: Number,
    gold: Number
  },
  goldBar: {
    weight: Number,
    amount: Number
  },
  closingBalance: {
    gold: Number,
    cash: Number
  },
  createdBy: String,
  createdByName: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Customization

### Changing Colors
Edit `tailwind.config.js` to modify the gold color palette:

```javascript
colors: {
  gold: {
    50: '#fdfcf7',
    // ... customize values
  }
}
```

### Modifying Fonts
Update font imports in `app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Your+Font&display=swap');
```

### Adding Fields
1. Update TypeScript types in `types/index.ts`
2. Modify database schema
3. Update forms and display components
4. Update API endpoints

## Production Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Environment Variables
Set production environment variables:
- Use MongoDB Atlas or production MongoDB URL
- Generate secure secrets for JWT and NextAuth
- Set proper NEXTAUTH_URL

### 3. Deploy
Deploy to platforms like:
- **Vercel**: Automatic deployment from Git
- **Netlify**: Supports Next.js
- **AWS/Azure/GCP**: Docker or direct deployment
- **DigitalOcean**: App Platform

### 4. Security Checklist
- [ ] Change default admin password
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Set up MongoDB authentication
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Regular backups

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check connection string in `.env.local`
- Verify network access (for Atlas)

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### PDF Generation Issues
- Ensure jsPDF and jspdf-autotable are installed
- Check browser console for errors
- Verify transaction data structure

## Future Enhancements

- [ ] Inventory management
- [ ] Customer database
- [ ] SMS/Email notifications
- [ ] Advanced reporting and analytics
- [ ] Multi-currency support
- [ ] Barcode/QR code generation
- [ ] Photo upload for items
- [ ] Audit trail
- [ ] Export to Excel
- [ ] Mobile app

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review error logs in console
3. Check MongoDB connection
4. Verify environment variables

## License

This project is private and proprietary. Unauthorized copying or distribution is prohibited.

## Credits

Developed for Raju Seakh Jewelry Store
Built with Next.js, TypeScript, Tailwind CSS, and MongoDB
