// Smart Microgrid Controller - Interactive JavaScript

class SmartMicrogridIndex {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeLoadingScreen();
        this.initializeNavigation();
        this.initializeThemeToggle();
        this.initializeScrollEffects();
        this.initializeAnimations();
        this.initializeStatCounters();
        this.initializeEnergyDiagram();
        this.initializeLiveMetrics();
        this.initializePlatformInterface();
    }

    // Event Listeners
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.hideLoadingScreen();
        });

        window.addEventListener('scroll', () => {
            this.handleScroll();
        });

        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    // Loading Screen
    initializeLoadingScreen() {
        const loadingTexts = [
            'Initializing Smart Microgrid...',
            'Connecting to energy sources...',
            'Optimizing power flow...',
            'System ready!'
        ];

        let textIndex = 0;
        const loadingTextElement = document.querySelector('.loading-text');
        
        const textInterval = setInterval(() => {
            if (textIndex < loadingTexts.length - 1) {
                textIndex++;
                loadingTextElement.textContent = loadingTexts[textIndex];
            } else {
                clearInterval(textInterval);
            }
        }, 800);

        // Auto-hide loading screen after 3 seconds
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 3000);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    // Navigation
    initializeNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navClose = document.getElementById('nav-close');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');
        const navbar = document.getElementById('navbar');

        // Mobile menu toggle
        if (navToggle) {
            navToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                navMenu.classList.add('active');
                document.body.classList.add('menu-open');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            });
        }

        if (navClose) {
            navClose.addEventListener('click', () => {
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                document.body.style.overflow = 'auto';
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu && navToggle && 
                !navMenu.contains(e.target) && 
                !navToggle.contains(e.target) && 
                navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                document.body.style.overflow = 'auto';
            }
        });

        // Close menu when clicking on nav links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 968) {
                    navMenu.classList.remove('active');
                    document.body.classList.remove('menu-open');
                    document.body.style.overflow = 'auto';
                }
            });
        });

        // Navbar scroll effects
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Add scrolled class for styling
            if (currentScrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            // Hide/show navbar on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        });

        // Smooth scrolling for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    this.scrollToSection(targetId);
                    navMenu.classList.remove('active');
                }
            });
        });

        // Update active navigation link on scroll
        this.updateActiveNavLink();
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        });
    }

    // Theme Toggle
    initializeThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const body = document.body;

        // Check for saved theme preference
        const savedTheme = localStorage.getItem('smartgrid-theme');
        if (savedTheme === 'light') {
            body.classList.add('light-theme');
            themeToggle.classList.add('light');
        }

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                body.classList.toggle('light-theme');
                themeToggle.classList.toggle('light');

                // Save theme preference
                const isLight = body.classList.contains('light-theme');
                localStorage.setItem('smartgrid-theme', isLight ? 'light' : 'dark');
            });
        }
    }

    // Scroll Effects
    initializeScrollEffects() {
        const navbar = document.getElementById('navbar');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Back to top button
        const backToTop = document.getElementById('backToTop');
        
        if (backToTop) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            });

            backToTop.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    // Scroll to Section
    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            const offsetTop = element.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    // Animations
    initializeAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animatedElements = document.querySelectorAll('.feature-card, .monitoring-item, .stat-card, .highlight-item');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        // Parallax effect for hero background
        this.initializeParallax();
    }

    initializeParallax() {
        const heroBackground = document.querySelector('.hero-background');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            
            if (heroBackground) {
                heroBackground.style.transform = `translateY(${parallax}px)`;
            }
        });
    }

    // Stat Counters
    initializeStatCounters() {
        const statValues = document.querySelectorAll('.stat-value');
        const heroStatValues = document.querySelectorAll('.hero-stats .stat-value');
        
        const animateCounter = (element, target, duration = 2000) => {
            const start = 0;
            const increment = target / (duration / 16);
            let current = start;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = Math.floor(current * 10) / 10;
            }, 16);
        };

        // Animate hero stats on page load
        setTimeout(() => {
            heroStatValues.forEach(stat => {
                const target = parseFloat(stat.getAttribute('data-target'));
                animateCounter(stat, target);
            });
        }, 1000);

        // Animate other stats when in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseFloat(entry.target.textContent);
                    animateCounter(entry.target, target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statValues.forEach(stat => {
            if (!stat.closest('.hero-stats')) {
                observer.observe(stat);
            }
        });
    }

    // Energy Diagram Animation
    initializeEnergyDiagram() {
        const energySources = document.querySelectorAll('.energy-source, .energy-storage, .energy-load, .energy-grid');
        const energyFlows = document.querySelectorAll('.energy-flow');

        // Add hover effects for energy sources
        energySources.forEach(source => {
            source.addEventListener('mouseenter', () => {
                // Add glow effect
                source.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.5)';
                
                // Animate connected flows
                const className = source.className.split(' ')[0];
                const flow = document.querySelector(`.${className}-flow`);
                if (flow) {
                    flow.style.animationDuration = '0.5s';
                    flow.style.boxShadow = '0 0 15px var(--primary-color)';
                }
            });

            source.addEventListener('mouseleave', () => {
                source.style.boxShadow = '';
                
                const className = source.className.split(' ')[0];
                const flow = document.querySelector(`.${className}-flow`);
                if (flow) {
                    flow.style.animationDuration = '2s';
                    flow.style.boxShadow = '';
                }
            });
        });

        // Simulate energy data updates
        this.simulateEnergyData();
    }

    simulateEnergyData() {
        const updateInterval = 5000; // 5 seconds
        
        const updateEnergyDisplay = () => {
            // Simulate real-time energy values
            const solarPower = (2.5 + Math.random() * 0.6).toFixed(1);
            const windPower = (1.2 + Math.random() * 0.6).toFixed(1);
            const batteryLevel = (80 + Math.random() * 15).toFixed(0);
            const efficiency = (92 + Math.random() * 6).toFixed(0);

            // Update hero stats if visible
            const heroStats = document.querySelectorAll('.hero-stats .stat-value');
            if (heroStats.length >= 4) {
                heroStats[0].textContent = solarPower;
                heroStats[1].textContent = windPower;
                // heroStats[2] is battery capacity (static)
                heroStats[3].textContent = efficiency;
            }

            // Update dashboard preview metrics
            const metricValues = document.querySelectorAll('.metric-value');
            metricValues.forEach((metric, index) => {
                if (index === 0) metric.textContent = `${solarPower}kW`;
                if (index === 1) metric.textContent = `${batteryLevel}%`;
            });

            // Update energy flow intensities
            this.updateEnergyFlows(solarPower, windPower, batteryLevel);
        };

        // Initial update
        setTimeout(updateEnergyDisplay, 2000);
        
        // Periodic updates
        setInterval(updateEnergyDisplay, updateInterval);
    }

    updateEnergyFlows(solar, wind, battery) {
        const solarFlow = document.querySelector('.solar-flow');
        const windFlow = document.querySelector('.wind-flow');
        const batteryFlow = document.querySelector('.battery-flow');

        if (solarFlow) {
            const intensity = (solar / 3.4) * 0.8 + 0.2; // Normalize to 0.2-1.0
            solarFlow.style.opacity = intensity;
            solarFlow.style.animationDuration = `${2 / intensity}s`;
        }

        if (windFlow) {
            const intensity = (wind / 1.8) * 0.8 + 0.2;
            windFlow.style.opacity = intensity;
            windFlow.style.animationDuration = `${2 / intensity}s`;
        }

        if (batteryFlow) {
            const intensity = (battery / 100) * 0.6 + 0.4;
            batteryFlow.style.opacity = intensity;
            batteryFlow.style.animationDuration = `${2 / intensity}s`;
        }
    }

    // Handle window resize
    handleResize() {
        // Recalculate energy diagram positions if needed
        const energyDiagram = document.querySelector('.energy-diagram');
        if (energyDiagram && window.innerWidth < 768) {
            // Adjust diagram for mobile
            energyDiagram.style.transform = 'scale(0.8)';
        } else if (energyDiagram) {
            energyDiagram.style.transform = 'scale(1)';
        }
    }

    // Scroll handling
    handleScroll() {
        // Update scroll-based animations
        const scrolled = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        // Parallax effects
        const particles = document.querySelector('.energy-particles');
        if (particles) {
            particles.style.transform = `translateY(${scrolled * 0.3}px)`;
        }

        // Update progress indicators if any
        this.updateScrollProgress();
    }

    updateScrollProgress() {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.pageYOffset / totalHeight) * 100;
        
        // You can use this progress value for progress bars or other indicators
        document.documentElement.style.setProperty('--scroll-progress', `${progress}%`);
    }

    // Utility Methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Live Metrics Updates
    initializeLiveMetrics() {
        this.pageLoadTime = new Date();
        this.updateLiveMetrics();
        setInterval(() => {
            this.updateLiveMetrics();
        }, 5000); // Update every 5 seconds
    }

    updateLiveMetrics() {
        // Simulate realistic system metrics
        const cpuUsage = document.getElementById('cpu-usage');
        const memoryUsage = document.getElementById('memory-usage');
        const temperature = document.getElementById('temperature');
        const uptime = document.getElementById('uptime');

        if (cpuUsage) {
            const cpu = Math.floor(Math.random() * 30) + 15; // 15-45%
            cpuUsage.textContent = `${cpu}%`;
            cpuUsage.style.color = cpu > 80 ? 'var(--danger-color)' : cpu > 60 ? 'var(--warning-color)' : 'var(--primary-color)';
        }

        if (memoryUsage) {
            const used = (Math.random() * 2 + 1.5).toFixed(1); // 1.5-3.5GB
            memoryUsage.textContent = `${used}GB / 8GB`;
        }

        if (temperature) {
            const temp = Math.floor(Math.random() * 15) + 38; // 38-53°C
            temperature.textContent = `${temp}°C`;
            temperature.style.color = temp > 70 ? 'var(--danger-color)' : temp > 60 ? 'var(--warning-color)' : 'var(--primary-color)';
        }

        if (uptime) {
            // Calculate uptime based on page load time
            const now = new Date();
            const startTime = this.pageLoadTime || now;
            const diff = Math.floor((now - startTime) / 1000);
            const days = Math.floor(diff / 86400) + 15; // Add base days
            const hours = Math.floor((diff % 86400) / 3600) + 3; // Add base hours
            const minutes = Math.floor((diff % 3600) / 60) + 42; // Add base minutes
            uptime.textContent = `${days}d ${hours}h ${minutes}m`;
        }

        // Add trading metrics animation
        this.animateTradingMetrics();
    }

    // Animate Trading Metrics
    animateTradingMetrics() {
        const tradingMetrics = {
            'active-trades': () => Math.floor(Math.random() * 20) + 80,
            'tokens-traded': () => Math.floor(Math.random() * 100) + 1200,
            'revenue-today': () => '₹' + (Math.random() * 4150 + 10800).toFixed(0),
            'platform-uptime': () => (99.5 + Math.random() * 0.4).toFixed(1) + '%'
        };

        Object.keys(tradingMetrics).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = tradingMetrics[id]();
                element.style.transition = 'all 0.3s ease';
                element.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 300);
            }
        });
    }

    // Platform Interface Interactions
    initializePlatformInterface() {
        const tabs = document.querySelectorAll('.interface-tabs .tab');
        const screens = document.querySelectorAll('.interface-screens .screen');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and screens
                tabs.forEach(t => t.classList.remove('active'));
                screens.forEach(s => s.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Show corresponding screen
                const screenType = tab.dataset.screen;
                const targetScreen = document.querySelector(`.screen.${screenType}`);
                if (targetScreen) {
                    targetScreen.classList.add('active');
                }
            });
        });

        // Auto-cycle through tabs for demo effect
        let currentTab = 0;
        setInterval(() => {
            if (tabs.length > 0) {
                tabs[currentTab].click();
                currentTab = (currentTab + 1) % tabs.length;
            }
        }, 4000); // Change tab every 4 seconds

        // Animate trading stats
        this.animateTradingStats();
    }

    animateTradingStats() {
        const tradingNumbers = document.querySelectorAll('.stat-number, .widget-value');
        
        setInterval(() => {
            tradingNumbers.forEach(element => {
                const currentValue = parseInt(element.textContent) || 0;
                const change = Math.floor(Math.random() * 10) - 5; // Random change -5 to +5
                const newValue = Math.max(0, currentValue + change);
                
                if (element.classList.contains('widget-value')) {
                    if (element.textContent.includes('kW')) {
                        element.textContent = `${(newValue / 10).toFixed(1)}kW`;
                    } else {
                        element.textContent = newValue.toString();
                    }
                } else {
                    element.textContent = `+${newValue}`;
                }
            });
        }, 3000); // Update every 3 seconds
    }
}

