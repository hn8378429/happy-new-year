// =========== GLOBAL VARIABLES ===========
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Audio elements
const explosionSound = document.getElementById('explosionSound');
const fireworkLaunchSound = document.getElementById('fireworkLaunchSound');
const countdownSound = document.getElementById('countdownSound');

// State variables
let fireworks = [];
let particles = [];
let autoFireworks = true;
let midnightMode = false;
let soundEnabled = true;
let currentTheme = 0;
let megaShowActive = false;
let animationId = null;

// Themes with proper backgrounds and colors
const themes = [
    { 
        name: "Midnight Blue",
        bg: ['#000428', '#004e92'], 
        particleColors: ['#FFD700', '#FF8C00', '#FF1493', '#00BFFF', '#FF00FF', '#00FF00']
    },
    { 
        name: "Purple Galaxy",
        bg: ['#0f0c29', '#302b63', '#24243e'], 
        particleColors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9A8B', '#9D4EDD', '#FF9E00']
    },
    { 
        name: "Dark Gray",
        bg: ['#232526', '#414345'], 
        particleColors: ['#FF4081', '#7C4DFF', '#18FFFF', '#64FFDA', '#FFEB3B', '#E91E63']
    },
    { 
        name: "Deep Ocean",
        bg: ['#141E30', '#243B55'], 
        particleColors: ['#FF5252', '#FFD740', '#69F0AE', '#448AFF', '#FF80AB', '#00E5FF']
    },
    { 
        name: "Sunset",
        bg: ['#8A2387', '#E94057', '#F27121'], 
        particleColors: ['#FF0000', '#FF9500', '#FFEA00', '#00FF88', '#00D4FF', '#FF00FF']
    }
];

// Country data
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

// =========== INITIALIZATION ===========
function init() {
    console.log("Initializing New Year Fireworks...");
    createStarBackground();
    setupEventListeners();
    updateLocalTime();
    updateWorldClocks();
    startCountdownTimer();
    
    // Set initial theme
    updateTheme();
    
    // Start animation
    animate();
    
    // Start auto fireworks
    setInterval(() => {
        if (autoFireworks && !megaShowActive && fireworks.length < 20) {
            createRandomFirework();
        }
    }, 800);
    
    showMessage("🎉 Welcome to New Year 2026 Fireworks! Click anywhere to launch!");
}

// =========== BACKGROUND STARS ===========
function createStarBackground() {
    const bg = document.getElementById('bgAnimation');
    bg.innerHTML = '';
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        star.style.opacity = Math.random() * 0.5 + 0.2;
        bg.appendChild(star);
    }
}

// =========== THEME SYSTEM ===========
function updateTheme() {
    const theme = themes[currentTheme];
    
    // Update body background
    if (theme.bg.length === 2) {
        document.body.style.background = `linear-gradient(135deg, ${theme.bg[0]} 0%, ${theme.bg[1]} 100%)`;
    } else if (theme.bg.length === 3) {
        document.body.style.background = `linear-gradient(135deg, ${theme.bg[0]} 0%, ${theme.bg[1]} 50%, ${theme.bg[2]} 100%)`;
    }
    
    showMessage(`Theme changed to: ${theme.name}`);
}

// =========== TIME FUNCTIONS ===========
function updateLocalTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('localTime').textContent = timeString;
    
    // Check midnight mode
    if (midnightMode) {
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        // Check if it's exactly midnight (00:00:00)
        if (hours === 0 && minutes === 0 && seconds === 0) {
            triggerMidnightFireworks();
        }
        
        // Check if it's 30 seconds before midnight
        if (hours === 23 && minutes === 59 && seconds >= 30) {
            triggerCountdownFireworks(60 - seconds);
        }
    }
    
    // Update every second
    setTimeout(updateLocalTime, 1000);
}

