# Quick Start Guide

Get your Jewelry Store Admin Panel running in 5 minutes!

## Prerequisites Check

✅ Node.js 18+ installed: `node --version`
✅ MongoDB installed or Atlas account ready
✅ Terminal/Command Prompt access

## Step-by-Step Setup

### 1. Install Dependencies (2 minutes)

```bash
cd jewelry-admin-panel
npm install
```

### 2. Configure Environment (1 minute)

Create `.env.local` file:

```env
MONGODB_URI=mongodb://localhost:27017/jewelry-store
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=my-super-secret-key-12345
JWT_SECRET=my-jwt-secret-key-67890
```

**Using MongoDB Atlas?** Replace MONGODB_URI with your Atlas connection string.

### 3. Initialize Database (1 minute)

```bash
node scripts/init-db.js
```

You should see:
```
✅ Database initialized successfully!

Demo Credentials:
Admin: admin@jewelry.com / admin123
Employee: employee@jewelry.com / employee123
```

### 4. Start Application (1 minute)

```bash
npm run dev
```

Wait for:
```
✓ Ready on http://localhost:3000
```

### 5. Login & Explore!

1. Open browser: http://localhost:3000
2. Login with: `admin@jewelry.com` / `admin123`
3. Explore the dashboard! 🎉

## What to Try First

### Create Your First Transaction
1. Click "New Transaction" button
2. Fill in bill details
3. Add items (description, weight, gold content)
4. Save and download PDF

### Add an Employee
1. Go to "Employees" section
2. Click "Add Employee"
3. Set name, email, password, and permissions
4. Save

### Search Transactions
1. Go to "Transactions"
2. Use search bar for bill numbers or customer names
3. Try date filters

## Common Issues & Fixes

### "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB if not running
sudo systemctl start mongod
```

### Port 3000 Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

### "Module not found" Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

📖 Read full [README.md](README.md) for detailed documentation
🚀 Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
🔧 Customize colors and fonts in `tailwind.config.js`

## Need Help?

- Check application logs in terminal
- Review MongoDB connection string
- Ensure all environment variables are set
- Verify Node.js and MongoDB versions

## Production Deployment

When ready for production:

1. Change default admin password
2. Use strong secrets in environment variables
3. Use MongoDB Atlas for database
4. Deploy to Vercel/Netlify/AWS
5. Enable HTTPS

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete guide.

---

**Happy Managing! 💎✨**

For Raju Seakh Jewelry Store
