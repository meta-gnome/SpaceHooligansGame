class UIManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.currentOverlay = null;
        this.opacityLevel = 70;
        this.overlayStates = {
            spectral: false,
            emotional: false,
            temporal: false
        };
        
        // UI elements
        this.overlayButtons = {};
        this.opacitySlider = null;
        this.scanBtn = null;
        this.brainStabilityText = null;
        this.frequencyDisplay = null;
        
        // Game control buttons
        this.hintBtn = null;
        this.settingsBtn = null;
        this.restartBtn = null;
        
        this.init();
    }
    
    init() {
        this.setupUIElements();
        this.setupEventListeners();
        this.setupRealmNavigation();
        
        console.log('UI Manager initialized');
    }
    
    setupUIElements() {
        // Overlay buttons
        this.overlayButtons = {
            spectral: document.getElementById('spectral-btn'),
            emotional: document.getElementById('emotional-btn'),
            temporal: document.getElementById('temporal-btn')
        };
        
        this.opacitySlider = document.getElementById('opacity-slider');
        this.scanBtn = document.getElementById('scan-btn');
        this.brainStabilityText = document.getElementById('stability-value');
        this.frequencyDisplay = document.getElementById('current-frequency');
        
        // Control buttons
        this.hintBtn = document.getElementById('hint-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        this.restartBtn = document.getElementById('restart-btn');
    }
    
    setupEventListeners() {
        // Overlay toggle buttons
        for (const [type, button] of Object.entries(this.overlayButtons)) {
            button.addEventListener('click', () => this.toggleOverlay(type));
        }
        
        // Opacity slider
        this.opacitySlider.addEventListener('input', (e) => {
            this.opacityLevel = parseInt(e.target.value);
            this.updateOverlayIntensity();
        });
        
        // Scan button
        this.scanBtn.addEventListener('click', () => this.toggleScan());
        
        // Control buttons
        this.hintBtn.addEventListener('click', () => this.showHints());
        this.settingsBtn.addEventListener('click', () => this.showSettings());
        this.restartBtn.addEventListener('click', () => this.restartGame());
    }
    
    setupRealmNavigation() {
        // Create realm navigation buttons
        const uiPanel = document.getElementById('ui-panel');
        const navigationDiv = document.createElement('div');
        navigationDiv.className = 'realm-navigation';
        navigationDiv.innerHTML = `
            <h3 class="ui-section-title">Realm Navigation</h3>
            <div class="realm-buttons">
                <button class="realm-btn" data-realm="mechanical-interior">Mechanical</button>
                <button class="realm-btn" data-realm="organic-biomech">Organic</button>
                <button class="realm-btn" data-realm="flowing-energy">Energy</button>
                <button class="realm-btn" data-realm="cyberpunk-city">Cyberpunk</button>
                <button class="realm-btn" data-realm="industrial-cosmic">Industrial</button>
            </div>
            <div class="current-realm">
                <span>Current Realm: </span>
                <span id="current-realm-name" class="realm-name">Mechanical Interior</span>
            </div>
        `;
        
        uiPanel.appendChild(navigationDiv);
        
        // Add realm button styles to CSS
        this.addRealmButtonStyles();
        
        // Setup realm button listeners
        const realmButtons = navigationDiv.querySelectorAll('.realm-btn');
        realmButtons.forEach(button => {
            button.addEventListener('click', () => {
                const realm = button.dataset.realm;
                this.changeRealm(realm);
            });
        });
        
        // Mark initial realm as active
        const initialButton = navigationDiv.querySelector(`[data-realm="${this.gameEngine.currentRealm}"]`);
        if (initialButton) {
            initialButton.classList.add('active');
        }
    }
    
    addRealmButtonStyles() {
        // Add realm navigation styles to the document
        const style = document.createElement('style');
        style.textContent = `
            .realm-navigation {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 2px solid var(--cosmic-purple);
            }
            
            .realm-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 15px;
            }
            
            .realm-btn {
                background: rgba(15, 15, 35, 0.8);
                border: 2px solid var(--cosmic-gold);
                border-radius: 6px;
                color: var(--cosmic-light);
                padding: 8px 12px;
                font-family: inherit;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.3s ease;
                flex: 1;
                min-width: calc(50% - 4px);
                text-align: center;
            }
            
            .realm-btn:hover {
                background: rgba(245, 158, 11, 0.2);
                box-shadow: 0 0 10px var(--cosmic-gold);
                transform: translateY(-1px);
            }
            
            .realm-btn.active {
                background: var(--cosmic-gold);
                color: var(--cosmic-darker);
                box-shadow: 0 0 15px var(--cosmic-gold);
            }
            
            .current-realm {
                text-align: center;
                color: var(--cosmic-teal);
                font-size: 0.9rem;
            }
            
            .realm-name {
                color: var(--cosmic-gold);
                font-weight: bold;
                text-shadow: 0 0 5px var(--cosmic-gold);
            }
        `;
        document.head.appendChild(style);
    }
    
    toggleOverlay(overlayType) {
        this.overlayStates[overlayType] = !this.overlayStates[overlayType];
        
        // Update button state
        const button = this.overlayButtons[overlayType];
        if (this.overlayStates[overlayType]) {
            button.classList.add('active');
            button.style.background = this.getOverlayColor(overlayType);
            button.style.boxShadow = `0 0 15px ${this.getOverlayColor(overlayType)}`;
        } else {
            button.classList.remove('active');
            button.style.background = 'rgba(15, 15, 35, 0.8)';
            button.style.boxShadow = '';
        }
        
        // Apply visual effects to the game canvas
        this.applyOverlayEffects();
        
        console.log(`Toggled ${overlayType} overlay:`, this.overlayStates[overlayType]);
    }
    
    getOverlayColor(overlayType) {
        const colors = {
            spectral: '#06B6D4',
            emotional: '#EC4899',
            temporal: '#F59E0B'
        };
        return colors[overlayType] || '#06B6D4';
    }
    
    updateOverlayIntensity() {
        const opacity = this.opacityLevel / 100;
        
        // Update brain stability display with current intensity
        this.brainStabilityText.textContent = `${Math.round(opacity * 100)}%`;
        
        // Apply intensity to active overlays
        this.applyOverlayEffects();
    }
    
    applyOverlayEffects() {
        const canvas = this.gameEngine.canvas;
        const opacity = this.opacityLevel / 100;
        
        // Reset filters
        canvas.style.filter = '';
        
        if (this.overlayStates.spectral || this.overlayStates.emotional || this.overlayStates.temporal) {
            let filters = [];
            
            if (this.overlayStates.spectral) {
                filters.push(`hue-rotate(180deg) brightness(${1 + 0.2 * opacity})`);
            }
            
            if (this.overlayStates.emotional) {
                filters.push(`saturate(${1 + 0.5 * opacity})`);
            }
            
            if (this.overlayStates.temporal) {
                filters.push(`contrast(${1 + 0.1 * opacity})`);
            }
            
            canvas.style.filter = filters.join(' ');
        }
    }
    
    toggleScan() {
        const isScanning = this.scanBtn.classList.contains('scanning');
        
        if (isScanning) {
            this.stopScan();
        } else {
            this.startScan();
        }
    }
    
    startScan() {
        this.scanBtn.classList.add('scanning');
        this.scanBtn.textContent = 'Scanning...';
        
        // Simulate frequency scanning
        this.animateFrequency();
        
        // Start particle scanning effect
        this.gameEngine.particleSystem.startScanEffect();
        
        console.log('Scan started');
    }
    
    stopScan() {
        this.scanBtn.classList.remove('scanning');
        this.scanBtn.textContent = 'Activate Antennae';
        this.frequencyDisplay.textContent = '432.7 Hz';
        
        // Stop scanning effects
        this.gameEngine.particleSystem.stopScanEffect();
        
        console.log('Scan stopped');
    }
    
    animateFrequency() {
        if (!this.scanBtn.classList.contains('scanning')) return;
        
        const frequencies = ['432.7', '528.0', '741.0', '852.0', '963.0'];
        let index = 0;
        
        const interval = setInterval(() => {
            if (!this.scanBtn.classList.contains('scanning')) {
                clearInterval(interval);
                return;
            }
            
            this.frequencyDisplay.textContent = `${frequencies[index]} Hz`;
            index = (index + 1) % frequencies.length;
        }, 200);
    }
    
    updateRealmDisplay(realmName) {
        const realmNameElement = document.getElementById('current-realm-name');
        const realmNames = {
            'mechanical-interior': 'Mechanical Interior',
            'organic-biomech': 'Organic Biomech',
            'flowing-energy': 'Flowing Energy',
            'cyberpunk-city': 'Cyberpunk City',
            'industrial-cosmic': 'Industrial Cosmic'
        };
        
        if (realmNameElement) {
            realmNameElement.textContent = realmNames[realmName] || realmName;
        }
        
        // Update active realm button
        const realmButtons = document.querySelectorAll('.realm-btn');
        realmButtons.forEach(button => {
            if (button.dataset.realm === realmName) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
    
    changeRealm(realm) {
        if (this.gameEngine.realmBackgrounds[realm]) {
            this.gameEngine.changeRealm(realm);
            this.updateRealmDisplay(realm);
        }
    }
    
    showHints() {
        // Show contextual hints based on current state
        const currentState = this.getCurrentGameState();
        const hints = this.getHintsForState(currentState);
        
        this.showHintDialog(hints);
        
        console.log('Hints shown for:', currentState);
    }
    
    getCurrentGameState() {
        if (this.gameEngine.dialogueSystem.isActive) return 'dialogue';
        if (this.overlayStates.spectral || this.overlayStates.emotional || this.overlayStates.temporal) return 'perception';
        return 'exploration';
    }
    
    getHintsForState(state) {
        const hintDatabase = {
            'exploration': [
                "Click on the DMT Trickster to begin your journey.",
                "Try using the perception filters to see hidden elements.",
                "Use the realm navigation buttons to explore different dimensions."
            ],
            'perception': [
                "Each filter reveals different aspects of reality.",
                "Spectral overlay shows hidden geometric structures.",
                "Emotional overlay reveals the feelings embedded in forms.",
                "Temporal overlay helps perceive flowing streams of causality."
            ],
            'dialogue': [
                "The Trickster guides you through dimensional layers.",
                "Listen carefully to the wisdom shared about each realm.",
                "Each conversation unlocks new understanding."
            ]
        };
        
        return hintDatabase[state] || hintDatabase['exploration'];
    }
    
    showHintDialog(hints) {
        // Create hint dialog
        const hintDialog = document.createElement('div');
        hintDialog.className = 'hint-dialog';
        hintDialog.innerHTML = `
            <div class="hint-content">
                <h3 class="hint-title">Guiding Wisdom</h3>
                <div class="hint-list">
                    ${hints.map(hint => `<p class="hint-text">• ${hint}</p>`).join('')}
                </div>
                <button class="hint-close">Close</button>
            </div>
        `;
        
        // Add styles
        hintDialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
        `;
        
        const hintContent = hintDialog.querySelector('.hint-content');
        hintContent.style.cssText = `
            background: rgba(30, 27, 75, 0.95);
            border: 2px solid var(--cosmic-gold);
            border-radius: 15px;
            padding: 30px;
            max-width: 500px;
            color: var(--cosmic-light);
            box-shadow: 0 0 30px rgba(245, 158, 11, 0.4);
        `;
        
        document.body.appendChild(hintDialog);
        
        // Close button
        const closeBtn = hintDialog.querySelector('.hint-close');
        closeBtn.style.cssText = `
            background: var(--cosmic-gold);
            border: none;
            border-radius: 8px;
            color: var(--cosmic-darker);
            padding: 10px 20px;
            margin-top: 20px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        `;
        
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(hintDialog);
        });
        
        // Click outside to close
        hintDialog.addEventListener('click', (e) => {
            if (e.target === hintDialog) {
                document.body.removeChild(hintDialog);
            }
        });
    }
    
    showSettings() {
        // Create settings dialog
        const settingsDialog = document.createElement('div');
        settingsDialog.className = 'settings-dialog';
        settingsDialog.innerHTML = `
            <div class="settings-content">
                <h3 class="settings-title">Game Settings</h3>
                <div class="settings-options">
                    <div class="setting-item">
                        <label>Perception Filter Intensity</label>
                        <input type="range" id="settings-opacity" min="0" max="100" value="${this.opacityLevel}">
                    </div>
                    <div class="setting-item">
                        <label>Particle Effects</label>
                        <input type="checkbox" id="settings-particles" checked>
                    </div>
                    <div class="setting-item">
                        <label>Glow Effects</label>
                        <input type="checkbox" id="settings-glow" checked>
                    </div>
                </div>
                <button class="settings-close">Apply & Close</button>
            </div>
        `;
        
        // Add styles
        settingsDialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
        `;
        
        const settingsContent = settingsDialog.querySelector('.settings-content');
        settingsContent.style.cssText = `
            background: rgba(30, 27, 75, 0.95);
            border: 2px solid var(--cosmic-teal);
            border-radius: 15px;
            padding: 30px;
            max-width: 400px;
            color: var(--cosmic-light);
            box-shadow: 0 0 30px rgba(6, 182, 212, 0.4);
        `;
        
        document.body.appendChild(settingsDialog);
        
        // Close button
        const closeBtn = settingsDialog.querySelector('.settings-close');
        closeBtn.style.cssText = `
            background: var(--cosmic-teal);
            border: none;
            border-radius: 8px;
            color: var(--cosmic-darker);
            padding: 10px 20px;
            margin-top: 20px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        `;
        
        closeBtn.addEventListener('click', () => {
            this.applySettings();
            document.body.removeChild(settingsDialog);
        });
    }
    
    applySettings() {
        const opacitySlider = document.getElementById('settings-opacity');
        const particlesCheckbox = document.getElementById('settings-particles');
        const glowCheckbox = document.getElementById('settings-glow');
        
        if (opacitySlider) {
            this.opacityLevel = parseInt(opacitySlider.value);
            this.opacitySlider.value = this.opacityLevel;
        }
        
        if (particlesCheckbox) {
            this.gameEngine.particleSystem.enabled = particlesCheckbox.checked;
        }
        
        if (glowCheckbox) {
            // Toggle glow effects globally
            document.body.style.setProperty('--glow-enabled', glowCheckbox.checked ? '1' : '0');
        }
        
        this.updateOverlayIntensity();
        
        console.log('Settings applied');
    }
    
    restartGame() {
        if (confirm('Are you sure you want to restart the game? Your progress will be lost.')) {
            this.gameEngine.restartGame();
            this.reset();
        }
    }
    
    toggleHints() {
        this.showHints();
    }
    
    reset() {
        // Reset all UI states
        for (const overlay in this.overlayStates) {
            this.overlayStates[overlay] = false;
        }
        
        // Reset button states
        for (const [type, button] of Object.entries(this.overlayButtons)) {
            button.classList.remove('active');
            button.style.background = 'rgba(15, 15, 35, 0.8)';
            button.style.boxShadow = '';
        }
        
        // Reset opacity
        this.opacityLevel = 70;
        this.opacitySlider.value = this.opacityLevel;
        
        // Stop scan if active
        if (this.scanBtn.classList.contains('scanning')) {
            this.stopScan();
        }
        
        // Reset realm display
        this.updateRealmDisplay(this.gameEngine.currentRealm);
        
        console.log('UI Manager reset');
    }
    
    // Update brain stability meter
    updateBrainStability(stability) {
        const stabilityPercentage = Math.max(0, Math.min(100, stability));
        this.brainStabilityText.textContent = `${stabilityPercentage}%`;
        
        // Update visual indicators
        const brainContainer = document.querySelector('.brain-container');
        if (brainContainer) {
            if (stabilityPercentage < 30) {
                brainContainer.style.filter = 'hue-rotate(0deg) brightness(0.8)';
            } else if (stabilityPercentage < 60) {
                brainContainer.style.filter = 'hue-rotate(30deg) brightness(0.9)';
            } else {
                brainContainer.style.filter = 'hue-rotate(0deg) brightness(1)';
            }
        }
    }
}