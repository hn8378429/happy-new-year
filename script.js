// =========== GLOBAL VARIABLES ===========
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fireworks = [];
let particles = [];
let autoFireworks = true;
let midnightMode = false;
let userCountry = '';
let userTimeZone = '';
let nextMidnightCountry = '';
let nextMidnightTime = null;
let currentTheme = 0;
let megaShowActive = false;

// Country data with timezones and flags
const countries = [
    { name: "New Zealand", city: "Auckland", timezone: "Pacific/Auckland", flag: "🇳🇿", offset: 13 },
    { name: "Australia", city: "Sydney", timezone: "Australia/Sydney", flag: "🇦🇺", offset: 11 },
    { name: "Japan", city: "Tokyo", timezone: "Asia/Tokyo", flag: "🇯🇵", offset: 9 },
    { name: "China", city: "Beijing", timezone: "Asia/Shanghai", flag: "🇨🇳", offset: 8 },
    { name: "India", city: "Mumbai", timezone: "Asia/Kolkata", flag: "🇮🇳", offset: 5.5 },
    { name: "UAE", city: "Dubai", timezone: "Asia/Dubai", flag: "🇦🇪", offset: 4 },
    { name: "Russia", city: "Moscow", timezone: "Europe/Moscow", flag: "🇷🇺", offset: 3 },
    { name: "Germany", city: "Berlin", timezone: "Europe/Berlin", flag: "🇩🇪", offset: 1 },
    { name: "UK", city: "London", timezone: "Europe/London", flag: "🇬🇧", offset: 0 },
    { name: "Brazil", city: "Rio", timezone: "America/Sao_Paulo", flag: "🇧🇷", offset: -3 },
    { name: "USA", city: "New York", timezone: "America/New_York", flag: "🇺🇸", offset: -5 },
    { name: "Mexico", city: "Mexico City", timezone: "America/Mexico_City", flag: "🇲🇽", offset: -6 },
    { name: "USA", city: "Los Angeles", timezone: "America/Los_Angeles", flag: "🇺🇸", offset: -8 }
];

const themes = [
    { bg: ['#000428', '#004e92'], particleColors: ['#FFD700', '#FF8C00', '#FF1493', '#00BFFF'] },
    { bg: ['#0f0c29', '#302b63'], particleColors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9A8B'] },
    { bg: ['#232526', '#414345'], particleColors: ['#FF4081', '#7C4DFF', '#18FFFF', '#64FFDA'] },
    { bg: ['#141E30', '#243B55'], particleColors: ['#FF5252', '#FFD740', '#69F0AE', '#448AFF'] }
];

// =========== INITIALIZATION ===========
function init() {
    createStarBackground();
    setupEventListeners();
    detectUserLocation();
    updateWorldClocks();
    startCountdownTimer();
    animate();
    
    // Start auto fireworks
    setInterval(() => {
        if (autoFireworks && !megaShowActive) {
            createRandomFirework();
        }
    }, 800);
}

// =========== BACKGROUND STARS ===========
function createStarBackground() {
    const bg = document.getElementById('bgAnimation');
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        bg.appendChild(star);
    }
}

// =========== USER LOCATION DETECTION ===========
function detectUserLocation() {
    // Try to get location from browser
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
                    const data = await response.json();
                    userCountry = data.address.country || 'Unknown';
                    document.getElementById('currentCountry').textContent = userCountry;
                    
                    // Set user timezone
                    userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    updateLocalTime();
                } catch (error) {
                    fallbackLocation();
                }
            },
            () => fallbackLocation()
        );
    } else {
        fallbackLocation();
    }
}

function fallbackLocation() {
    // Fallback to IP-based location
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            userCountry = data.country_name || 'Unknown';
            userTimeZone = data.timezone || 'UTC';
            document.getElementById('currentCountry').textContent = userCountry;
            updateLocalTime();
        })
        .catch(() => {
            userCountry = 'Global';
            userTimeZone = 'UTC';
            document.getElementById('currentCountry').textContent = 'Global';
            updateLocalTime();
        });
}

function updateLocalTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { timeZone: userTimeZone });
    document.getElementById('localTime').textContent = timeString;
    
    // Check if it's midnight in user's location
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    if (midnightMode && hours === 0 && minutes === 0) {
        triggerMidnightFireworks();
    }
}