// Global Functions
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offsetTop = element.offsetTop - 70;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SmartMicrogridIndex();
});

// Add some interactive utilities
window.smartgridUtils = {
    // Toast notification system
    showToast: function(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add toast styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-glass);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 15px 20px;
            color: var(--text-primary);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    },

    // Simulate system status check
    checkSystemStatus: function() {
        this.showToast('Checking system status...', 'info');
        
        setTimeout(() => {
            const status = Math.random() > 0.2 ? 'operational' : 'warning';
            if (status === 'operational') {
                this.showToast('All systems operational!', 'success');
            } else {
                this.showToast('System check completed with warnings', 'warning');
            }
        }, 2000);
    }
};

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + H = Home
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        scrollToSection('home');
    }
    
    // Ctrl/Cmd + D = Dashboard
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        window.location.href = 'dashboard-working.html';
    }
    
    // Ctrl/Cmd + M = Monitoring
    if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        scrollToSection('monitoring');
    }
});

// Add Easter egg - Konami code
let konamiCode = [];
const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑ ↑ ↓ ↓ ← → ← → B A

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.keyCode);
    if (konamiCode.length > konami.length) {
        konamiCode.shift();
    }
    
    if (JSON.stringify(konamiCode) === JSON.stringify(konami)) {
        window.smartgridUtils.showToast('🎉 Smart Grid Master Mode Activated!', 'success');
        document.body.style.filter = 'hue-rotate(180deg)';
        setTimeout(() => {
            document.body.style.filter = '';
        }, 3000);
        konamiCode = [];
    }
});
