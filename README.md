# Minimal Money

This is a simple app to track your money. You can add, edit, and delete your expenses and income. You can set budgets and see charts.

## How to Run Locally

1. **Install Node.js**
   - Download from https://nodejs.org

2. **Clone the Project**
   ```bash
   git clone https://github.com/dushyant4665/minimal-money.git
   ```

3. **Install Packages**
   ```bash
   npm install
   ```

4. **Set Up MongoDB**
   - Make a free account at https://mongodb.com/atlas
   - Create a cluster
   - Get your connection string
   - Make a file called `.env.local`
     ```env
     MONGODB_URI=your_mongodb_connection_string
     ```

5. **Start the App**
   ```bash
   npm run dev
   ```
   - Open http://localhost:3000 in your browser

## How to Deploy to Vercel

1. **Push your code to GitHub**
2. Go to https://vercel.com and sign up
3. Click "New Project" and import your GitHub repo
4. Add your MongoDB connection string as `MONGODB_URI` in Vercel settings
5. Click "Deploy"
6. Your app will be live. Share the link!

## Features
- Add, edit, delete transactions
- Set budgets for each category
- See charts for your spending
- Simple, clean design

DO THE HARD WORK SPECIALLY WHEN YOU DON'T FEEL LIKE TO DO IT
