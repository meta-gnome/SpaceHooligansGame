class ParticleSystem {
    constructor() {
        this.particles = [];
        this.scanParticles = [];
        this.enabled = true;
        this.scanActive = false;
        this.maxParticles = 200;
        
        // Particle types and their properties
        this.particleTypes = {
            cosmic: {
                color: 'rgba(139, 92, 246, ',
                size: [1, 3],
                speed: [0.5, 2],
                lifespan: [3, 8],
                drift: true
            },
            energy: {
                color: 'rgba(6, 182, 212, ',
                size: [1, 2],
                speed: [1, 3],
                lifespan: [2, 5],
                drift: true
            },
            mystical: {
                color: 'rgba(236, 72, 153, ',
                size: [2, 4],
                speed: [0.3, 1.5],
                lifespan: [4, 10],
                drift: true
            },
            star: {
                color: 'rgba(255, 255, 255, ',
                size: [0.5, 1.5],
                speed: [0.1, 0.8],
                lifespan: [5, 15],
                drift: false
            }
        };
        
        this.init();
    }
    
    init() {
        // Create initial cosmic particles
        this.createCosmicBackground();
        
        console.log('Particle System initialized');
    }
    
    createCosmicBackground() {
        // Create stars
        for (let i = 0; i < 50; i++) {
            this.createParticle('star', Math.random() * window.innerWidth, Math.random() * window.innerHeight);
        }
        
        // Create some ambient particles
        for (let i = 0; i < 30; i++) {
            const types = ['cosmic', 'energy', 'mystical'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.createParticle(type, Math.random() * window.innerWidth, Math.random() * window.innerHeight);
        }
    }
    
    createParticle(type, x, y, options = {}) {
        if (!this.enabled || this.particles.length >= this.maxParticles) return null;
        
        const particleConfig = this.particleTypes[type];
        if (!particleConfig) return null;
        
        const particle = {
            id: Date.now() + Math.random(),
            type,
            x,
            y,
            vx: (Math.random() - 0.5) * particleConfig.speed[1],
            vy: (Math.random() - 0.5) * particleConfig.speed[1],
            size: particleConfig.size[0] + Math.random() * (particleConfig.size[1] - particleConfig.size[0]),
            opacity: 0,
            maxOpacity: 0.8,
            lifespan: particleConfig.lifespan[0] + Math.random() * (particleConfig.lifespan[1] - particleConfig.lifespan[0]),
            age: 0,
            drift: particleConfig.drift,
            ...options
        };
        
        this.particles.push(particle);
        return particle;
    }
    
    update(deltaTime) {
        if (!this.enabled) return;
        
        // Update main particles
        this.updateParticles(deltaTime);
        
        // Update scan particles
        if (this.scanActive) {
            this.updateScanParticles(deltaTime);
        }
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update age
            particle.age += deltaTime;
            
            // Update opacity based on age
            const lifeProgress = particle.age / particle.lifespan;
            if (lifeProgress < 0.1) {
                // Fade in
                particle.opacity = particle.maxOpacity * (lifeProgress / 0.1);
            } else if (lifeProgress > 0.9) {
                // Fade out
                particle.opacity = particle.maxOpacity * ((1 - lifeProgress) / 0.1);
            } else {
                // Full opacity
                particle.opacity = particle.maxOpacity;
            }
            
            // Update position
            particle.x += particle.vx * deltaTime * 60;
            particle.y += particle.vy * deltaTime * 60;
            
            // Add drift effect
            if (particle.drift) {
                particle.vx += (Math.random() - 0.5) * 0.01;
                particle.vy += (Math.random() - 0.5) * 0.01;
            }
            
            // Remove dead particles
            if (particle.age >= particle.lifespan) {
                this.particles.splice(i, 1);
            }
        }
        
        // Maintain background particle count
        this.maintainBackgroundParticles();
    }
    
    updateScanParticles(deltaTime) {
        for (let i = this.scanParticles.length - 1; i >= 0; i--) {
            const particle = this.scanParticles[i];
            
            // Update age
            particle.age += deltaTime;
            
            // Update opacity
            const lifeProgress = particle.age / particle.lifespan;
            particle.opacity = particle.maxOpacity * (1 - lifeProgress);
            
            // Update position
            particle.x += particle.vx * deltaTime * 60;
            particle.y += particle.vy * deltaTime * 60;
            
            // Remove dead particles
            if (particle.age >= particle.lifespan) {
                this.scanParticles.splice(i, 1);
            }
        }
        
        // Create new scan particles
        this.createScanParticles();
    }
    
    createScanParticles() {
        if (this.scanParticles.length < 20) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 100 + 50;
            
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            this.createScanParticle(x, y);
        }
    }
    
    createScanParticle(x, y) {
        const particle = {
            id: Date.now() + Math.random(),
            x,
            y,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: 1 + Math.random() * 2,
            opacity: 0.8,
            maxOpacity: 0.8,
            lifespan: 2 + Math.random() * 1,
            age: 0,
            color: `rgba(6, 182, 212, `
        };
        
        this.scanParticles.push(particle);
    }
    
    maintainBackgroundParticles() {
        const targetCount = 80;
        const currentCount = this.particles.filter(p => p.type !== 'star').length;
        
        if (currentCount < targetCount) {
            const types = ['cosmic', 'energy', 'mystical'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.createParticle(type, Math.random() * window.innerWidth, -10);
        }
    }
    
    draw(ctx) {
        if (!this.enabled) return;
        
        // Draw scan particles first (behind)
        this.drawScanParticles(ctx);
        
        // Draw main particles
        this.drawParticles(ctx);
    }
    
    drawParticles(ctx) {
        for (const particle of this.particles) {
            const particleConfig = this.particleTypes[particle.type];
            if (!particleConfig) continue;
            
            ctx.save();
            ctx.globalAlpha = particle.opacity;
            
            // Create gradient for larger particles
            if (particle.size > 2) {
                const gradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size
                );
                gradient.addColorStop(0, particleConfig.color + particle.opacity + ')');
                gradient.addColorStop(1, particleConfig.color + '0)');
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = particleConfig.color + particle.opacity + ')';
            }
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add glow effect for energy particles
            if (particle.type === 'energy' || particle.type === 'mystical') {
                ctx.shadowBlur = 5;
                ctx.shadowColor = particleConfig.color + '0.5)';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }
    
    drawScanParticles(ctx) {
        for (const particle of this.scanParticles) {
            ctx.save();
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particle.color + particle.opacity + ')';
            
            ctx.shadowBlur = 3;
            ctx.shadowColor = particle.color + '0.5)';
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    startScanEffect() {
        this.scanActive = true;
        
        // Create burst of scan particles
        for (let i = 0; i < 15; i++) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const angle = (i / 15) * Math.PI * 2;
            const distance = 50 + Math.random() * 100;
            
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            this.createScanParticle(x, y);
        }
    }
    
    stopScanEffect() {
        this.scanActive = false;
    }
    
    createExplosion(x, y, type = 'mystical', count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
            const speed = 50 + Math.random() * 100;
            const distance = 20 + Math.random() * 40;
            
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            this.createParticle(type, particleX, particleY, {
                vx: Math.cos(angle) * speed / 60,
                vy: Math.sin(angle) * speed / 60,
                lifespan: 1 + Math.random() * 2
            });
        }
    }
    
    createTrail(x, y, type = 'energy') {
        this.createParticle(type, x, y, {
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            lifespan: 1 + Math.random() * 0.5,
            size: 1 + Math.random() * 1
        });
    }
    
    createRealmTransition(fromRealm, toRealm) {
        // Create transition particles
        const types = ['cosmic', 'energy', 'mystical'];
        
        for (let i = 0; i < 50; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            
            this.createParticle(type, x, y, {
                lifespan: 2 + Math.random() * 3,
                vx: (Math.random() - 0.5) * 100,
                vy: (Math.random() - 0.5) * 100
            });
        }
        
        // Create specific transition effects
        this.createExplosion(window.innerWidth / 2, window.innerHeight / 2, 'mystical', 20);
    }
    
    clearParticles() {
        this.particles = [];
        this.scanParticles = [];
    }
    
    toggle() {
        this.enabled = !this.enabled;
        console.log('Particle system', this.enabled ? 'enabled' : 'disabled');
    }
    
    setMaxParticles(max) {
        this.maxParticles = max;
    }
    
    getParticleCount() {
        return this.particles.length + this.scanParticles.length;
    }
    
    // Performance optimization: reduce particle count on low-end devices
    optimizeForPerformance() {
        this.maxParticles = 100;
        
        // Remove some existing particles
        if (this.particles.length > 50) {
            this.particles = this.particles.slice(0, 50);
        }
    }
    
    // High performance mode for mobile
    mobileOptimize() {
        this.maxParticles = 50;
        
        // Clear and recreate with fewer particles
        this.clearParticles();
        this.createCosmicBackground();
        
        console.log('Particle system optimized for mobile');
    }
    
    reset() {
        this.clearParticles();
        this.scanActive = false;
        this.createCosmicBackground();
        
        console.log('Particle system reset');
    }
    
    // Debug function
    getDebugInfo() {
        return {
            enabled: this.enabled,
            totalParticles: this.getParticleCount(),
            mainParticles: this.particles.length,
            scanParticles: this.scanParticles.length,
            maxParticles: this.maxParticles,
            scanActive: this.scanActive
        };
    }
}