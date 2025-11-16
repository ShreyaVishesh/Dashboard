/**
 * Enhanced Electrode Trading Dashboard JavaScript
 * Handles interactive trading features, real-time updates, and animations
 */

class ElectrodeDashboard {
    constructor() {
        this.isInitialized = false;
        this.socket = null;
        this.charts = {};
        this.tradingData = {
            portfolioValue: 1247.85,
            dailyRevenue: 156.80,
            tokenCount: 1247,
            marketPrice: 0.125,
            activeTrades: 89
        };
        this.energyData = {
            solarOutput: 8.2,
            windOutput: 4.6,
            batteryLevel: 78
        };
        
        this.init();
    }

    async init() {
        try {
            this.showLoadingScreen();
            await this.initializeComponents();
            await this.setupEventListeners();
            await this.startRealTimeUpdates();
            this.hideLoadingScreen();
            this.isInitialized = true;
            console.log('✅ Electrode Dashboard initialized successfully');
        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
        }
    }

    showLoadingScreen() {
        const loading = document.getElementById('dashboard-loading');
        if (loading) {
            loading.style.display = 'flex';
            // Animate progress bar
            const progressBar = loading.querySelector('.progress-bar');
            if (progressBar) {
                let width = 0;
                const interval = setInterval(() => {
                    width += Math.random() * 15;
                    if (width >= 100) {
                        width = 100;
                        clearInterval(interval);
                    }
                    progressBar.style.width = width + '%';
                }, 100);
            }
        }
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loading = document.getElementById('dashboard-loading');
            if (loading) {
                loading.style.opacity = '0';
                setTimeout(() => {
                    loading.style.display = 'none';
                }, 300);
            }
        }, 1500);
    }

    async initializeComponents() {
        // Initialize navigation
        this.initNavigation();
        
        // Initialize search
        this.initSearch();
        
        // Initialize charts
        await this.initCharts();
        
        // Initialize trading interface
        this.initTradingInterface();
        
        // Initialize activity feed
        this.initActivityFeed();
        
        // Initialize advanced trading features
        this.initializeAdvancedTrading();
        
        // Initialize real-time updates
        this.startAdvancedRealTimeUpdates();
        
        // Add staggered animations
        this.addStaggeredAnimations();
        
        // Update initial data
        this.updateDashboardData();

        // Initialize AI insights
        await this.initializeAIInsights();

        // Initialize advanced analytics
        await this.initializeAdvancedAnalytics();
        
        // Initialize header features
        this.initializeHeaderFeatures();
        
        // Initialize keyboard shortcuts
        this.initializeKeyboardShortcuts();
        
        // Initialize performance optimization
        this.initializePerformanceOptimization();

        // Initialize header features
        this.initializeHeaderFeatures();
    }

    initNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.dashboard-section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all nav items and sections
                navLinks.forEach(l => l.parentElement.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));
                
                // Add active class to clicked nav item
                link.parentElement.classList.add('active');
                
                // Show corresponding section
                const sectionId = link.dataset.section + '-section';
                const targetSection = document.getElementById(sectionId);
                if (targetSection) {
                    targetSection.classList.add('active');
                    // Update breadcrumb
                    const breadcrumb = document.getElementById('current-section');
                    if (breadcrumb) {
                        breadcrumb.textContent = link.querySelector('span').textContent;
                    }
                }
            });
        });

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
            });
        }
    }

    initSearch() {
        const searchInput = document.getElementById('dashboard-search');
        const suggestions = document.getElementById('search-suggestions');
        
        if (searchInput && suggestions) {
            const searchData = [
                { title: 'Portfolio Value', section: 'trading-overview' },
                { title: 'Live Trading', section: 'live-trading' },
                { title: 'Energy Tokens', section: 'portfolio' },
                { title: 'Market Price', section: 'market-analytics' },
                { title: 'AI Predictions', section: 'ai-predictions' }
            ];

            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                if (query.length > 1) {
                    const results = searchData.filter(item => 
                        item.title.toLowerCase().includes(query)
                    );
                    this.showSearchSuggestions(results, suggestions);
                } else {
                    suggestions.style.display = 'none';
                }
            });

            // Hide suggestions when clicking outside
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
                    suggestions.style.display = 'none';
                }
            });
        }
    }

    showSearchSuggestions(results, container) {
        if (results.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.innerHTML = results.map(item => `
            <div class="search-suggestion" data-section="${item.section}">
                <i class="fas fa-search"></i>
                <span>${item.title}</span>
            </div>
        `).join('');

        container.style.display = 'block';

        // Add click handlers
        container.querySelectorAll('.search-suggestion').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.navigateToSection(section);
                container.style.display = 'none';
            });
        });
    }

    navigateToSection(sectionName) {
        const navLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (navLink) {
            navLink.click();
        }
    }

    async initCharts() {
        // Price Chart
        await this.initPriceChart();
        
        // Energy Monitoring Charts
        await this.initEnergyCharts();
        
        // Portfolio Chart
        await this.initPortfolioChart();
    }

    async initPriceChart() {
        const ctx = document.getElementById('priceChart');
        if (!ctx) return;

        const priceData = this.generatePriceData();
        
        this.charts.priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: priceData.labels,
                datasets: [{
                    label: 'Token Price ($)',
                    data: priceData.prices,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(3);
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    async initEnergyCharts() {
        // Solar Chart
        const solarCtx = document.getElementById('solarChart');
        if (solarCtx) {
            this.charts.solarChart = new Chart(solarCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(12),
                    datasets: [{
                        data: this.generateEnergyData(12, 5, 10),
                        borderColor: '#f39c12',
                        backgroundColor: 'rgba(243, 156, 18, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: this.getMinimalChartOptions()
            });
        }

        // Wind Chart
        const windCtx = document.getElementById('windChart');
        if (windCtx) {
            this.charts.windChart = new Chart(windCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(12),
                    datasets: [{
                        data: this.generateEnergyData(12, 2, 8),
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: this.getMinimalChartOptions()
            });
        }

        // Battery Chart
        const batteryCtx = document.getElementById('batteryChart');
        if (batteryCtx) {
            this.charts.batteryChart = new Chart(batteryCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(12),
                    datasets: [{
                        data: this.generateBatteryData(12),
                        borderColor: '#2ed573',
                        backgroundColor: 'rgba(46, 213, 115, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: this.getMinimalChartOptions()
            });
        }
    }

    async initPortfolioChart() {
        const ctx = document.getElementById('portfolioChart');
        if (!ctx) return;

        const portfolioData = this.generatePortfolioData();
        
        this.charts.portfolioChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: portfolioData.labels,
                datasets: [{
                    label: 'Portfolio Value ($)',
                    data: portfolioData.values,
                    borderColor: '#2ed573',
                    backgroundColor: 'rgba(46, 213, 115, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });
    }

    initTradingInterface() {
        // Trading mode toggle
        const modeToggles = document.querySelectorAll('.btn-toggle');
        modeToggles.forEach(btn => {
            btn.addEventListener('click', () => {
                modeToggles.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const mode = btn.dataset.mode;
                this.setTradingMode(mode);
            });
        });

        // Emergency stop
        const emergencyBtn = document.getElementById('emergency-stop');
        if (emergencyBtn) {
            emergencyBtn.addEventListener('click', () => {
                this.showNotification('Trading halted for safety review', 'warning');
                this.setTradingMode('stopped');
            });
        }

        // Buy/Sell buttons
        const buyBtn = document.getElementById('execute-buy');
        const sellBtn = document.getElementById('execute-sell');
        
        if (buyBtn) {
            buyBtn.addEventListener('click', () => {
                const amount = document.getElementById('buy-amount')?.value || 0;
                const price = document.getElementById('buy-price')?.value || 0;
                this.executeTrade('buy', amount, price);
            });
        }

        if (sellBtn) {
            sellBtn.addEventListener('click', () => {
                const amount = document.getElementById('sell-amount')?.value || 0;
                const price = document.getElementById('sell-price')?.value || 0;
                this.executeTrade('sell', amount, price);
            });
        }

        // Time filters
        const timeFilters = document.querySelectorAll('.time-filter');
        timeFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                timeFilters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                
                const period = filter.dataset.period;
                this.updateChartPeriod(period);
            });
        });

        // Quick trade button
        const quickTradeBtn = document.getElementById('quick-trade');
        if (quickTradeBtn) {
            quickTradeBtn.addEventListener('click', () => {
                this.showQuickTradeModal();
            });
        }
    }

    initActivityFeed() {
        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.dataset.filter;
                this.filterActivityFeed(filter);
            });
        });

        // Start activity feed updates
        this.startActivityUpdates();
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-monitoring');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshAllData();
            });
        }

        // Header stats updates
        this.updateHeaderStats();
        
        // Real-time price updates
        this.startPriceUpdates();
    }

    executeTrade(type, amount, price) {
        if (!amount || !price) {
            this.showNotification('Please enter valid amount and price', 'error');
            return;
        }

        const total = (amount * price).toFixed(2);
        const fee = (total * 0.01).toFixed(2); // 1% fee
        
        // Simulate trade execution
        setTimeout(() => {
            this.addActivityItem({
                type: 'trade',
                icon: 'fas fa-handshake',
                title: `${type.charAt(0).toUpperCase() + type.slice(1)} Order Executed`,
                details: `${amount} tokens at $${price}/kWh`,
                value: type === 'sell' ? `+$${total}` : `-$${total}`,
                time: 'Just now'
            });
            
            this.showNotification(`${type.toUpperCase()} order executed successfully!`, 'success');
            
            // Update portfolio
            if (type === 'buy') {
                this.tradingData.tokenCount += parseInt(amount);
                this.tradingData.portfolioValue += parseFloat(total);
            } else {
                this.tradingData.tokenCount -= parseInt(amount);
                this.tradingData.dailyRevenue += parseFloat(total);
            }
            
            this.updateDashboardData();
        }, 1000);
    }

    setTradingMode(mode) {
        console.log(`Trading mode set to: ${mode}`);
        
        const tradingPanel = document.querySelector('.trading-panel');
        if (tradingPanel) {
            tradingPanel.setAttribute('data-mode', mode);
        }
        
        if (mode === 'stopped') {
            // Disable trading buttons
            const tradeButtons = document.querySelectorAll('.btn-trade');
            tradeButtons.forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = '0.5';
            });
        } else {
            // Enable trading buttons
            const tradeButtons = document.querySelectorAll('.btn-trade');
            tradeButtons.forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = '1';
            });
        }
    }

    addActivityItem(item) {
        const feed = document.getElementById('activity-feed');
        if (!feed) return;

        const activityItem = document.createElement('div');
        activityItem.className = `activity-item ${item.type}`;
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="${item.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${item.title}</div>
                <div class="activity-details">${item.details}</div>
                <div class="activity-time">${item.time}</div>
            </div>
            <div class="activity-value">${item.value}</div>
        `;

        feed.insertBefore(activityItem, feed.firstChild);
        
        // Remove old items (keep only 10)
        const items = feed.querySelectorAll('.activity-item');
        if (items.length > 10) {
            items[items.length - 1].remove();
        }
    }

    startRealTimeUpdates() {
        // Update trading data every 5 seconds
        setInterval(() => {
            this.updateTradingData();
        }, 5000);

        // Update energy data every 3 seconds
        setInterval(() => {
            this.updateEnergyData();
        }, 3000);

        // Update activity feed every 10 seconds
        setInterval(() => {
            this.generateRandomActivity();
        }, 10000);
    }

    updateTradingData() {
        // Simulate market fluctuations
        const priceChange = (Math.random() - 0.5) * 0.01;
        this.tradingData.marketPrice += priceChange;
        this.tradingData.marketPrice = Math.max(0.1, Math.min(0.2, this.tradingData.marketPrice));

        // Update portfolio value based on price change
        const portfolioChange = this.tradingData.tokenCount * priceChange;
        this.tradingData.portfolioValue += portfolioChange;

        this.updateDashboardData();
        
        // Update price chart
        if (this.charts.priceChart) {
            this.updatePriceChart();
        }
    }

    updateEnergyData() {
        // Simulate energy production fluctuations
        this.energyData.solarOutput += (Math.random() - 0.5) * 0.5;
        this.energyData.windOutput += (Math.random() - 0.5) * 0.3;
        this.energyData.batteryLevel += (Math.random() - 0.5) * 2;

        // Keep values in reasonable ranges
        this.energyData.solarOutput = Math.max(0, Math.min(12, this.energyData.solarOutput));
        this.energyData.windOutput = Math.max(0, Math.min(8, this.energyData.windOutput));
        this.energyData.batteryLevel = Math.max(0, Math.min(100, this.energyData.batteryLevel));

        this.updateEnergyDisplay();
    }

    updateDashboardData() {
        // Update header stats
        const elements = {
            'portfolio-value': `$${this.tradingData.portfolioValue.toFixed(2)}`,
            'daily-revenue': `$${this.tradingData.dailyRevenue.toFixed(2)}`,
            'token-count': this.tradingData.tokenCount,
            'market-price': `$${this.tradingData.marketPrice.toFixed(3)}`,
            'header-tokens': `${this.tradingData.tokenCount} Tokens`,
            'header-revenue': `$${this.tradingData.dailyRevenue.toFixed(2)}`,
            'header-trades': `${this.tradingData.activeTrades} Trades`
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                // Add animation
                element.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 200);
            }
        });
    }

    updateEnergyDisplay() {
        const elements = {
            'solar-output': `${this.energyData.solarOutput.toFixed(1)} kWh`,
            'wind-output': `${this.energyData.windOutput.toFixed(1)} kWh`,
            'battery-level': `${this.energyData.batteryLevel.toFixed(0)}%`
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    generateRandomActivity() {
        const activities = [
            {
                type: 'generation',
                icon: 'fas fa-bolt',
                title: 'Energy Generated',
                details: `${(Math.random() * 30 + 10).toFixed(1)} kWh from solar panels`,
                value: `${Math.floor(Math.random() * 30 + 10)} tokens`,
                time: 'Just now'
            },
            {
                type: 'trade',
                icon: 'fas fa-handshake',
                title: 'Automated Trade',
                details: `Sold ${Math.floor(Math.random() * 50 + 20)} tokens`,
                value: `+$${(Math.random() * 10 + 5).toFixed(2)}`,
                time: 'Just now'
            },
            {
                type: 'prediction',
                icon: 'fas fa-brain',
                title: 'AI Market Analysis',
                details: 'Market conditions favorable for trading',
                value: `+${(Math.random() * 10 + 2).toFixed(1)}%`,
                time: 'Just now'
            }
        ];

        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        this.addActivityItem(randomActivity);
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close">×</button>
        `;

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);

        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }

    // Utility functions for generating chart data
    generatePriceData() {
        const labels = [];
        const prices = [];
        const now = new Date();
        
        for (let i = 23; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            
            const basePrice = 0.125;
            const variation = (Math.sin(i * 0.3) * 0.01) + (Math.random() - 0.5) * 0.005;
            prices.push(basePrice + variation);
        }
        
        return { labels, prices };
    }

    generatePortfolioData() {
        const labels = [];
        const values = [];
        const now = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            labels.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
            
            const baseValue = 1000;
            const growth = (29 - i) * 8.5; // Growing trend
            const variation = (Math.sin(i * 0.2) * 50) + (Math.random() - 0.5) * 20;
            values.push(baseValue + growth + variation);
        }
        
        return { labels, values };
    }

    generateTimeLabels(hours) {
        const labels = [];
        const now = new Date();
        
        for (let i = hours - 1; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            labels.push(time.toLocaleTimeString([], { hour: '2-digit' }));
        }
        
        return labels;
    }

    generateEnergyData(points, min, max) {
        return Array.from({ length: points }, () => 
            Math.random() * (max - min) + min
        );
    }

    generateBatteryData(points) {
        const data = [];
        let level = 78;
        
        for (let i = 0; i < points; i++) {
            level += (Math.random() - 0.5) * 5;
            level = Math.max(20, Math.min(100, level));
            data.push(level);
        }
        
        return data;
    }

    getMinimalChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            },
            elements: {
                point: { radius: 0 }
            }
        };
    }

    // Advanced Trading Features
    initializeAdvancedTrading() {
        this.orderBook = {
            buyOrders: [
                { price: 0.1245, amount: 125, total: 15.56 },
                { price: 0.1240, amount: 89, total: 11.04 },
                { price: 0.1235, amount: 200, total: 24.70 },
                { price: 0.1230, amount: 156, total: 19.19 },
                { price: 0.1225, amount: 78, total: 9.56 }
            ],
            sellOrders: [
                { price: 0.1255, amount: 75, total: 9.41 },
                { price: 0.1260, amount: 150, total: 18.90 },
                { price: 0.1265, amount: 95, total: 12.02 },
                { price: 0.1270, amount: 203, total: 25.78 },
                { price: 0.1275, amount: 67, total: 8.54 }
            ]
        };

        this.priceData = {
            ELEC: { price: 0.1250, change: 2.1 },
            SOLAR: { price: 0.1180, change: 1.8 },
            WIND: { price: 0.1095, change: -0.5 },
            GRID: { price: 0.1340, change: 3.2 },
            BATT: { price: 0.1275, change: 1.5 }
        };

        this.portfolioData = {
            totalValue: 1247.85,
            dayChange: 64.20,
            dayChangePercent: 5.2,
            holdings: [
                { symbol: 'SOLAR', amount: 562, price: 0.1180, value: 66.32, change: 1.8 },
                { symbol: 'WIND', amount: 312, price: 0.1095, value: 34.16, change: -0.5 },
                { symbol: 'GRID', amount: 249, price: 0.1340, value: 33.37, change: 3.2 },
                { symbol: 'ELEC', amount: 124, price: 0.1250, value: 15.50, change: 2.1 }
            ]
        };

        this.updateOrderBook();
        this.updatePriceTicker();
        this.updatePortfolioDisplay();
        this.initializeTradeExecution();
        this.initializeAdvancedCharts();
    }

    updateOrderBook() {
        const buyOrdersList = document.getElementById('buy-orders-list');
        const sellOrdersList = document.getElementById('sell-orders-list');

        if (buyOrdersList) {
            buyOrdersList.innerHTML = this.orderBook.buyOrders.map(order => `
                <div class="order-row buy-order">
                    <span class="order-price">$${order.price.toFixed(4)}</span>
                    <span class="order-amount">${order.amount}</span>
                    <span class="order-total">$${order.total.toFixed(2)}</span>
                </div>
            `).join('');
        }

        if (sellOrdersList) {
            sellOrdersList.innerHTML = this.orderBook.sellOrders.map(order => `
                <div class="order-row sell-order">
                    <span class="order-price">$${order.price.toFixed(4)}</span>
                    <span class="order-amount">${order.amount}</span>
                    <span class="order-total">$${order.total.toFixed(2)}</span>
                </div>
            `).join('');
        }
    }

    updatePriceTicker() {
        Object.keys(this.priceData).forEach(symbol => {
            const priceElement = document.getElementById(`${symbol.toLowerCase()}-price`);
            const changeElement = document.getElementById(`${symbol.toLowerCase()}-change`);
            
            if (priceElement) {
                priceElement.textContent = `$${this.priceData[symbol].price.toFixed(4)}`;
            }
            
            if (changeElement) {
                const change = this.priceData[symbol].change;
                changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
                changeElement.className = `ticker-change ${change >= 0 ? 'positive' : 'negative'}`;
            }
        });
    }

    updatePortfolioDisplay() {
        const totalValueElement = document.getElementById('total-portfolio-value');
        const valueChangeElement = document.getElementById('portfolio-value-change');
        const holdingsList = document.getElementById('holdings-list');

        if (totalValueElement) {
            totalValueElement.textContent = `$${this.portfolioData.totalValue.toFixed(2)}`;
        }

        if (valueChangeElement) {
            const change = this.portfolioData.dayChange;
            const percent = this.portfolioData.dayChangePercent;
            valueChangeElement.innerHTML = `
                <i class="fas fa-arrow-${change >= 0 ? 'up' : 'down'}"></i>
                ${change >= 0 ? '+' : ''}$${Math.abs(change).toFixed(2)} (${percent.toFixed(1)}%)
            `;
            valueChangeElement.className = `value-change ${change >= 0 ? 'positive' : 'negative'}`;
        }

        if (holdingsList) {
            // Update existing holdings display with new data
            const existingRows = holdingsList.querySelectorAll('.table-row');
            this.portfolioData.holdings.forEach((holding, index) => {
                if (existingRows[index]) {
                    const changeElement = existingRows[index].querySelector('.positive, .negative');
                    if (changeElement) {
                        changeElement.textContent = `${holding.change >= 0 ? '+' : ''}${holding.change.toFixed(1)}%`;
                        changeElement.className = holding.change >= 0 ? 'positive' : 'negative';
                    }
                }
            });
        }
    }

    initializeTradeExecution() {
        // Trade form functionality
        const tradeForm = document.querySelector('.trade-form');
        const amountInput = document.getElementById('trade-amount');
        const priceInput = document.getElementById('trade-price');
        const executeButton = document.getElementById('execute-trade');
        const quickAmountButtons = document.querySelectorAll('.quick-amount');

        if (quickAmountButtons) {
            quickAmountButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const percent = parseInt(button.dataset.percent);
                    const maxAmount = 1000; // Example max amount
                    const amount = Math.floor(maxAmount * percent / 100);
                    if (amountInput) amountInput.value = amount;
                    this.calculateTradeSummary();
                });
            });
        }

        if (amountInput && priceInput) {
            [amountInput, priceInput].forEach(input => {
                input.addEventListener('input', () => this.calculateTradeSummary());
            });
        }

        if (executeButton) {
            executeButton.addEventListener('click', () => this.executeTrade());
        }

        // Trade tabs functionality
        const tradeTabs = document.querySelectorAll('.trade-tab');
        tradeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tradeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    }

    calculateTradeSummary() {
        const amount = parseFloat(document.getElementById('trade-amount')?.value || 0);
        const price = parseFloat(document.getElementById('trade-price')?.value || 0);
        
        const estimatedCost = amount * price;
        const tradingFee = estimatedCost * 0.01; // 1% fee
        const total = estimatedCost + tradingFee;

        document.getElementById('estimated-cost').textContent = `$${estimatedCost.toFixed(2)}`;
        document.getElementById('trading-fee').textContent = `$${tradingFee.toFixed(3)}`;
        document.getElementById('trade-total').textContent = `$${total.toFixed(2)}`;
    }

    executeTrade() {
        const amount = document.getElementById('trade-amount')?.value;
        const price = document.getElementById('trade-price')?.value;
        const orderType = document.getElementById('order-type')?.value;
        const tokenPair = document.getElementById('token-pair')?.value;

        if (!amount || !price) {
            this.showToast('Please enter both amount and price', 'error');
            return;
        }

        // Simulate trade execution
        this.showToast('Trade executed successfully!', 'success');
        
        // Update activity feed
        this.addActivityItem({
            type: 'trade',
            title: `${orderType.toUpperCase()} Order Executed`,
            details: `${amount} ${tokenPair.split('/')[0]} tokens at $${price}`,
            value: `$${(parseFloat(amount) * parseFloat(price)).toFixed(2)}`,
            time: 'Just now'
        });

        // Clear form
        document.getElementById('trade-amount').value = '';
        document.getElementById('trade-price').value = '';
        this.calculateTradeSummary();
    }

    initializeAdvancedCharts() {
        // Portfolio Chart
        const portfolioCtx = document.getElementById('portfolio-chart');
        if (portfolioCtx) {
            this.charts.portfolio = new Chart(portfolioCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(24),
                    datasets: [{
                        label: 'Portfolio Value',
                        data: this.generatePortfolioData(24),
                        borderColor: '#00d4ff',
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: { display: false },
                        y: {
                            display: false,
                            beginAtZero: false
                        }
                    },
                    elements: {
                        point: { radius: 0 }
                    }
                }
            });
        }

        // Market Depth Chart
        const depthCtx = document.getElementById('depth-chart');
        if (depthCtx) {
            this.charts.depth = new Chart(depthCtx, {
                type: 'line',
                data: {
                    labels: Array.from({length: 20}, (_, i) => (0.120 + i * 0.001).toFixed(3)),
                    datasets: [{
                        label: 'Bids',
                        data: this.generateDepthData('bid'),
                        borderColor: '#2ed573',
                        backgroundColor: 'rgba(46, 213, 115, 0.1)',
                        fill: true,
                        stepped: true
                    }, {
                        label: 'Asks',
                        data: this.generateDepthData('ask'),
                        borderColor: '#ff4757',
                        backgroundColor: 'rgba(255, 71, 87, 0.1)',
                        fill: true,
                        stepped: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: { display: true, grid: { display: false } },
                        y: { display: true, grid: { display: false } }
                    }
                }
            });
        }

        // Advanced Price Chart
        const advancedCtx = document.getElementById('advanced-price-chart');
        if (advancedCtx) {
            this.charts.advanced = new Chart(advancedCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(50),
                    datasets: [{
                        label: 'Price',
                        data: this.generatePriceData(50),
                        borderColor: '#00d4ff',
                        backgroundColor: 'rgba(0, 212, 255, 0.05)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.1
                    }, {
                        label: 'Volume',
                        data: this.generateVolumeData(50),
                        type: 'bar',
                        backgroundColor: 'rgba(0, 212, 255, 0.3)',
                        yAxisID: 'y1'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: { display: true, position: 'top' }
                    },
                    scales: {
                        x: { 
                            display: true,
                            grid: { color: 'rgba(0, 0, 0, 0.1)' }
                        },
                        y: {
                            display: true,
                            position: 'left',
                            grid: { color: 'rgba(0, 0, 0, 0.1)' }
                        },
                        y1: {
                            type: 'linear',
                            display: false,
                            position: 'right'
                        }
                    }
                }
            });
        }

        // Chart timeframe controls
        const chartControls = document.querySelectorAll('.chart-control');
        chartControls.forEach(control => {
            control.addEventListener('click', () => {
                chartControls.forEach(c => c.classList.remove('active'));
                control.classList.add('active');
                this.updateChartTimeframe(control.dataset.timeframe);
            });
        });
    }

    generatePortfolioData(points) {
        const baseValue = 1200;
        return Array.from({length: points}, (_, i) => {
            return baseValue + Math.random() * 100 - 50 + (i * 2);
        });
    }

    generateDepthData(type) {
        return Array.from({length: 20}, (_, i) => {
            const base = type === 'bid' ? 1000 : 800;
            return base - (i * 50) + Math.random() * 100;
        });
    }

    generatePriceData(points) {
        const basePrice = 0.125;
        let price = basePrice;
        return Array.from({length: points}, () => {
            price += (Math.random() - 0.5) * 0.005;
            return Math.max(0.10, Math.min(0.15, price));
        });
    }

    generateVolumeData(points) {
        return Array.from({length: points}, () => Math.random() * 1000 + 200);
    }

    updateChartTimeframe(timeframe) {
        console.log(`Updating charts to ${timeframe} timeframe`);
        // Update chart data based on timeframe
        if (this.charts.advanced) {
            const points = timeframe === '5m' ? 100 : timeframe === '15m' ? 50 : 24;
            this.charts.advanced.data.labels = this.generateTimeLabels(points);
            this.charts.advanced.data.datasets[0].data = this.generatePriceData(points);
            this.charts.advanced.data.datasets[1].data = this.generateVolumeData(points);
            this.charts.advanced.update();
        }
    }

    // Enhanced real-time updates
    startAdvancedRealTimeUpdates() {
        // Update prices every 2 seconds
        setInterval(() => {
            this.updatePriceData();
            this.updateOrderBook();
            this.updatePriceTicker();
        }, 2000);

        // Update portfolio every 5 seconds
        setInterval(() => {
            this.updatePortfolioData();
            this.updatePortfolioDisplay();
        }, 5000);

        // Update charts every 10 seconds
        setInterval(() => {
            this.updateChartData();
        }, 10000);

        // Simulate news updates
        setInterval(() => {
            this.addNewsUpdate();
        }, 30000);
    }

    updatePriceData() {
        Object.keys(this.priceData).forEach(symbol => {
            const currentPrice = this.priceData[symbol].price;
            const change = (Math.random() - 0.5) * 0.01; // ±1% change
            const newPrice = Math.max(0.05, currentPrice * (1 + change));
            const priceChange = ((newPrice - currentPrice) / currentPrice) * 100;
            
            this.priceData[symbol] = {
                price: newPrice,
                change: priceChange
            };
        });
    }

    updatePortfolioData() {
        // Simulate portfolio value changes
        const change = (Math.random() - 0.5) * 20; // ±$20 change
        this.portfolioData.totalValue += change;
        this.portfolioData.dayChange += change;
        this.portfolioData.dayChangePercent = (this.portfolioData.dayChange / (this.portfolioData.totalValue - this.portfolioData.dayChange)) * 100;
    }

    updateChartData() {
        if (this.charts.portfolio) {
            const data = this.charts.portfolio.data;
            data.datasets[0].data.shift();
            data.datasets[0].data.push(this.portfolioData.totalValue);
            this.charts.portfolio.update('none');
        }

        if (this.charts.advanced) {
            const data = this.charts.advanced.data;
            data.datasets[0].data.shift();
            data.datasets[0].data.push(this.priceData.ELEC.price);
            data.datasets[1].data.shift();
            data.datasets[1].data.push(Math.random() * 1000 + 200);
            this.charts.advanced.update('none');
        }
    }

    addNewsUpdate() {
        const newsItems = [
            {
                icon: 'fas fa-bolt',
                title: 'Flash: Energy Token Prices Surge on Grid Demand',
                content: 'Unexpected spike in energy demand drives token prices up by 5% in the last hour.',
                meta: ['Just now', 'Breaking News', 'High Impact']
            },
            {
                icon: 'fas fa-sun',
                title: 'Solar Production Forecast Upgraded',
                content: 'Weather services upgrade solar production forecast for next week by 12%.',
                meta: ['2 minutes ago', 'Solar Energy', 'Medium Impact']
            },
            {
                icon: 'fas fa-wind',
                title: 'Wind Farm Capacity Increases 8%',
                content: 'New wind farm installations contribute to increased renewable energy capacity.',
                meta: ['5 minutes ago', 'Wind Energy', 'Medium Impact']
            }
        ];

        const randomNews = newsItems[Math.floor(Math.random() * newsItems.length)];
        const newsFeed = document.getElementById('news-feed-content');
        
        if (newsFeed) {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            newsItem.innerHTML = `
                <div class="news-image">
                    <i class="${randomNews.icon}"></i>
                </div>
                <div class="news-content">
                    <h4>${randomNews.title}</h4>
                    <p>${randomNews.content}</p>
                    <div class="news-meta">
                        ${randomNews.meta.map(item => `<span>${item}</span>`).join('')}
                    </div>
                </div>
            `;
            
            newsFeed.insertBefore(newsItem, newsFeed.firstChild);
            
            // Keep only the latest 5 news items
            while (newsFeed.children.length > 5) {
                newsFeed.removeChild(newsFeed.lastChild);
            }
        }
    }

    addStaggeredAnimations() {
        // Add staggered animations to widget cards
        const widgetCards = document.querySelectorAll('.widget-card');
        widgetCards.forEach((card, index) => {
            card.classList.add(`animate-stagger-${Math.min(index + 1, 4)}`);
        });

        // Add animations to stat cards
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = 'scaleIn 0.6s ease-out both';
            }, index * 100);
        });

        // Add animations to activity items
        const activityItems = document.querySelectorAll('.activity-item');
        activityItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.animation = 'slideInRight 0.5s ease-out both';
            }, index * 50);
        });
    }

    // Enhanced notification system
    showAdvancedNotification(title, message, type = 'info', actions = []) {
        const notification = document.createElement('div');
        notification.className = `toast toast-${type}`;
        
        notification.innerHTML = `
            <div class="toast-content">
                <i class="${this.getNotificationIcon(type)}"></i>
                <div class="toast-text">
                    <div class="toast-title">${title}</div>
                    <div class="toast-message">${message}</div>
                </div>
            </div>
            ${actions.length > 0 ? `
                <div class="toast-actions">
                    ${actions.map(action => `
                        <button class="toast-action" onclick="${action.callback}">${action.text}</button>
                    `).join('')}
                </div>
            ` : ''}
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        const container = document.querySelector('.toast-container') || this.createToastContainer();
        container.appendChild(notification);

        // Auto-remove after 5 seconds if no actions
        if (actions.length === 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.classList.add('slide-out');
                    setTimeout(() => notification.remove(), 300);
                }
            }, 5000);
        }

        return notification;
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Initialize Advanced AI Trading Features
     */
    async initializeAIInsights() {
        console.log('🤖 Initializing AI trading insights...');
        
        // AI Settings Event Listeners
        document.getElementById('ai-settings-btn')?.addEventListener('click', () => {
            this.openAISettingsModal();
        });
        
        document.getElementById('enable-auto-trading')?.addEventListener('click', () => {
            this.toggleAutoTrading();
        });
        
        document.getElementById('refresh-strategies')?.addEventListener('click', () => {
            this.refreshTradingStrategies();
        });
        
        // Initialize AI predictions
        this.updateAIPredictions();
        this.updateRiskAnalysis();
        
        // Start AI update cycle
        setInterval(() => {
            this.updateAIPredictions();
            this.updateRiskAnalysis();
        }, 30000); // Update every 30 seconds
    }
    
    /**
     * Update AI Market Predictions
     */
    updateAIPredictions() {
        const predictions = [
            {
                token: 'ELEC',
                direction: Math.random() > 0.5 ? 'up' : 'down',
                percentage: (Math.random() * 15 + 1).toFixed(1),
                confidence: Math.floor(Math.random() * 30 + 70),
                icon: 'fas fa-bolt'
            },
            {
                token: 'SOLAR',
                direction: Math.random() > 0.4 ? 'up' : 'down',
                percentage: (Math.random() * 10 + 1).toFixed(1),
                confidence: Math.floor(Math.random() * 25 + 65),
                icon: 'fas fa-sun'
            },
            {
                token: 'WIND',
                direction: Math.random() > 0.6 ? 'up' : 'down',
                percentage: (Math.random() * 8 + 1).toFixed(1),
                confidence: Math.floor(Math.random() * 20 + 70),
                icon: 'fas fa-wind'
            }
        ];
        
        const container = document.querySelector('.predictions-container');
        if (container) {
            container.innerHTML = predictions.map(pred => `
                <div class="prediction-item">
                    <div class="prediction-token">
                        <i class="${pred.icon} ${pred.token.toLowerCase()}-icon"></i>
                        <span>${pred.token}</span>
                    </div>
                    <div class="prediction-data">
                        <div class="prediction-direction ${pred.direction}">
                            <i class="fas fa-arrow-${pred.direction === 'up' ? 'up' : 'down'}"></i>
                            <span>${pred.direction === 'up' ? '+' : '-'}${pred.percentage}%</span>
                        </div>
                        <div class="prediction-confidence">
                            <span>Confidence: ${pred.confidence}%</span>
                            <div class="confidence-bar">
                                <div class="confidence-fill" style="width: ${pred.confidence}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="prediction-timeframe">24h</div>
                </div>
            `).join('');
        }
        
        // Update prediction accuracy
        const accuracyElement = document.querySelector('.accuracy-value');
        if (accuracyElement) {
            const accuracy = (Math.random() * 5 + 90).toFixed(1);
            accuracyElement.textContent = `${accuracy}%`;
        }
    }
    
    /**
     * Update Risk Analysis
     */
    updateRiskAnalysis() {
        const riskScore = (Math.random() * 3 + 1).toFixed(1);
        const riskLevel = riskScore < 2 ? 'low' : riskScore < 3 ? 'medium' : 'high';
        
        const riskScoreElement = document.querySelector('.risk-value');
        if (riskScoreElement) {
            riskScoreElement.textContent = `${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} (${riskScore})`;
            riskScoreElement.className = `risk-value ${riskLevel}`;
        }
        
        // Update risk indicators
        const indicators = document.querySelectorAll('.risk-indicator');
        indicators.forEach((indicator, index) => {
            const value = indicator.querySelector('.indicator-value');
            const status = indicator.querySelector('.indicator-status');
            
            if (value && status) {
                switch (index) {
                    case 0: // Market Volatility
                        const volatility = Math.floor(Math.random() * 20 + 5);
                        value.textContent = `${volatility}%`;
                        status.textContent = volatility < 15 ? 'Low Risk' : volatility < 25 ? 'Medium Risk' : 'High Risk';
                        status.className = `indicator-status ${volatility < 15 ? 'low' : volatility < 25 ? 'medium' : 'high'}`;
                        break;
                    case 1: // Portfolio Balance
                        const balance = Math.floor(Math.random() * 20 + 75);
                        value.textContent = `${balance}%`;
                        status.textContent = balance > 80 ? 'Well Balanced' : 'Needs Rebalancing';
                        status.className = `indicator-status ${balance > 80 ? 'good' : 'medium'}`;
                        break;
                    case 2: // Position Duration
                        const duration = (Math.random() * 5 + 1).toFixed(1);
                        value.textContent = `${duration}d`;
                        status.textContent = duration < 3 ? 'Low Risk' : duration < 5 ? 'Medium Risk' : 'High Risk';
                        status.className = `indicator-status ${duration < 3 ? 'low' : 'medium'}`;
                        break;
                }
            }
        });
    }
    
    /**
     * Initialize Advanced Analytics
     */
    async initializeAdvancedAnalytics() {
        console.log('📊 Initializing advanced analytics...');
        
        // Analytics timeframe selector
        document.getElementById('analytics-timeframe')?.addEventListener('change', (e) => {
            this.updateAnalyticsTimeframe(e.target.value);
        });
        
        document.getElementById('export-analytics')?.addEventListener('click', () => {
            this.exportAnalyticsData();
        });
        
        document.getElementById('refresh-correlation')?.addEventListener('click', () => {
            this.updateCorrelationMatrix();
        });
        
        // Initialize heat map interactions
        this.initializeHeatMap();
        
        // Initialize correlation matrix
        this.updateCorrelationMatrix();
        
        // Initialize performance metrics
        this.updatePerformanceMetrics();
        
        // Update analytics every minute
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 60000);
    }
    
    /**
     * Initialize Heat Map Interactions
     */
    initializeHeatMap() {
        const heatmapCells = document.querySelectorAll('.heatmap-cell');
        heatmapCells.forEach(cell => {
            cell.addEventListener('click', () => {
                const value = cell.getAttribute('data-value');
                this.showHeatMapDetails(value, cell);
            });
        });
    }
    
    /**
     * Show Heat Map Details
     */
    showHeatMapDetails(value, cell) {
        // Create and show tooltip with detailed information
        const tooltip = document.createElement('div');
        tooltip.className = 'heatmap-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-header">Trading Activity Details</div>
            <div class="tooltip-content">
                <div class="tooltip-row">
                    <span>Trades:</span>
                    <span>${value}</span>
                </div>
                <div class="tooltip-row">
                    <span>Volume:</span>
                    <span>$${(parseInt(value) * 1247.5).toLocaleString()}</span>
                </div>
                <div class="tooltip-row">
                    <span>Avg Size:</span>
                    <span>$${(1247.5).toFixed(2)}</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = cell.getBoundingClientRect();
        tooltip.style.position = 'absolute';
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
        tooltip.style.zIndex = '1000';
        
        // Remove tooltip after 3 seconds
        setTimeout(() => {
            document.body.removeChild(tooltip);
        }, 3000);
    }
    
    /**
     * Update Correlation Matrix
     */
    updateCorrelationMatrix() {
        const correlationCells = document.querySelectorAll('.correlation-cell');
        correlationCells.forEach(cell => {
            // Generate random correlation values
            const correlation = (Math.random() * 2 - 1).toFixed(2); // -1 to 1
            cell.textContent = correlation;
            cell.setAttribute('data-correlation', correlation);
            
            // Update cell class based on correlation value
            cell.className = 'correlation-cell';
            if (correlation == 1.00) {
                cell.classList.add('perfect');
            } else if (correlation > 0.7) {
                cell.classList.add('high');
            } else if (correlation > 0.3) {
                cell.classList.add('medium');
            } else if (correlation > 0) {
                cell.classList.add('low');
            } else {
                cell.classList.add('negative');
            }
        });
        
        // Add refresh animation
        const refreshBtn = document.getElementById('refresh-correlation');
        if (refreshBtn) {
            refreshBtn.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                refreshBtn.style.transform = 'rotate(0deg)';
            }, 600);
        }
    }
    
    /**
     * Update Performance Metrics
     */
    updatePerformanceMetrics() {
        const metrics = [
            {
                label: 'Sharpe Ratio',
                value: (Math.random() * 2 + 1).toFixed(2),
                change: (Math.random() * 0.5 - 0.25).toFixed(2)
            },
            {
                label: 'Max Drawdown',
                value: `-${(Math.random() * 5 + 1).toFixed(1)}%`,
                change: (Math.random() * 2 - 1).toFixed(1)
            },
            {
                label: 'Win Rate',
                value: `${(Math.random() * 20 + 60).toFixed(1)}%`,
                change: (Math.random() * 5 - 2.5).toFixed(1)
            },
            {
                label: 'Profit Factor',
                value: (Math.random() * 1.5 + 1).toFixed(2),
                change: (Math.random() * 0.2 - 0.1).toFixed(2)
            }
        ];
        
        const metricItems = document.querySelectorAll('.metric-item');
        metricItems.forEach((item, index) => {
            if (metrics[index]) {
                const valueEl = item.querySelector('.metric-value');
                const changeEl = item.querySelector('.metric-change');
                
                if (valueEl) valueEl.textContent = metrics[index].value;
                if (changeEl) {
                    const change = parseFloat(metrics[index].change);
                    changeEl.textContent = `${change >= 0 ? '+' : ''}${metrics[index].change}${metrics[index].label === 'Max Drawdown' ? '%' : ''}`;
                    changeEl.className = `metric-change ${change >= 0 ? 'positive' : 'negative'}`;
                }
            }
        });
    }
    
    /**
     * Toggle Auto Trading
     */
    toggleAutoTrading() {
        const button = document.getElementById('enable-auto-trading');
        const isEnabled = button.textContent.includes('Enable');
        
        if (button) {
            if (isEnabled) {
                button.innerHTML = '<i class="fas fa-pause"></i> Disable Auto-Trading';
                button.classList.remove('btn-primary');
                button.classList.add('btn-danger');
                this.showNotification('Auto-trading enabled', 'success');
            } else {
                button.innerHTML = '<i class="fas fa-robot"></i> Enable Auto-Trading';
                button.classList.remove('btn-danger');
                button.classList.add('btn-primary');
                this.showNotification('Auto-trading disabled', 'warning');
            }
        }
    }
    
    /**
     * Refresh Trading Strategies
     */
    refreshTradingStrategies() {
        const strategies = document.querySelectorAll('.strategy-item');
        strategies.forEach(strategy => {
            // Simulate strategy performance update
            const performanceValue = strategy.querySelector('.metric-value');
            if (performanceValue) {
                const newROI = (Math.random() * 20 - 5).toFixed(1);
                performanceValue.textContent = `${newROI >= 0 ? '+' : ''}${newROI}%`;
                performanceValue.className = `metric-value ${newROI >= 0 ? 'positive' : 'negative'}`;
            }
        });
        
        // Add refresh animation
        const refreshBtn = document.getElementById('refresh-strategies');
        if (refreshBtn) {
            refreshBtn.style.transform = 'rotate(180deg)';
            setTimeout(() => {
                refreshBtn.style.transform = 'rotate(0deg)';
            }, 600);
        }
        
        this.showNotification('Trading strategies updated', 'success');
    }
    
    /**
     * Open AI Settings Modal
     */
    openAISettingsModal() {
        // Create and show AI settings modal
        const modal = document.createElement('div');
        modal.className = 'ai-settings-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-cog"></i> AI Trading Configuration</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="setting-group">
                            <label>Risk Tolerance</label>
                            <select class="setting-input">
                                <option value="conservative">Conservative</option>
                                <option value="moderate" selected>Moderate</option>
                                <option value="aggressive">Aggressive</option>
                            </select>
                        </div>
                        <div class="setting-group">
                            <label>Max Position Size</label>
                            <input type="range" min="1" max="100" value="25" class="setting-slider">
                            <span class="slider-value">25%</span>
                        </div>
                        <div class="setting-group">
                            <label>Enable Strategies</label>
                            <div class="checkbox-group">
                                <label><input type="checkbox" checked> Peak Shaving</label>
                                <label><input type="checkbox"> Weather Trading</label>
                                <label><input type="checkbox"> Grid Arbitrage</label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary modal-cancel">Cancel</button>
                        <button class="btn-primary modal-save">Save Settings</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Modal event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.modal-cancel').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.modal-save').addEventListener('click', () => {
            this.showNotification('AI settings saved successfully', 'success');
            document.body.removeChild(modal);
        });
        
        // Slider interaction
        const slider = modal.querySelector('.setting-slider');
        const sliderValue = modal.querySelector('.slider-value');
        slider.addEventListener('input', (e) => {
            sliderValue.textContent = `${e.target.value}%`;
        });
    }
    
    /**
     * Export Analytics Data
     */
    exportAnalyticsData() {
        const data = {
            timestamp: new Date().toISOString(),
            portfolio: this.tradingData,
            predictions: 'AI prediction data',
            correlations: 'Asset correlation matrix',
            performance: 'Performance metrics',
            heatmap: 'Trading activity heatmap'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `electrode-analytics-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Analytics data exported successfully', 'success');
    }
    
    /**
     * Update Analytics Timeframe
     */
    updateAnalyticsTimeframe(timeframe) {
        console.log(`📊 Updating analytics timeframe to: ${timeframe}`);
        
        // Update all analytics components based on timeframe
        this.updateCorrelationMatrix();
        this.updatePerformanceMetrics();
        
        // Update period display
        const periodElement = document.querySelector('.performance-period');
        if (periodElement) {
            const periodMap = {
                '1h': 'Last Hour',
                '24h': 'Last 24 Hours',
                '7d': 'Last 7 Days',
                '30d': 'Last 30 Days'
            };
            periodElement.textContent = periodMap[timeframe] || 'Last 24 Hours';
        }
        
        this.showNotification(`Analytics updated for ${timeframe} timeframe`, 'info');
    }

    /**
     * Initialize Theme Toggle and Header Features
     */
    initializeHeaderFeatures() {
        // Theme toggle functionality
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
            
            // Load saved theme
            const savedTheme = localStorage.getItem('electrode-theme');
            if (savedTheme) {
                this.setTheme(savedTheme);
            }
        }
        
        // Fullscreen toggle
        const fullscreenToggle = document.getElementById('fullscreen-toggle');
        if (fullscreenToggle) {
            fullscreenToggle.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
        
        // Notification dropdown
        const notificationToggle = document.getElementById('notifications-toggle');
        const notificationDropdown = document.getElementById('notification-dropdown');
        
        if (notificationToggle && notificationDropdown) {
            notificationToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationDropdown.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!notificationDropdown.contains(e.target) && !notificationToggle.contains(e.target)) {
                    notificationDropdown.classList.remove('show');
                }
            });
            
            // Mark all as read functionality
            const markAllRead = notificationDropdown.querySelector('.mark-all-read');
            if (markAllRead) {
                markAllRead.addEventListener('click', () => {
                    this.markAllNotificationsRead();
                });
            }
        }
        
        // Initialize notification system
        this.initializeNotificationSystem();
    }
    
    /**
     * Toggle Dark/Light Theme
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    /**
     * Set Theme
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('electrode-theme', theme);
        
        // Update theme toggle icon
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (theme === 'dark') {
                icon.className = 'fas fa-sun';
                themeToggle.title = 'Switch to Light Mode';
            } else {
                icon.className = 'fas fa-moon';
                themeToggle.title = 'Switch to Dark Mode';
            }
        }
        
        // Update chart colors for theme
        this.updateChartsForTheme(theme);
        
        this.showNotification(`Switched to ${theme} mode`, 'success');
    }
    
    /**
     * Update Charts for Theme
     */
    updateChartsForTheme(theme) {
        const isDark = theme === 'dark';
        const textColor = isDark ? '#ffffff' : '#2c3e50';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
        
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.options) {
                // Update text colors
                if (chart.options.scales) {
                    Object.keys(chart.options.scales).forEach(scaleKey => {
                        const scale = chart.options.scales[scaleKey];
                        if (scale.ticks) {
                            scale.ticks.color = textColor;
                        }
                        if (scale.grid) {
                            scale.grid.color = gridColor;
                        }
                    });
                }
                
                // Update legend colors
                if (chart.options.plugins && chart.options.plugins.legend) {
                    chart.options.plugins.legend.labels = {
                        ...chart.options.plugins.legend.labels,
                        color: textColor
                    };
                }
                
                chart.update();
            }
        });
    }
    
    /**
     * Toggle Fullscreen Mode
     */
    toggleFullscreen() {
        const dashboard = document.getElementById('dashboard-container');
        const fullscreenBtn = document.getElementById('fullscreen-toggle');
        
        if (!document.fullscreenElement) {
            // Enter fullscreen
            if (dashboard.requestFullscreen) {
                dashboard.requestFullscreen();
            } else if (dashboard.webkitRequestFullscreen) {
                dashboard.webkitRequestFullscreen();
            } else if (dashboard.msRequestFullscreen) {
                dashboard.msRequestFullscreen();
            }
            
            dashboard.classList.add('fullscreen-active');
            fullscreenBtn.querySelector('i').className = 'fas fa-compress';
            fullscreenBtn.title = 'Exit Fullscreen';
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            
            dashboard.classList.remove('fullscreen-active');
            fullscreenBtn.querySelector('i').className = 'fas fa-expand';
            fullscreenBtn.title = 'Enter Fullscreen';
        }
    }
    
    /**
     * Initialize Notification System
     */
    initializeNotificationSystem() {
        this.notifications = [
            {
                id: 1,
                icon: 'fas fa-chart-line',
                text: 'SOLAR tokens increased by 8.2%',
                time: '2 minutes ago',
                unread: true
            },
            {
                id: 2,
                icon: 'fas fa-bolt',
                text: 'Energy trade executed successfully',
                time: '5 minutes ago',
                unread: false
            },
            {
                id: 3,
                icon: 'fas fa-brain',
                text: 'AI recommendation: Buy WIND tokens',
                time: '12 minutes ago',
                unread: false
            }
        ];
        
        this.updateNotificationDisplay();
        
        // Start notification updates
        setInterval(() => {
            this.generateRandomNotification();
        }, 45000); // New notification every 45 seconds
    }
    
    /**
     * Update Notification Display
     */
    updateNotificationDisplay() {
        const notificationList = document.querySelector('.notification-list');
        const notificationDot = document.querySelector('.notification-dot');
        
        if (notificationList) {
            notificationList.innerHTML = this.notifications.map(notification => `
                <div class="notification-item ${notification.unread ? 'unread' : ''}" data-id="${notification.id}">
                    <i class="${notification.icon}"></i>
                    <div class="notification-content">
                        <div class="notification-text">${notification.text}</div>
                        <div class="notification-time">${notification.time}</div>
                    </div>
                </div>
            `).join('');
            
            // Add click handlers for individual notifications
            notificationList.querySelectorAll('.notification-item').forEach(item => {
                item.addEventListener('click', () => {
                    const notificationId = parseInt(item.dataset.id);
                    this.markNotificationRead(notificationId);
                });
            });
        }
        
        // Show/hide notification dot based on unread count
        const unreadCount = this.notifications.filter(n => n.unread).length;
        if (notificationDot) {
            notificationDot.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }
    
    /**
     * Generate Random Notification
     */
    generateRandomNotification() {
        const notificationTypes = [
            {
                icon: 'fas fa-trending-up',
                texts: [
                    'Price alert: {token} reached target price',
                    '{token} trading volume increased by {percent}%',
                    'New high for {token}: ${price}'
                ]
            },
            {
                icon: 'fas fa-robot',
                texts: [
                    'AI detected profitable trading opportunity',
                    'Market sentiment analysis updated',
                    'Risk assessment: Portfolio rebalancing recommended'
                ]
            },
            {
                icon: 'fas fa-bolt',
                texts: [
                    'Energy production milestone reached',
                    'Grid efficiency improved by {percent}%',
                    'Peak demand period detected'
                ]
            }
        ];
        
        const tokens = ['SOLAR', 'WIND', 'ELEC', 'GRID', 'BATT'];
        const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        const textTemplate = type.texts[Math.floor(Math.random() * type.texts.length)];
        
        // Replace placeholders
        const text = textTemplate
            .replace('{token}', tokens[Math.floor(Math.random() * tokens.length)])
            .replace('{percent}', (Math.random() * 15 + 5).toFixed(1))
            .replace('{price}', (Math.random() * 0.05 + 0.10).toFixed(4));
        
        const newNotification = {
            id: Date.now(),
            icon: type.icon,
            text: text,
            time: 'Just now',
            unread: true
        };
        
        // Add to beginning of notifications array
        this.notifications.unshift(newNotification);
        
        // Keep only last 10 notifications
        if (this.notifications.length > 10) {
            this.notifications = this.notifications.slice(0, 10);
        }
        
        this.updateNotificationDisplay();
        
        // Show toast for important notifications
        if (Math.random() < 0.3) { // 30% chance
            this.showNotification(text, 'info');
        }
    }
    
    /**
     * Mark Notification as Read
     */
    markNotificationRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && notification.unread) {
            notification.unread = false;
            this.updateNotificationDisplay();
        }
    }
    
    /**
     * Mark All Notifications as Read
     */
    markAllNotificationsRead() {
        this.notifications.forEach(notification => {
            notification.unread = false;
        });
        this.updateNotificationDisplay();
        this.showNotification('All notifications marked as read', 'success');
    }
    
    /**
     * Enhanced Keyboard Shortcuts
     */
    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only trigger if not typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch (e.key.toLowerCase()) {
                case 't':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.toggleTheme();
                    }
                    break;
                case 'f':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.toggleFullscreen();
                    }
                    break;
                case 'n':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        document.getElementById('notifications-toggle')?.click();
                    }
                    break;
                case 's':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        document.getElementById('dashboard-search')?.focus();
                    }
                    break;
                case 'escape':
                    // Close any open modals or dropdowns
                    document.querySelector('.notification-dropdown.show')?.classList.remove('show');
                    document.querySelector('.ai-settings-modal')?.remove();
                    break;
            }
        });
    }
    
    /**
     * Performance Optimization Features
     */
    initializePerformanceOptimization() {
        // Intersection Observer for lazy loading widgets
        const observerOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };
        
        this.widgetObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const widget = entry.target;
                    widget.classList.add('visible');
                    
                    // Initialize chart if it has one
                    const chartId = widget.dataset.chartId;
                    if (chartId && !this.charts[chartId]) {
                        this.initializeWidgetChart(chartId);
                    }
                }
            });
        }, observerOptions);
        
        // Observe all widget cards
        document.querySelectorAll('.widget-card').forEach(widget => {
            this.widgetObserver.observe(widget);
        });
        
        // Virtual scrolling for large datasets
        this.initializeVirtualScrolling();
    }
    
    /**
     * Initialize Virtual Scrolling for Performance
     */
    initializeVirtualScrolling() {
        const orderBookContainer = document.querySelector('.order-book-content');
        if (orderBookContainer && this.orderBook) {
            // Implement virtual scrolling for order book if it gets large
            const itemHeight = 30;
            const containerHeight = orderBookContainer.clientHeight;
            const visibleItems = Math.ceil(containerHeight / itemHeight) + 2;
            
            this.virtualScrollConfig = {
                itemHeight,
                visibleItems,
                scrollTop: 0
            };
        }
    }
    
    // ...existing code...
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.electrodeDashboard = new ElectrodeDashboard();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElectrodeDashboard;
}