function updateWorldClocks() {
    const worldClocks = document.getElementById('worldClocks');
    worldClocks.innerHTML = '';
    
    let nextCountry = null;
    let minTimeToMidnight = Infinity;
    
    countries.forEach(country => {
        const now = new Date();
        let timeString, dateString;
        
        try {
            timeString = now.toLocaleTimeString('en-US', { 
                timeZone: country.timezone,
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            dateString = now.toLocaleDateString('en-US', { 
                timeZone: country.timezone,
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            timeString = "Error";
            dateString = "";
        }
        
        // Calculate time to midnight
        try {
            const localTime = new Date(now.toLocaleString('en-US', { timeZone: country.timezone }));
            const midnight = new Date(localTime);
            midnight.setHours(24, 0, 0, 0);
            const timeToMidnight = midnight.getTime() - localTime.getTime();
            
            // Check if this is the next midnight
            if (timeToMidnight < minTimeToMidnight && timeToMidnight > 0) {
                minTimeToMidnight = timeToMidnight;
                nextCountry = country;
            }
            
            // Create clock element
            const clock = document.createElement('div');
            clock.className = 'country-clock';
            
            // Check if it's active (within 1 hour of midnight)
            const hoursToMidnight = timeToMidnight / (1000 * 60 * 60);
            if (hoursToMidnight < 1) {
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
        } catch (e) {
            console.log("Error calculating time for:", country.name);
        }
    });
    
    // Update next midnight display
    if (nextCountry) {
        document.getElementById('nextCountry').textContent = `${nextCountry.name} (${nextCountry.city})`;
    }
    
    // Update every 30 seconds
    setTimeout(updateWorldClocks, 30000);
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
        // Find next midnight
        let nextMidnight = null;
        let minTime = Infinity;
        
        countries.forEach(country => {
            try {
                const now = new Date();
                const localTime = new Date(now.toLocaleString('en-US', { timeZone: country.timezone }));
                const midnight = new Date(localTime);
                midnight.setHours(24, 0, 0, 0);
                const timeDiff = midnight.getTime() - localTime.getTime();
                
                if (timeDiff < minTime && timeDiff > 0) {
                    minTime = timeDiff;
                    nextMidnight = midnight;
                }
            } catch (e) {
                // Skip this country if error
            }
        });
        
        if (nextMidnight) {
            const now = new Date();
            const timeDiff = nextMidnight.getTime() - now.getTime();
            
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
            document.getElementById('countdownHours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('countdownMinutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('countdownSeconds').textContent = seconds.toString().padStart(2, '0');
            
            // Trigger countdown fireworks
            if (timeDiff < 11000 && timeDiff > 0 && !megaShowActive) {
                const secondsLeft = 10 - Math.floor((10000 - timeDiff) / 1000);
                if (secondsLeft > 0 && secondsLeft <= 10) {
                    triggerCountdownFireworks(secondsLeft);
                }
            }
        }
    }, 100);
}

// =========== FIREWORKS SYSTEM ===========
class Firework {
    constructor(x, y, targetX, targetY, color, type = 'normal', size = 4) {
        this.x = x;
        this.y = y;
        this.startY = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = 8 + Math.random() * 4;
        this.size = size;
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
        this.createdAt = Date.now();
        
        // Play launch sound
        if (soundEnabled) {
            playLaunchSound();
        }
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
            
            // Check if reached target or timeout
            const distToTarget = Math.sqrt(
                Math.pow(this.targetX - this.x, 2) + 
                Math.pow(this.targetY - this.y, 2)
            );
            
            const timeAlive = Date.now() - this.createdAt;
            
            if (distToTarget < 5 || this.y < this.targetY || timeAlive > 5000) {
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
        if (soundEnabled) {
            playExplosionSound();
        }
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
        
        if (this.type === 'heart') {
            this.drawHeart();
        } else {
            // Sparkle effect
            if (this.sparkle && Math.random() > 0.7) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
            }
            
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Glow effect
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 4
        );
        gradient.addColorStop(0, this.color.replace(')', ', 0.3)').replace('rgb', 'rgba'));
        gradient.addColorStop(1, this.color.replace(')', ', 0)').replace('rgb', 'rgba'));
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    drawHeart() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.heartSize * 0.05, this.heartSize * 0.05);
        ctx.rotate(Math.PI);
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < Math.PI * 2; i += 0.01) {
            const t = i;
            const px = 16 * Math.pow(Math.sin(t), 3);
            const py = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

// =========== FIREWORK CONTROLS ===========
function createRandomFirework() {
    const x = Math.random() * canvas.width;
    const y = canvas.height;
    const targetY = Math.random() * canvas.height * 0.4 + 100;
    const types = ['normal', 'heart', 'normal', 'normal'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    fireworks.push(new Firework(
        x, y,
        x, targetY,
        null,
        type
    ));
}

function triggerMidnightFireworks() {
    if (megaShowActive) return;
    
    megaShowActive = true;
    showMessage("🎆 MIDNIGHT FIREWORKS SHOW! 🎇");
    
    // Big explosion in center
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const x = canvas.width / 2 + (Math.random() - 0.5) * 300;
            const y = canvas.height / 2 + (Math.random() - 0.5) * 200;
            fireworks.push(new Firework(
                canvas.width / 2, canvas.height,
                x, y,
                '#FFD700',
                Math.random() > 0.7 ? 'heart' : 'normal',
                5
            ));
        }, i * 150);
    }
    
    // Surrounding fireworks
    setTimeout(() => {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                createRandomFirework();
            }, i * 80);
        }
    }, 1000);
    
    // End mega show after 8 seconds
    setTimeout(() => {
        megaShowActive = false;
    }, 8000);
}

