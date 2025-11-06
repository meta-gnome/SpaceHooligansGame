class DialogueSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.isActive = false;
        this.currentDialogue = null;
        this.currentLineIndex = 0;
        this.lines = [];
        
        // DOM elements
        this.dialogueContainer = null;
        this.dialogueBox = null;
        this.dialogueSpeakerImage = null;
        this.dialogueSpeakerName = null;
        this.dialogueContent = null;
        this.dialogueNext = null;
        
        // Dialogue data
        this.dialogueData = {
            'initial-intro': {
                speaker: 'DMT Trickster',
                speakerImage: 'dmt-trickster',
                lines: [
                    "Welcome, strange one. I am the DMT Trickster, guardian of dimensional boundaries.",
                    "You have arrived through the teleporter's chaotic resonance. Your consciousness has been scattered across multiple realms.",
                    "To find your way home, you must learn to perceive beyond ordinary reality.",
                    "Use your perception filters to reveal hidden truths in each realm.",
                    "Click on me to receive guidance as you journey through the cosmic layers."
                ]
            },
            'realm-mechanical-interior': {
                speaker: 'DMT Trickster',
                speakerImage: 'dmt-trickster',
                lines: [
                    "This is the Mechanical Interior realm - a place of rigid structures and orderly chaos.",
                    "Your television head displays the mechanical patterns of reality.",
                    "Try activating the spectral overlay to see the underlying mathematical structures."
                ]
            },
            'realm-organic-biomech': {
                speaker: 'DMT Trickster',
                speakerImage: 'dmt-trickster',
                lines: [
                    "The Organic Biomechanical realm merges flesh and machine in harmonious discord.",
                    "Your antennae ears resonate with the bio-electric frequencies here.",
                    "The emotional overlay will help you navigate the feelings embedded in these forms."
                ]
            },
            'realm-flowing-energy': {
                speaker: 'DMT Trickster',
                speakerImage: 'dmt-trickster',
                lines: [
                    "Here flows pure energy, raw consciousness unbound by physical form.",
                    "Time itself moves differently in this realm - use the temporal overlay to perceive the flowing streams of causality."
                ]
            },
            'realm-cyberpunk-city': {
                speaker: 'DMT Trickster',
                speakerImage: 'dmt-trickster',
                lines: [
                    "The Cyberpunk City realm - where digital dreams merge with neon reality.",
                    "Information flows here as visible streams. Your brain-core processes the data differently.",
                    "All three perception filters work together to reveal the true nature of this digital realm."
                ]
            },
            'realm-industrial-cosmic': {
                speaker: 'DMT Trickster',
                speakerImage: 'dmt-trickster',
                lines: [
                    "The Industrial Cosmic realm - where cosmic forces shape the machinery of reality.",
                    "This is the final layer before you can achieve complete dimensional integration.",
                    "With all your abilities harmonized, the path home will become clear."
                ]
            }
        };
        
        this.init();
    }
    
    init() {
        this.dialogueContainer = document.getElementById('dialogue-container');
        this.dialogueBox = document.querySelector('.dialogue-box');
        this.dialogueSpeakerImage = document.getElementById('dialogue-speaker-image');
        this.dialogueSpeakerName = document.getElementById('dialogue-speaker-name');
        this.dialogueContent = document.getElementById('dialogue-content');
        this.dialogueNext = document.getElementById('dialogue-next');
        
        this.dialogueNext.addEventListener('click', () => this.nextLine());
        
        // Auto-advance on space or enter
        document.addEventListener('keydown', (e) => {
            if (this.isActive && (e.key === ' ' || e.key === 'Enter')) {
                e.preventDefault();
                this.nextLine();
            }
        });
    }
    
    startDialogue(dialogueId, speakerName = null) {
        if (!this.dialogueData[dialogueId]) {
            console.warn(`Dialogue '${dialogueId}' not found`);
            return;
        }
        
        this.currentDialogue = dialogueId;
        this.currentLineIndex = 0;
        this.lines = this.dialogueData[dialogueId].lines;
        
        // Set speaker info
        const dialogueInfo = this.dialogueData[dialogueId];
        if (speakerName) {
            dialogueInfo.speaker = speakerName;
        }
        
        this.setupSpeaker(dialogueInfo);
        this.showDialogue();
        this.displayCurrentLine();
        
        this.isActive = true;
        this.gameEngine.gameState = 'dialogue';
    }
    
    setupSpeaker(dialogueInfo) {
        const speakerImage = this.gameEngine.assets.get(dialogueInfo.speakerImage);
        if (speakerImage) {
            this.dialogueSpeakerImage.src = dialogueInfo.speakerImage === 'dmt-trickster' ? 
                'assets/characters/dmt-trickster.jpg' : 
                'assets/characters/bunny-ears.jpg';
            this.dialogueSpeakerImage.alt = dialogueInfo.speaker;
        }
        
        this.dialogueSpeakerName.textContent = dialogueInfo.speaker;
    }
    
    displayCurrentLine() {
        if (this.currentLineIndex >= this.lines.length) {
            this.endDialogue();
            return;
        }
        
        const currentLine = this.lines[this.currentLineIndex];
        this.typeText(currentLine);
        
        // Update next button
        if (this.currentLineIndex === this.lines.length - 1) {
            this.dialogueNext.textContent = 'End';
        } else {
            this.dialogueNext.textContent = 'Continue';
        }
    }
    
    typeText(text, speed = 50) {
        this.dialogueContent.textContent = '';
        let index = 0;
        
        const typeInterval = setInterval(() => {
            if (index < text.length) {
                this.dialogueContent.textContent += text.charAt(index);
                index++;
                
                // Play typing sound occasionally
                if (index % 3 === 0) {
                    this.playTypingSound();
                }
            } else {
                clearInterval(typeInterval);
            }
        }, speed);
    }
    
    nextLine() {
        if (!this.isActive) return;
        
        this.currentLineIndex++;
        this.displayCurrentLine();
    }
    
    endDialogue() {
        this.hideDialogue();
        this.isActive = false;
        this.currentDialogue = null;
        this.currentLineIndex = 0;
        this.lines = [];
        
        this.gameEngine.gameState = 'running';
        
        // Play end sound
        this.playDialogueEndSound();
    }
    
    showDialogue() {
        this.dialogueContainer.classList.remove('hidden');
        
        // Add entrance animation
        this.dialogueBox.style.transform = 'translateY(20px)';
        this.dialogueBox.style.opacity = '0';
        
        requestAnimationFrame(() => {
            this.dialogueBox.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            this.dialogueBox.style.transform = 'translateY(0)';
            this.dialogueBox.style.opacity = '1';
        });
    }
    
    hideDialogue() {
        this.dialogueBox.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        this.dialogueBox.style.transform = 'translateY(20px)';
        this.dialogueBox.style.opacity = '0';
        
        setTimeout(() => {
            this.dialogueContainer.classList.add('hidden');
        }, 300);
    }
    
    playTypingSound() {
        // Simulate typing sound
        console.log('Type');
    }
    
    playDialogueEndSound() {
        // Simulate dialogue end sound
        console.log('Dialogue end');
    }
    
    // Add new dialogue content dynamically
    addDialogue(id, dialogueInfo) {
        this.dialogueData[id] = dialogueInfo;
    }
    
    // Remove dialogue (for dynamic content)
    removeDialogue(id) {
        delete this.dialogueData[id];
    }
    
    // Check if a dialogue exists
    hasDialogue(id) {
        return !!this.dialogueData[id];
    }
    
    // Get current dialogue info
    getCurrentDialogue() {
        if (!this.currentDialogue) return null;
        return this.dialogueData[this.currentDialogue];
    }
    
    // Reset dialogue system
    reset() {
        this.endDialogue();
    }
    
    // Pause dialogue (for cutscenes or other interrupts)
    pause() {
        this.isActive = false;
    }
    
    // Resume dialogue
    resume() {
        if (this.currentDialogue) {
            this.isActive = true;
            this.gameEngine.gameState = 'dialogue';
        }
    }
}