// =========== WORLD CLOCKS ===========
function updateWorldClocks() {
    const worldClocks = document.getElementById('worldClocks');
    worldClocks.innerHTML = '';
    
    let nextCountry = null;
    let minTimeToMidnight = Infinity;
    
    countries.forEach(country => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { timeZone: country.timezone });
        const dateString = now.toLocaleDateString('en-US', { 
            timeZone: country.timezone,
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        
        // Calculate time to midnight
        const midnight = new Date(now.toLocaleString('en-US', { timeZone: country.timezone }));
        midnight.setHours(24, 0, 0, 0);
        const timeToMidnight = midnight.getTime() - now.getTime();
        
        // Check if this is the next midnight
        if (timeToMidnight < minTimeToMidnight && timeToMidnight > 0) {
            minTimeToMidnight = timeToMidnight;
            nextCountry = country;
            nextMidnightTime = midnight;
        }
        
        // Create clock element
        const clock = document.createElement('div');
        clock.className = 'country-clock';
        
        // Check if it's active (within 10 minutes of midnight)
        const hoursToMidnight = timeToMidnight / (1000 * 60 * 60);
        if (hoursToMidnight < 0.5) {
            clock.classList.add('active');
            if (hoursToMidnight < 0.17) { // 10 minutes
                clock.classList.add('next');
            }
        }
        
        clock.innerHTML = `
            <div class="flag">${country.flag}</div>
            <div class="country-name">${country.name}</div>
            <div class="city-name">${country.city}</div>
            <div class="time-display">${timeString}</div>
            <div class="date">${dateString}</div>
            <div class="countdown ${hoursToMidnight < 1 ? 'soon' : ''}">
                ${formatTimeToMidnight(timeToMidnight)} to midnight
            </div>
        `;
        
        worldClocks.appendChild(clock);
    });
    
    // Update next midnight display
    if (nextCountry) {
        nextMidnightCountry = nextCountry.name;
        document.getElementById('nextCountry').textContent = `${nextCountry.name} (${nextCountry.city})`;
    }
}

function formatTimeToMidnight(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
}

// =========== COUNTDOWN TIMER ===========
function startCountdownTimer() {
    setInterval(() => {
        if (nextMidnightTime) {
            const now = new Date();
            const timeDiff = nextMidnightTime.getTime() - now.getTime();
            
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
            document.getElementById('countdownHours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('countdownMinutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('countdownSeconds').textContent = seconds.toString().padStart(2, '0');
            
            // Trigger fireworks when close to midnight
            if (timeDiff < 10000 && timeDiff > 0 && !megaShowActive) {
                triggerCountdownFireworks(10 - Math.floor(timeDiff / 1000));
            }
        }
        
        updateLocalTime();
        updateWorldClocks();
    }, 1000);
}

// =========== FIREWORKS SYSTEM ===========
class Firework {
    constructor(x, y, targetX, targetY, color, type = 'normal') {
        this.x = x;
        this.y = y;
        this.startY = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = 8 + Math.random() * 4;
        this.size = 4;
        this.color = color || this.getRandomColor();
        this.trail = [];
        this.exploded = false;
        this.type = type;
        this.gravity = 0.1;
        this.velocity = {
            x: (targetX - x) / 30,
            y: -this.speed
        };
        this.sparkle = Math.random() > 0.5;
    }

    getRandomColor() {
        return themes[currentTheme].particleColors[
            Math.floor(Math.random() * themes[currentTheme].particleColors.length)
        ];
    }

    update() {
        if (!this.exploded) {
            // Trail effect
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 8) this.trail.shift();

            // Apply gravity
            this.velocity.y += this.gravity;
            
            // Move towards target
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            
            // Check if reached target
            const distToTarget = Math.sqrt(
                Math.pow(this.targetX - this.x, 2) + 
                Math.pow(this.targetY - this.y, 2)
            );
            
            if (distToTarget < 5 || this.y < this.targetY) {
                this.explode();
            }
        }
    }

    draw() {
        if (!this.exploded) {
            // Draw trail
            ctx.save();
            for (let i = 0; i < this.trail.length; i++) {
                const point = this.trail[i];
                const alpha = i / this.trail.length * 0.7;
                ctx.beginPath();
                ctx.fillStyle = this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
                ctx.arc(point.x, point.y, this.size * alpha, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw main rocket with glow
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();

            // Glow effect
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, 15
            );
            gradient.addColorStop(0, this.color.replace(')', ', 0.7)').replace('rgb', 'rgba'));
            gradient.addColorStop(1, this.color.replace(')', ', 0)').replace('rgb', 'rgba'));
            
            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    explode() {
        this.exploded = true;
        const particleCount = this.type === 'heart' ? 100 : 150;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(
                this.x,
                this.y,
                this.color,
                this.type,
                this.sparkle
            ));
        }
        
        // Play explosion sound
        playExplosionSound();
    }
}

class Particle {
    constructor(x, y, color, type, sparkle = false) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;
        this.size = Math.random() * 3 + 1;
        this.speed = Math.random() * 4 + 2;
        this.angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.gravity = 0.05;
        this.friction = 0.97;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.005;
        this.sparkle = sparkle;
        this.sparkleIntensity = Math.random() * 0.5 + 0.5;
        
        // Type-specific properties
        if (type === 'heart') {
            this.heartSize = this.size * 2;
        }
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        
        this.x += this.vx;
        this.y += this.vy;
        
        this.alpha -= this.decay;
        
        return this.alpha > 0;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this