function triggerCountdownFireworks(secondsLeft) {
    if (secondsLeft > 10 || secondsLeft <= 0) return;
    
    // Display countdown number
    displayCountdownNumber(secondsLeft);
    
    // Create countdown fireworks
    const x = canvas.width / 2;
    const y = canvas.height / 3;
    
    fireworks.push(new Firework(
        x, canvas.height,
        x, y,
        secondsLeft <= 3 ? '#FF0000' : '#FFFF00',
        'normal',
        4
    ));
    
    // Play countdown sound
    if (soundEnabled && secondsLeft <= 10) {
        playCountdownSound();
    }
}

function displayCountdownNumber(number) {
    ctx.save();
    ctx.font = 'bold 200px Montserrat';
    ctx.fillStyle = `rgba(255, 215, 0, ${0.3 + (10 - number) * 0.07})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#FFD700';
    ctx.fillText(number, canvas.width / 2, canvas.height / 2);
    ctx.restore();
}

// =========== SOUND FUNCTIONS ===========
function playExplosionSound() {
    try {
        explosionSound.currentTime = 0;
        explosionSound.volume = 0.3;
        explosionSound.play().catch(e => console.log("Audio play failed:", e));
    } catch (e) {
        console.log("Explosion sound error:", e);
    }
}

function playLaunchSound() {
    try {
        fireworkLaunchSound.currentTime = 0;
        fireworkLaunchSound.volume = 0.2;
        fireworkLaunchSound.play().catch(e => console.log("Audio play failed:", e));
    } catch (e) {
        console.log("Launch sound error:", e);
    }
}

function playCountdownSound() {
    try {
        countdownSound.currentTime = 0;
        countdownSound.volume = 0.4;
        countdownSound.play().catch(e => console.log("Audio play failed:", e));
    } catch (e) {
        console.log("Countdown sound error:", e);
    }
}

// =========== ANIMATION LOOP ===========
function animate() {
    // Clear with fade effect
    ctx.fillStyle = `rgba(0, 4, 40, 0.1)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw fireworks
    fireworks.forEach((fw, index) => {
        fw.update();
        fw.draw();
        
        if (fw.exploded) {
            fireworks.splice(index, 1);
        }
    });
    
    // Update and draw particles
    particles = particles.filter(p => p.update());
    particles.forEach(p => p.draw());
    
    // Update stats
    document.getElementById('activeFireworks').textContent = fireworks.length;
    document.getElementById('particleCount').textContent = particles.length;
    
    animationId = requestAnimationFrame(animate);
}

// =========== UTILITY FUNCTIONS ===========
function showMessage(text) {
    // Create message element if it doesn't exist
    let messageEl = document.getElementById('flashMessage');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.id = 'flashMessage';
        messageEl.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: #FFD700;
            padding: 20px 40px;
            border-radius: 20px;
            font-size: 1.5rem;
            z-index: 1000;
            text-align: center;
            border: 2px solid #FFD700;
            box-shadow: 0 0 30px rgba(255,215,0,0.5);
            animation: fadeInOut 2s ease-in-out;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                30% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                70% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(messageEl);
    }
    
    messageEl.textContent = text;
    messageEl.style.display = 'block';
    messageEl.style.animation = 'none';
    setTimeout(() => {
        messageEl.style.animation = 'fadeInOut 2s ease-in-out';
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 2000);
    }, 10);
}

