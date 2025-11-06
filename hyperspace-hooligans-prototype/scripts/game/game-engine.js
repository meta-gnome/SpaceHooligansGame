class GameEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.backgroundCanvas = null;
        this.bgCtx = null;
        this.gameState = 'loading';
        this.currentRealm = 'mechanical-interior';
        this.characters = new Map();
        this.assets = new Map();
        this.isInitialized = false;
        
        // Game systems
        this.dialogueSystem = null;
        this.uiManager = null;
        this.particleSystem = null;
        this.characterManager = null;
        
        // Animation and timing
        this.lastFrameTime = 0;
        this.animationId = null;
        
        // Realm backgrounds
        this.realmBackgrounds = {
            'mechanical-interior': 'assets/images/mechanical-interior.jpg',
            'organic-biomech': 'assets/images/organic-biomech.jpg',
            'flowing-energy': 'assets/images/flowing-energy.jpg',
            'cyberpunk-city': 'assets/images/cyberpunk-city.jpg',
            'industrial-cosmic': 'assets/images/industrial-cosmic.jpg'
        };
        
        this.init();
    }
    
    async init() {
        try {
            this.canvas = document.getElementById('game-canvas');
            this.ctx = this.canvas.getContext('2d');
            this.backgroundCanvas = document.getElementById('cosmic-background');
            this.bgCtx = this.backgroundCanvas.getContext('2d');
            
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
            
            // Initialize game systems
            this.characterManager = new CharacterManager(this);
            this.dialogueSystem = new DialogueSystem(this);
            this.uiManager = new UIManager(this);
            this.particleSystem = new ParticleSystem();
            
            // Load assets
            await this.loadAssets();
            
            // Setup character positions
            this.setupCharacters();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start game loop
            this.gameLoop();
            
            // Initialize UI
            this.uiManager.init();
            
            this.isInitialized = true;
            this.gameState = 'running';
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            console.log('HyperSpace Hooligans Game Engine Initialized');
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
        }
    }
    
    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.backgroundCanvas.width = rect.width * dpr;
        this.backgroundCanvas.height = rect.height * dpr;
        this.bgCtx.scale(dpr, dpr);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.backgroundCanvas.style.width = rect.width + 'px';
        this.backgroundCanvas.style.height = rect.height + 'px';
    }
    
    async loadAssets() {
        const assetPromises = [];
        
        // Load character images
        assetPromises.push(this.loadImage('bunny-ears', 'assets/characters/bunny-ears.jpg'));
        assetPromises.push(this.loadImage('dmt-trickster', 'assets/characters/dmt-trickster.jpg'));
        
        // Load realm backgrounds
        for (const [realm, path] of Object.entries(this.realmBackgrounds)) {
            assetPromises.push(this.loadImage(`bg-${realm}`, path));
        }
        
        await Promise.all(assetPromises);
    }
    
    loadImage(name, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.assets.set(name, img);
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to load ${src}`));
            img.src = src;
        });
    }
    
    setupCharacters() {
        // Bunny Ears (player character)
        this.characters.set('bunny-ears', {
            name: 'Bunny Ears',
            type: 'player',
            x: 150,
            y: 300,
            width: 80,
            height: 100,
            image: this.assets.get('bunny-ears'),
            interactive: false,
            dialogue: null,
            animations: {
                idle: true,
                glow: 0,
                pulse: 0
            }
        });
        
        // DMT Trickster NPC
        this.characters.set('dmt-trickster', {
            name: 'DMT Trickster',
            type: 'npc',
            x: 400,
            y: 250,
            width: 100,
            height: 120,
            image: this.assets.get('dmt-trickster'),
            interactive: true,
            dialogue: 'initial-intro',
            animations: {
                idle: true,
                glow: 0,
                pulse: 0,
                hover: false
            }
        });
    }
    
    setupEventListeners() {
        // Canvas click events
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    handleClick(event) {
        if (!this.isInitialized || this.gameState !== 'running') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Check for character interactions
        for (const [id, character] of this.characters) {
            if (this.isPointInCharacter(x, y, character)) {
                this.interactWithCharacter(character);
                return;
            }
        }
        
        // Background click for realm navigation (if needed)
        this.handleBackgroundClick(x, y);
    }
    
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Update hover states for interactive elements through character manager
        this.characterManager.updateHoverStates(x, y, this);
        
        // Update cursor
        this.updateCursor(x, y);
    }
    
    updateCursor(x, y) {
        let hoverFound = false;
        
        for (const [id, character] of this.characters) {
            if (character.interactive && this.isPointInCharacter(x, y, character)) {
                hoverFound = true;
                break;
            }
        }
        
        this.canvas.style.cursor = hoverFound ? 'pointer' : 'crosshair';
    }
    
    handleKeyDown(event) {
        if (this.dialogueSystem.isActive) {
            // Dialogue shortcuts
            if (event.key === ' ' || event.key === 'Enter') {
                this.dialogueSystem.nextLine();
                event.preventDefault();
            }
            return;
        }
        
        switch (event.key) {
            case 'Escape':
                // Toggle settings or pause
                break;
            case 'h':
            case 'H':
                // Toggle hints
                this.uiManager.toggleHints();
                break;
            case 'r':
            case 'R':
                // Restart
                this.restartGame();
                break;
        }
    }
    
    isPointInCharacter(x, y, character) {
        return x >= character.x && x <= character.x + character.width &&
               y >= character.y && y <= character.y + character.height;
    }
    
    interactWithCharacter(character) {
        if (character.dialogue) {
            this.dialogueSystem.startDialogue(character.dialogue, character.name);
        }
        
        // Play interaction sound
        this.playSound('interaction');
        
        // Visual feedback
        character.animations.glow = 1;
    }
    
    handleBackgroundClick(x, y) {
        // Could implement background interactions or realm navigation
    }
    
    playSound(soundName) {
        // Placeholder for sound system
        // Would integrate with actual audio files
        console.log(`Playing sound: ${soundName}`);
    }
    
    changeRealm(newRealm) {
        if (this.realmBackgrounds[newRealm] && newRealm !== this.currentRealm) {
            this.currentRealm = newRealm;
            this.drawBackground();
            this.uiManager.updateRealmDisplay(newRealm);
            
            // Trigger transition dialogue if applicable
            this.dialogueSystem.startDialogue(`realm-${newRealm}`, 'DMT Trickster');
        }
    }
    
    drawBackground() {
        const bgImage = this.assets.get(`bg-${this.currentRealm}`);
        if (!bgImage) return;
        
        const canvas = this.backgroundCanvas;
        const ctx = this.bgCtx;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background image
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        
        // Add cosmic overlay
        this.drawCosmicOverlay(ctx, canvas.width, canvas.height);
    }
    
    drawCosmicOverlay(ctx, width, height) {
        // Add cosmic glow effect
        const gradient = ctx.createRadialGradient(
            width / 2, height / 2, 0,
            width / 2, height / 2, Math.max(width, height) / 2
        );
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.1)');
        gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.05)');
        gradient.addColorStop(1, 'rgba(236, 72, 153, 0.02)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add starfield
        this.drawStarfield(ctx, width, height);
    }
    
    drawStarfield(ctx, width, height) {
        const starCount = 50;
        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2 + 0.5;
            const alpha = Math.random() * 0.8 + 0.2;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(x, y, size, size);
        }
    }
    

    
    gameLoop(currentTime = 0) {
        const deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;
        
        if (this.gameState === 'running') {
            // Update systems
            this.characterManager.updateCharacters(deltaTime);
            this.particleSystem.update(deltaTime);
            
            // Draw frame
            this.clearCanvas();
            this.drawBackground();
            this.characterManager.drawCharacters(this.ctx);
            this.particleSystem.draw(this.ctx);
        }
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const gameContainer = document.getElementById('game-container');
        
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            gameContainer.classList.remove('hidden');
            this.createLoadingParticles();
        }, 1000);
    }
    
    createLoadingParticles() {
        const particlesContainer = document.getElementById('loading-particles');
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
                particlesContainer.appendChild(particle);
                
                // Remove particle after animation
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 10000);
            }, i * 200);
        }
    }
    
    restartGame() {
        // Reset game state
        this.currentRealm = 'mechanical-interior';
        this.characterManager.reset();
        this.dialogueSystem.reset();
        this.uiManager.reset();
        
        // Redraw background
        this.drawBackground();
        
        console.log('Game restarted');
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        window.removeEventListener('resize', this.resizeCanvas);
        
        console.log('Game engine destroyed');
    }
}