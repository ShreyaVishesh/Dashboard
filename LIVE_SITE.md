# 🌐 Electrode Dashboard - Live Site

Your Electrode Energy Trading Dashboard is now **LIVE** on GitHub Pages!

## 🚀 Live URLs

### Main Dashboard
🏠 **https://shreyavishesh.github.io/Dashboard/**
- Full-featured energy trading dashboard
- Real-time price charts
- Portfolio tracking
- Trading simulation
- Activity feed

### Additional Pages

📊 **System Status:** https://shreyavishesh.github.io/Dashboard/system-status.html
- System monitoring
- Performance metrics
- Health checks

📈 **Simple Dashboard:** https://shreyavishesh.github.io/Dashboard/dashboard-simple.html
- Simplified version
- Quick overview

🧭 **Navigation:** https://shreyavishesh.github.io/Dashboard/navigation.html
- Navigation menu
- Page directory

## ✨ Features Available

### Live on the Site:
- ⚡ **Real-time Updates** - Prices update every 5 seconds
- 📊 **Interactive Charts** - Powered by Chart.js
- 💹 **Trading Simulation** - Buy/Sell energy tokens
- 💰 **Portfolio Tracking** - Real-time value calculations
- 📱 **Responsive Design** - Works on all devices
- 🎨 **Modern UI** - Glassmorphism effects & gradients
- ⚙️ **System Monitoring** - Application health status

### Dashboard Stats:
- Portfolio Value tracking
- Energy Generated (kWh)
- Daily Revenue
- Current Token Price
- Activity Feed
- Live Price Chart (24h data)

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Charts:** Chart.js
- **Icons:** Font Awesome
- **Fonts:** Google Fonts (Inter)
- **Hosting:** GitHub Pages

## 📦 Repository Structure

```
Dashboard/
├── index.html              # Main dashboard (dashboard-working.html)
├── dashboard-working.html  # Full-featured dashboard
├── dashboard-simple.html   # Simplified dashboard
├── system-status.html      # System monitoring page
├── navigation.html         # Navigation menu
├── test-nav.html          # Navigation test page
└── assets/
    ├── css/
    │   ├── electrode-dashboard.css
    │   └── microgrid-index.css
    └── js/
        ├── electrode-dashboard.js
        └── microgrid-index.js
```

## 🔄 Updating Your Live Site

When you make changes and want to update the live site:

1. **Make changes to your files** in the `main` branch
2. **Switch to gh-pages branch:**
   ```bash
   git checkout gh-pages
   ```
3. **Copy updated files:**
   ```bash
   cp frontend/public/dashboard-working.html index.html
   cp -r frontend/public/* .
   ```
4. **Commit and push:**
   ```bash
   git add -A
   git commit -m "Update live site"
   git push origin gh-pages
   ```
5. **Switch back to main:**
   ```bash
   git checkout main
   ```

## 📱 Mobile Responsive

The dashboard is fully responsive and works on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Laptops
- 🖥️ Desktop monitors

## 🎯 What's Working Live

✅ **Dashboard UI** - Complete interface
✅ **Real-time Price Updates** - Every 5 seconds
✅ **Live Charts** - 24-hour price history
✅ **Trading Buttons** - Buy/Sell simulation
✅ **Activity Feed** - Recent transactions
✅ **Portfolio Value** - Dynamic calculations
✅ **System Monitoring** - Health indicators
✅ **Animations** - Smooth transitions
✅ **Loading Screen** - Initial load animation

## 🚀 Share Your Dashboard

Share your live dashboard with anyone:
**https://shreyavishesh.github.io/Dashboard/**

---

Built with ⚡ by Shreya Vishesh