// =========== PERSONAL MESSAGES ===========
function setupPersonalMessages() {
    const createBtn = document.getElementById('createGreeting');
    const shareBtn = document.getElementById('shareGreeting');
    const display = document.getElementById('greetingDisplay');
    const greetingText = document.getElementById('greetingText');
    const senderDisplay = document.getElementById('displaySender');
    
    createBtn.addEventListener('click', () => {
        const sender = document.getElementById('senderName').value.trim() || 'A Friend';
        const recipient = document.getElementById('recipientName').value.trim() || 'You';
        
        const greetings = [
            `Happy New Year 2026, ${recipient}! 🎉 May this year bring you endless joy and success!`,
            `Wishing ${recipient} a spectacular 2026! ✨ May all your dreams take flight!`,
            `To ${recipient}, may 2026 be your best year yet! Full of love, laughter, and prosperity! 🌟`,
            `New Year, New Beginnings! ${recipient}, may 2026 shower you with blessings! 🎊`,
            `Cheers to 2026, ${recipient}! 🥂 May every moment be as bright as these fireworks!`
        ];
        
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        
        greetingText.textContent = randomGreeting;
        senderDisplay.textContent = sender;
        display.style.display = 'block';
        
        // Trigger celebration fireworks
        for (let i = 0; i < 5; i++) {
            setTimeout(() => createRandomFirework(), i * 300);
        }
        
        showMessage(`Greeting created for ${recipient}!`);
    });
    
    shareBtn.addEventListener('click', () => {
        const text = `${greetingText.textContent}\n\nFrom: ${senderDisplay.textContent}\n\nShare the celebration: ${window.location.href}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    });
}

// =========== EVENT LISTENERS ===========
function setupEventListeners() {
    console.log("Setting up event listeners...");
    
    // Canvas click for manual fireworks
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        fireworks.push(new Firework(
            x, canvas.height,
            x, y,
            null,
            Math.random() > 0.7 ? 'heart' : 'normal'
        ));
        
        showMessage("🎇 Firework launched!");
    });
    
    // Control buttons
    const megaShowBtn = document.getElementById('megaShow');
    const autoToggleBtn = document.getElementById('autoToggle');
    const midnightModeBtn = document.getElementById('midnightMode');
    const changeThemeBtn = document.getElementById('changeTheme');
    const toggleSoundBtn = document.getElementById('toggleSound');
    
    // Mega Show button
    megaShowBtn.addEventListener('click', () => {
        triggerMidnightFireworks();
        showMessage("💥 MEGA FIREWORKS SHOW ACTIVATED!");
    });
    
    // Auto Fireworks toggle
    autoToggleBtn.addEventListener('click', function() {
        autoFireworks = !autoFireworks;
        this.classList.toggle('active');
        this.innerHTML = autoFireworks ? 
            '<i class="fas fa-pause"></i> Auto ON' : 
            '<i class="fas fa-play"></i> Auto OFF';
        showMessage(autoFireworks ? "Auto fireworks: ON" : "Auto fireworks: OFF");
    });
    
    // Midnight Mode toggle
    midnightModeBtn.addEventListener('click', function() {
        midnightMode = !midnightMode;
        this.classList.toggle('active');
        this.innerHTML = midnightMode ? 
            '<i class="fas fa-moon"></i> Midnight ON' : 
            '<i class="fas fa-clock"></i> Midnight OFF';
        showMessage(midnightMode ? "Midnight mode: ACTIVE" : "Midnight mode: OFF");
    });
    
    // Change Theme button
    changeThemeBtn.addEventListener('click', function() {
        currentTheme = (currentTheme + 1) % themes.length;
        updateTheme();
        this.innerHTML = `<i class="fas fa-palette"></i> ${themes[currentTheme].name}`;
    });
    
    // Toggle Sound button
    toggleSoundBtn.addEventListener('click', function() {
        soundEnabled = !soundEnabled;
        this.classList.toggle('active');
        this.innerHTML = soundEnabled ? 
            '<i class="fas fa-volume-up"></i> Sound ON' : 
            '<i class="fas fa-volume-mute"></i> Sound OFF';
        showMessage(soundEnabled ? "Sound: ON" : "Sound: OFF");
    });
    
    // Share buttons
    document.getElementById('sharePage').addEventListener('click', () => {
        const text = `🎆 Join me in celebrating New Year 2026 with this amazing fireworks show! ${window.location.href}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    });
    
    document.getElementById('captureMoment').addEventListener('click', () => {
        // Create a temporary canvas to capture current frame
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Draw background
        const theme = themes[currentTheme];
        if (theme.bg.length === 2) {
            tempCtx.fillStyle = `linear-gradient(135deg, ${theme.bg[0]} 0%, ${theme.bg[1]} 100%)`;
        } else {
            tempCtx.fillStyle = `linear-gradient(135deg, ${theme.bg[0]} 0%, ${theme.bg[1]} 50%, ${theme.bg[2]} 100%)`;
        }
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Draw current fireworks
        tempCtx.drawImage(canvas, 0, 0);
        
        // Add text
        tempCtx.font = 'bold 40px Montserrat';
        tempCtx.fillStyle = '#FFD700';
        tempCtx.textAlign = 'center';
        tempCtx.shadowBlur = 10;
        tempCtx.shadowColor = 'black';
        tempCtx.fillText('Happy New Year 2026!', tempCanvas.width/2, 50);
        
        // Convert to image and download
        const link = document.createElement('a');
        link.download = `new-year-fireworks-${Date.now()}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
        
        showMessage("📸 Moment captured and downloaded!");
    });
    
    // Window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createStarBackground();
    });
    
    // Setup personal messages
    setupPersonalMessages();
    
    // Prevent context menu on canvas
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    console.log("Event listeners setup complete!");
}

// =========== START EVERYTHING ===========
window.addEventListener('load', init);
