# Deployment Guide

This guide will help you deploy your Personal Finance Visualizer to various platforms.

## 🚀 Quick Deploy to Vercel (Recommended)

### Step 1: Prepare Your Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Personal Finance Visualizer"

# Create a new repository on GitHub and push
git remote add origin https://github.com/yourusername/personal-finance-visualizer.git
git push -u origin main
```

### Step 2: Set Up MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier is sufficient)
4. Create a database user with read/write permissions
5. Get your connection string

### Step 3: Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variable:
   - **Name**: `MONGODB_URI`
   - **Value**: Your MongoDB Atlas connection string
6. Click "Deploy"

Your app will be live at `https://your-project-name.vercel.app`

## 🌐 Alternative Deployment Options

### Netlify
1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Connect your GitHub account
4. Import your repository
5. Add environment variable: `MONGODB_URI`
6. Deploy

### Railway
1. Go to [Railway](https://railway.app)
2. Connect your GitHub account
3. Create new project from GitHub repo
4. Add environment variable: `MONGODB_URI`
5. Deploy

### DigitalOcean App Platform
1. Go to [DigitalOcean](https://digitalocean.com)
2. Create App Platform project
3. Connect your GitHub repository
4. Add environment variable: `MONGODB_URI`
5. Deploy

## 🔧 Environment Variables

Make sure to set these environment variables in your deployment platform:

```env
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=production
```

## 📝 MongoDB Atlas Connection String Format

```
mongodb+srv://username:password@cluster.mongodb.net/finance-tracker?retryWrites=true&w=majority
```

Replace:
- `username`: Your MongoDB Atlas username
- `password`: Your MongoDB Atlas password
- `cluster`: Your cluster name
- `finance-tracker`: Database name (can be anything)

## 🧪 Testing Your Deployment

After deployment:
1. Visit your live URL
2. Try adding a transaction
3. Set some budgets
4. Verify charts are working
5. Check that data persists

## 🐛 Troubleshooting

### Common Issues:

**"Failed to fetch data" error:**
- Check your MongoDB connection string
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify environment variables are set correctly

**Charts not loading:**
- Check browser console for errors
- Ensure Recharts is properly installed
- Verify data format from API

**Build errors:**
- Check that all dependencies are in package.json
- Ensure TypeScript types are correct
- Verify Next.js configuration

### Getting Help:
1. Check the browser console for errors
2. Verify your MongoDB connection
3. Check the deployment platform logs
4. Review the README.md for setup instructions

## 🔒 Security Notes

- Never commit your `.env.local` file
- Use environment variables for sensitive data
- Consider adding authentication for production use
- Regularly update dependencies

## 📊 Performance Tips

- Use MongoDB indexes for better query performance
- Consider implementing pagination for large datasets
- Optimize images and assets
- Use CDN for static assets

---

**Your Personal Finance Visualizer is now ready for production! 🎉** 