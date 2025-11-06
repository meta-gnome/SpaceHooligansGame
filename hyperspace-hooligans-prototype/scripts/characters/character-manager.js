class CharacterManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.characters = new Map();
        this.animations = new Map();
        this.interactionStates = new Map();
        
        this.init();
    }
    
    init() {
        this.setupCharacters();
        this.setupAnimations();
        
        // Setup image loading callback
        this.waitForAssets();
        
        console.log('Character Manager initialized');
    }
    
    async waitForAssets() {
        // Wait for game engine assets to be loaded
        const checkAssets = setInterval(() => {
            if (this.gameEngine.assets && this.gameEngine.assets.size > 0) {
                this.loadCharacterImages();
                clearInterval(checkAssets);
            }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(checkAssets);
            if (!this.allImagesLoaded()) {
                console.warn('Some character images failed to load, using fallbacks');
            }
        }, 5000);
    }
    
    loadCharacterImages() {
        const bunnyEarsImg = this.gameEngine.assets.get('bunny-ears');
        const dmtTricksterImg = this.gameEngine.assets.get('dmt-trickster');
        
        const bunnyEars = this.characters.get('bunny-ears');
        const dmtTrickster = this.characters.get('dmt-trickster');
        
        if (bunnyEarsImg && bunnyEars) {
            bunnyEars.image = bunnyEarsImg;
            bunnyEars.imageLoaded = true;
        }
        
        if (dmtTricksterImg && dmtTrickster) {
            dmtTrickster.image = dmtTricksterImg;
            dmtTrickster.imageLoaded = true;
        }
        
        console.log('Character images loaded:', {
            bunnyEars: !!bunnyEarsImg,
            dmtTrickster: !!dmtTricksterImg
        });
    }
    
    allImagesLoaded() {
        for (const character of this.characters.values()) {
            if (character.type === 'player' || character.type === 'npc') {
                if (!character.imageLoaded) return false;
            }
        }
        return true;
    }
    
    setupCharacters() {
        // Bunny Ears (player character)
        this.characters.set('bunny-ears', {
            id: 'bunny-ears',
            name: 'Bunny Ears',
            type: 'player',
            x: 150,
            y: 300,
            width: 80,
            height: 100,
            image: null, // Will be set after assets are loaded
            imageLoaded: false,
            interactive: false,
            dialogue: null,
            animations: {
                idle: true,
                glow: 0,
                pulse: 0,
                breathing: 0,
                bounce: 0
            },
            stats: {
                stability: 100,
                energy: 100,
                perception: 50
            }
        });
        
        // DMT Trickster NPC
        this.characters.set('dmt-trickster', {
            id: 'dmt-trickster',
            name: 'DMT Trickster',
            type: 'npc',
            x: 450,
            y: 250,
            width: 100,
            height: 120,
            image: null, // Will be set after assets are loaded
            imageLoaded: false,
            interactive: true,
            dialogue: 'initial-intro',
            animations: {
                idle: true,
                glow: 0,
                pulse: 0,
                hover: false,
                floating: 0,
                mystical: 0
            },
            dialogueTrees: {
                'initial-intro': 'trickster-intro',
                'realm-guidance': 'realm-specific-dialogue',
                'abilities': 'perception-guidance',
                'mysticism': 'cosmic-wisdom'
            },
            currentDialogue: null
        });
    }
    
    setupAnimations() {
        // Setup idle animations for all characters
        for (const [id, character] of this.characters) {
            this.animations.set(id, {
                startTime: Date.now(),
                duration: 2000 + Math.random() * 3000,
                type: 'idle'
            });
        }
    }
    
    updateCharacters(deltaTime) {
        for (const [id, character] of this.characters) {
            this.updateCharacterAnimations(character, deltaTime);
            this.updateCharacterStats(character, deltaTime);
        }
    }
    
    updateCharacterAnimations(character, deltaTime) {
        // Update animation states
        this.updateIdleAnimation(character);
        this.updateGlowAnimation(character, deltaTime);
        this.updatePulseAnimation(character, deltaTime);
        this.updateSpecialAnimations(character, deltaTime);
    }
    
    updateIdleAnimation(character) {
        if (character.animations.idle) {
            const time = Date.now() * 0.002;
            
            // Gentle floating motion
            character.y += Math.sin(time) * 0.2;
            
            // Breathing effect for organic characters
            if (character.type === 'player') {
                character.animations.breathing = Math.sin(time * 1.5) * 0.05;
            }
            
            // Mystical floating for NPCs
            if (character.type === 'npc' && character.name === 'DMT Trickster') {
                character.animations.floating = Math.sin(time * 0.8) * 0.3;
            }
        }
    }
    
    updateGlowAnimation(character, deltaTime) {
        if (character.animations.glow > 0) {
            character.animations.glow = Math.max(0, character.animations.glow - deltaTime * 2);
            
            // Decay glow effect
            if (character.animations.glow <= 0) {
                character.animations.glow = 0;
            }
        }
    }
    
    updatePulseAnimation(character, deltaTime) {
        if (character.animations.pulse > 0) {
            character.animations.pulse = Math.max(0, character.animations.pulse - deltaTime * 1.5);
        }
    }
    
    updateSpecialAnimations(character, deltaTime) {
        if (character.name === 'DMT Trickster') {
            // Mystical energy effects
            character.animations.mystical += deltaTime * 2;
            
            // Hover state effects
            if (character.animations.hover) {
                character.animations.pulse = Math.min(1, character.animations.pulse + deltaTime * 3);
            }
        }
        
        if (character.type === 'player') {
            // Player-specific animation updates
            this.updatePlayerAnimations(character, deltaTime);
        }
    }
    
    updatePlayerAnimations(character, deltaTime) {
        // Update brain stability effects
        if (character.stats.stability < 50) {
            // Unstable state - add visual indicators
            character.animations.glow = Math.max(character.animations.glow, 0.3);
        }
        
        // Perception filter effects
        const uiManager = this.gameEngine.uiManager;
        if (uiManager.overlayStates.spectral || uiManager.overlayStates.emotional || uiManager.overlayStates.temporal) {
            // Enhanced mystical effects when using perception filters
            character.animations.mystical += deltaTime * 1.5;
        }
    }
    
    updateCharacterStats(character, deltaTime) {
        // Passive stat regeneration/drain
        if (character.type === 'player') {
            // Natural stability regeneration when not actively using abilities
            if (!this.gameEngine.uiManager.scanBtn.classList.contains('scanning')) {
                character.stats.stability = Math.min(100, character.stats.stability + deltaTime * 5);
            }
        }
    }
    
    drawCharacters(ctx) {
        for (const [id, character] of this.characters) {
            this.drawCharacter(ctx, character);
        }
    }
    
    drawCharacter(ctx, character) {
        ctx.save();
        
        // Apply transformations based on animations
        this.applyCharacterTransforms(ctx, character);
        
        // Draw character base
        this.drawCharacterBase(ctx, character);
        
        // Draw character effects
        this.drawCharacterEffects(ctx, character);
        
        // Draw interaction indicators
        if (character.interactive && character.animations.hover) {
            this.drawInteractionIndicator(ctx, character);
        }
        
        ctx.restore();
    }
    
    applyCharacterTransforms(ctx, character) {
        const centerX = character.x + character.width / 2;
        const centerY = character.y + character.height / 2;
        
        ctx.translate(centerX, centerY);
        
        // Breathing effect
        if (character.animations.breathing) {
            const breathingScale = 1 + character.animations.breathing;
            ctx.scale(breathingScale, breathingScale);
        }
        
        // Pulse effect
        if (character.animations.pulse > 0) {
            const pulseScale = 1 + 0.03 * Math.sin(Date.now() * 0.01) * character.animations.pulse;
            ctx.scale(pulseScale, pulseScale);
        }
        
        // Floating effect
        if (character.animations.floating) {
            ctx.translate(0, character.animations.floating);
        }
        
        ctx.translate(-centerX, -centerY);
    }
    
    drawCharacterBase(ctx, character) {
        // Check if image is loaded and valid
        if (!character.image || !character.imageLoaded || !(character.image instanceof HTMLImageElement)) {
            // Draw placeholder rectangle
            this.drawCharacterPlaceholder(ctx, character);
            return;
        }
        
        // Draw the character image with glow
        if (character.animations.glow > 0) {
            const glowIntensity = character.animations.glow;
            const glowColor = character.type === 'player' ? '#10B981' : '#8B5CF6';
            const glowSize = 10 + glowIntensity * 20;
            
            // Multiple glow passes for stronger effect
            for (let i = 0; i < 3; i++) {
                ctx.save();
                ctx.globalAlpha = (3 - i) * 0.1 * glowIntensity;
                ctx.shadowBlur = glowSize * (i + 1);
                ctx.shadowColor = glowColor;
                ctx.drawImage(
                    character.image,
                    character.x - i * 2,
                    character.y - i * 2,
                    character.width + i * 4,
                    character.height + i * 4
                );
                ctx.restore();
            }
        }
        
        // Draw main character image
        ctx.drawImage(
            character.image,
            character.x,
            character.y,
            character.width,
            character.height
        );
    }
    
    drawCharacterPlaceholder(ctx, character) {
        // Draw a placeholder rectangle with character info
        ctx.save();
        
        // Background
        const gradient = ctx.createLinearGradient(
            character.x, character.y,
            character.x + character.width, character.y + character.height
        );
        
        if (character.type === 'player') {
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.1)');
        } else {
            gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0.1)');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(character.x, character.y, character.width, character.height);
        
        // Border
        ctx.strokeStyle = character.type === 'player' ? '#10B981' : '#8B5CF6';
        ctx.lineWidth = 2;
        ctx.strokeRect(character.x, character.y, character.width, character.height);
        
        // Center symbol
        ctx.fillStyle = character.type === 'player' ? '#10B981' : '#8B5CF6';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
            character.type === 'player' ? 'BUNNY' : 'TRICK',
            character.x + character.width / 2,
            character.y + character.height / 2
        );
        
        ctx.restore();
    }
    
    drawCharacterEffects(ctx, character) {
        // DMT Trickster specific effects
        if (character.name === 'DMT Trickster') {
            this.drawTricksterEffects(ctx, character);
        }
        
        // Player character specific effects
        if (character.type === 'player') {
            this.drawPlayerEffects(ctx, character);
        }
    }
    
    drawTricksterEffects(ctx, character) {
        // Mystical energy aura
        const auraRadius = 60 + Math.sin(Date.now() * 0.005) * 10;
        const centerX = character.x + character.width / 2;
        const centerY = character.y + character.height / 2;
        
        // Outer mystical aura
        const auraGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, auraRadius
        );
        auraGradient.addColorStop(0, 'rgba(139, 92, 246, 0.1)');
        auraGradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.05)');
        auraGradient.addColorStop(1, 'rgba(236, 72, 153, 0.02)');
        
        ctx.fillStyle = auraGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, auraRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Mystical particles
        this.drawMysticalParticles(ctx, character);
    }
    
    drawPlayerEffects(ctx, character) {
        // Brain stability visual indicator
        const stability = character.stats.stability;
        if (stability < 70) {
            const centerX = character.x + character.width / 2;
            const centerY = character.y + character.height / 2;
            
            // Stability warning aura
            ctx.strokeStyle = stability < 30 ? '#EF4444' : '#F59E0B';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.6;
            
            const pulseRadius = 40 + Math.sin(Date.now() * 0.008) * 5;
            ctx.beginPath();
            ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.globalAlpha = 1;
        }
    }
    
    drawMysticalParticles(ctx, character) {
        const centerX = character.x + character.width / 2;
        const centerY = character.y + character.height / 2;
        const particleCount = 5;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Date.now() * 0.001 + i * (Math.PI * 2 / particleCount)) % (Math.PI * 2);
            const distance = 40 + Math.sin(Date.now() * 0.003 + i) * 10;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            ctx.fillStyle = `hsla(${240 + i * 30}, 70%, 60%, 0.6)`;
            ctx.beginPath();
            ctx.arc(x, y, 3 + Math.sin(Date.now() * 0.005 + i) * 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawInteractionIndicator(ctx, character) {
        const centerX = character.x + character.width / 2;
        const centerY = character.y - 25;
        
        // Pulsing interaction ring
        const pulseRadius = 12 + Math.sin(Date.now() * 0.008) * 4;
        
        ctx.strokeStyle = '#06B6D4';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#06B6D4';
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        
        // Interaction arrow
        ctx.fillStyle = '#06B6D4';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - pulseRadius - 8);
        ctx.lineTo(centerX - 4, centerY - pulseRadius - 16);
        ctx.lineTo(centerX + 4, centerY - pulseRadius - 16);
        ctx.closePath();
        ctx.fill();
        
        // Click prompt
        ctx.fillStyle = '#06B6D4';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('Click', centerX, centerY - pulseRadius - 20);
    }
    
    interactWithCharacter(characterId) {
        const character = this.characters.get(characterId);
        if (!character || !character.interactive) return false;
        
        // Trigger interaction effects
        character.animations.glow = 1;
        character.animations.pulse = 1;
        
        // Trigger dialogue if available
        if (character.dialogue) {
            this.gameEngine.dialogueSystem.startDialogue(character.dialogue, character.name);
            return true;
        }
        
        return false;
    }
    
    updateHoverState(characterId, isHovering) {
        const character = this.characters.get(characterId);
        if (character) {
            character.animations.hover = isHovering;
        }
    }
    
    updateHoverStates(x, y, gameEngine) {
        for (const [id, character] of this.characters) {
            const isHovering = gameEngine.isPointInCharacter(x, y, character);
            this.updateHoverState(id, isHovering && character.interactive);
        }
    }
    
    isPointInCharacter(x, y, character) {
        return x >= character.x && x <= character.x + character.width &&
               y >= character.y && y <= character.y + character.height;
    }
    
    getCharacterById(id) {
        return this.characters.get(id);
    }
    
    getAllCharacters() {
        return Array.from(this.characters.values());
    }
    
    updateCharacterPosition(id, x, y) {
        const character = this.characters.get(id);
        if (character) {
            character.x = x;
            character.y = y;
        }
    }
    
    updateCharacterStats(id, stats) {
        const character = this.characters.get(id);
        if (character && character.stats) {
            Object.assign(character.stats, stats);
        }
    }
    
    triggerCharacterEffect(id, effectType, intensity = 1) {
        const character = this.characters.get(id);
        if (character && character.animations) {
            switch (effectType) {
                case 'glow':
                    character.animations.glow = intensity;
                    break;
                case 'pulse':
                    character.animations.pulse = intensity;
                    break;
                case 'mystical':
                    character.animations.mystical = intensity;
                    break;
            }
        }
    }
    
    reset() {
        // Reset all character states
        for (const character of this.characters.values()) {
            // Reset animations
            for (const anim in character.animations) {
                if (typeof character.animations[anim] === 'number') {
                    character.animations[anim] = 0;
                } else if (typeof character.animations[anim] === 'boolean') {
                    character.animations[anim] = anim === 'idle';
                }
            }
            
            // Reset stats
            if (character.stats) {
                character.stats.stability = 100;
                character.stats.energy = 100;
            }
        }
        
        console.log('Character Manager reset');
    }
}