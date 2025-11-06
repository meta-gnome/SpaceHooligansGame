// HyperSpace Hooligans - Main Game Initialization
// This file initializes all game systems and starts the application

class HyperSpaceHooligansGame {
    constructor() {
        this.gameEngine = null;
        this.isReady = false;
        this.assetsLoaded = false;
        this.assetsTotal = 0;
        this.assetsLoadedCount = 0;
        
        this.init();
    }
    
    async init() {
        try {
            console.log('Initializing HyperSpace Hooligans...');
            
            // Wait for DOM to be fully loaded
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Setup asset loading tracking
            this.setupAssetLoading();
            
            // Initialize game engine
            this.gameEngine = new GameEngine();
            
            // Wait for game engine to be fully initialized
            await this.waitForGameEngine();
            
            // Setup additional event listeners
            this.setupGlobalEventListeners();
            
            // Setup mobile optimizations
            this.setupMobileOptimizations();
            
            this.isReady = true;
            console.log('HyperSpace Hooligans initialized successfully!');
            
            // Show welcome message
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('Failed to initialize HyperSpace Hooligans:', error);
            this.showErrorMessage(error.message);
        }
    }
    
    setupAssetLoading() {
        // Track loading progress for better UX
        this.assetsTotal = 7; // 2 characters + 5 backgrounds
        this.assetsLoadedCount = 0;
        
        // Override Image loading to track progress
        const originalLoadImage = this.loadImageWithTracking.bind(this);
        
        // Listen for asset loading completion
        window.addEventListener('load', () => {
            this.assetsLoaded = true;
        });
    }
    
    loadImageWithTracking(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.assetsLoadedCount++;
                this.updateLoadingProgress();
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to load ${src}`));
            img.src = src;
        });
    }
    
    updateLoadingProgress() {
        const progress = (this.assetsLoadedCount / this.assetsTotal) * 100;
        const progressBar = document.querySelector('.loading-progress');
        const loadingText = document.querySelector('.loading-text');
        
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        
        if (loadingText) {
            if (progress < 30) {
                loadingText.textContent = 'Loading dimensional energies...';
            } else if (progress < 60) {
                loadingText.textContent = 'Calibrating perception filters...';
            } else if (progress < 90) {
                loadingText.textContent = 'Awakening cosmic consciousness...';
            } else {
                loadingText.textContent = 'Preparing for interdimensional travel...';
            }
        }
    }
    
    waitForGameEngine() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (this.gameEngine && this.gameEngine.isInitialized) {
                    // Ensure character images are loaded
                    if (this.gameEngine.characterManager) {
                        this.gameEngine.characterManager.loadCharacterImages();
                    }
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            
            // Timeout after 10 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve(); // Continue anyway
            }, 10000);
        });
    }
    
    setupGlobalEventListeners() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not in dialogue
            if (!this.gameEngine.dialogueSystem.isActive) {
                switch (e.key) {
                    case 'F1':
                        e.preventDefault();
                        this.showHelpDialog();
                        break;
                    case 'F11':
                        e.preventDefault();
                        this.toggleFullscreen();
                        break;
                    case 'Escape':
                        e.preventDefault();
                        this.showPauseMenu();
                        break;
                }
            }
        });
        
        // Handle window focus/blur for pausing
        window.addEventListener('blur', () => {
            if (this.gameEngine && this.gameEngine.gameState === 'running') {
                this.gameEngine.gameState = 'paused';
            }
        });
        
        window.addEventListener('focus', () => {
            if (this.gameEngine && this.gameEngine.gameState === 'paused') {
                this.gameEngine.gameState = 'running';
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.gameEngine) {
                this.gameEngine.resizeCanvas();
            }
        });
        
        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (this.gameEngine) {
                if (document.hidden) {
                    this.gameEngine.gameState = 'paused';
                } else if (!this.gameEngine.dialogueSystem.isActive) {
                    this.gameEngine.gameState = 'running';
                }
            }
        });
    }
    
    setupMobileOptimizations() {
        // Detect mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            this.enableMobileOptimizations();
        }
    }
    
    enableMobileOptimizations() {
        console.log('Enabling mobile optimizations...');
        
        // Optimize particle system for mobile
        if (this.gameEngine.particleSystem) {
            this.gameEngine.particleSystem.mobileOptimize();
        }
        
        // Add mobile-specific styles
        this.addMobileStyles();
        
        // Add touch event handlers
        this.setupTouchEvents();
    }
    
    addMobileStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .game-canvas {
                    touch-action: manipulation;
                }
                
                .ui-panel {
                    width: calc(100vw - 40px);
                    max-height: 200px;
                    overflow-y: auto;
                }
                
                .realm-buttons {
                    grid-template-columns: 1fr 1fr;
                    gap: 5px;
                }
                
                .realm-btn {
                    font-size: 0.7rem;
                    padding: 6px 8px;
                }
            }
            
            @media (max-width: 480px) {
                .game-controls {
                    flex-direction: row;
                    top: calc(100% - 50px);
                    left: 50%;
                    transform: translateX(-50%);
                }
                
                .control-btn {
                    padding: 8px 12px;
                    font-size: 0.8rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    setupTouchEvents() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        
        // Prevent default touch behaviors
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
        });
    }
    
    showWelcomeMessage() {
        // Show a brief welcome message or tutorial hint
        setTimeout(() => {
            if (this.gameEngine && this.gameEngine.dialogueSystem) {
                this.gameEngine.dialogueSystem.startDialogue('initial-intro', 'DMT Trickster');
            }
        }, 2000);
    }
    
    showHelpDialog() {
        const helpContent = `
            <h3>HyperSpace Hooligans - Controls</h3>
            <div class="help-section">
                <h4>Basic Controls</h4>
                <ul>
                    <li><strong>Click:</strong> Interact with characters and objects</li>
                    <li><strong>Hover:</strong> See interactive elements highlighted</li>
                    <li><strong>Space/Enter:</strong> Advance dialogue</li>
                </ul>
            </div>
            <div class="help-section">
                <h4>Perception Filters</h4>
                <ul>
                    <li><strong>Spectral:</strong> Reveals hidden geometric structures</li>
                    <li><strong>Emotional:</strong> Shows feelings embedded in forms</li>
                    <li><strong>Temporal:</strong> Perceives flowing streams of causality</li>
                </ul>
            </div>
            <div class="help-section">
                <h4>Realm Navigation</h4>
                <ul>
                    <li>Use the realm buttons to travel between dimensions</li>
                    <li>Each realm has unique properties and challenges</li>
                    <li>Talk to the DMT Trickster for guidance</li>
                </ul>
            </div>
            <div class="help-section">
                <h4>Keyboard Shortcuts</h4>
                <ul>
                    <li><strong>H:</strong> Show hints</li>
                    <li><strong>R:</strong> Restart game</li>
                    <li><strong>F11:</strong> Toggle fullscreen</li>
                    <li><strong>ESC:</strong> Pause menu</li>
                </ul>
            </div>
        `;
        
        this.showDialog('Game Help', helpContent, 'Close');
    }
    
    showPauseMenu() {
        const pauseContent = `
            <h3>Game Paused</h3>
            <div class="pause-options">
                <button onclick="gameInstance.resumeGame()" class="pause-btn">Resume</button>
                <button onclick="gameInstance.showHelpDialog()" class="pause-btn">Help</button>
                <button onclick="gameInstance.restartGame()" class="pause-btn">Restart</button>
            </div>
        `;
        
        this.showDialog('Paused', pauseContent, 'Resume');
    }
    
    showDialog(title, content, closeText = 'Close') {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            backdrop-filter: blur(5px);
        `;
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: rgba(30, 27, 75, 0.95);
            border: 2px solid var(--cosmic-teal);
            border-radius: 15px;
            padding: 30px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            color: var(--cosmic-light);
            box-shadow: 0 0 30px rgba(6, 182, 212, 0.4);
        `;
        
        dialog.innerHTML = `
            <h2 style="color: var(--cosmic-teal); margin-bottom: 20px; text-align: center;">${title}</h2>
            ${content}
            <div style="text-align: center; margin-top: 30px;">
                <button id="dialog-close" style="
                    background: var(--cosmic-teal);
                    border: none;
                    border-radius: 8px;
                    color: var(--cosmic-darker);
                    padding: 12px 24px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">${closeText}</button>
            </div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        const closeBtn = dialog.querySelector('#dialog-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }
    
    showErrorMessage(message) {
        const errorContent = `
            <h3>Initialization Error</h3>
            <p>Failed to start the game: ${message}</p>
            <p>Please refresh the page and try again.</p>
        `;
        
        this.showDialog('Error', errorContent, 'Refresh Page');
        
        // Add refresh functionality
        const overlay = document.querySelector('.dialog-overlay');
        if (overlay) {
            const closeBtn = overlay.querySelector('#dialog-close');
            closeBtn.addEventListener('click', () => {
                window.location.reload();
            });
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    resumeGame() {
        if (this.gameEngine && this.gameEngine.gameState === 'paused') {
            this.gameEngine.gameState = 'running';
        }
        
        // Close pause dialog
        const overlay = document.querySelector('.dialog-overlay');
        if (overlay) {
            document.body.removeChild(overlay);
        }
    }
    
    restartGame() {
        if (confirm('Are you sure you want to restart the game? Your progress will be lost.')) {
            if (this.gameEngine) {
                this.gameEngine.restartGame();
            }
            
            // Close dialog
            const overlay = document.querySelector('.dialog-overlay');
            if (overlay) {
                document.body.removeChild(overlay);
            }
        }
    }
    
    // Public API for external access
    getGameState() {
        return {
            isReady: this.isReady,
            currentRealm: this.gameEngine?.currentRealm,
            gameState: this.gameEngine?.gameState,
            dialogueActive: this.gameEngine?.dialogueSystem?.isActive
        };
    }
    
    // Cleanup method
    destroy() {
        if (this.gameEngine) {
            this.gameEngine.destroy();
        }
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('resize', this.handleResize);
        
        console.log('HyperSpace Hooligans game destroyed');
    }
}

// Global game instance
let gameInstance = null;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    gameInstance = new HyperSpaceHooligansGame();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HyperSpaceHooligansGame;
}

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    if (gameInstance) {
        gameInstance.showErrorMessage(e.error.message);
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    if (gameInstance) {
        gameInstance.showErrorMessage(e.reason.message || 'Unknown error');
    }
});

console.log('HyperSpace Hooligans main script loaded');