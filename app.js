// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Audio context for sound effects and voice clips
    let audioContext;
    
    // Voice clips for VTuber
    const voiceClips = {
        greetings: [
            './voices/hello.mp3',
            './voices/hi_there.mp3',
            './voices/nice_to_meet_you.mp3'
        ],
        reactions: [
            './voices/wow.mp3',
            './voices/amazing.mp3',
            './voices/oh_no.mp3',
            './voices/hehe.mp3'
        ],
        emotions: {
            happy: './voices/happy.mp3',
            sad: './voices/sad.mp3',
            angry: './voices/angry.mp3',
            surprised: './voices/surprised.mp3'
        }
    };
    
    // Sound effects
    const soundEffects = {
        laugh: './sounds/laugh.mp3',
        greeting: './sounds/greeting.mp3',
        surprise: './sounds/surprise.mp3',
        sad: './sounds/sad.mp3'
    };
    
    // Preload audio files
    const loadedAudio = {};

    // Initialize PIXI Application
    const app = new PIXI.Application({
        view: document.getElementById('live2d'),
        autoStart: true,
        backgroundColor: 0xf0f8ff,
        width: 800,
        height: 600
    });

    // Load the Live2D model
    await loadLive2DModel();

    // Function to load the Live2D model
    async function loadLive2DModel() {
        try {
            console.log('Attempting to load model...');
            
            // Set up the model path
            const modelPath = './mikumiku/mikumiku.model3.json';
            
            // Load the model
            const model = await PIXI.live2d.Live2DModel.from(modelPath);
            
            if (!model) {
                console.error('Model loaded but is null or undefined');
                return;
            }
            
            console.log('Model loaded successfully!');
            
            // Adjust model position and scale
            model.scale.set(0.5);
            model.x = -320;
            model.y = -200;
            
            // Add the model to the stage
            app.stage.addChild(model);
            
            // Enable dragging the model
            model.interactive = true;
            model.buttonMode = true;
            
            let isDragging = false;
            let dragOffset = { x: 0, y: 0 };
            
            model.on('pointerdown', (e) => {
                isDragging = true;
                const pos = e.data.global;
                dragOffset = { x: model.x - pos.x, y: model.y - pos.y };
            });
            
            model.on('pointermove', (e) => {
                if (isDragging) {
                    const pos = e.data.global;
                    model.x = pos.x + dragOffset.x;
                    model.y = pos.y + dragOffset.y;
                }
            });
            
            model.on('pointerup', () => {
                isDragging = false;
            });
            
            model.on('pointerupoutside', () => {
                isDragging = false;
            });
            
            // Store the model for later use
            window.live2dModel = model;
            
 
            setupExpressionButtons(model);
            
            // Set up voice controls
            setupVoiceControls(model);
            
            // Hide loading overlay if it exists
            const loadingOverlay = document.querySelector('.loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
            }
            
        } catch (error) {
            console.error('Failed to load the Live2D model:', error);
            console.error('Error details:', error.message);
        }
    }

    // Function to set up expression buttons
    function setupExpressionButtons(model) {
        const expressionFiles = {
            'btn-clothes': './mikumiku/clothes-1.exp3.json',
            'btn-down-teeth': './mikumiku/Down-canineteeth.exp3.json',
            'btn-up-teeth': './mikumiku/Up-canineteeth.exp3.json',
            'btn-dress': './mikumiku/dress.exp3.json',
            'btn-fan-hand': './mikumiku/fan-hand.exp3.json',
            'btn-fan-open': './mikumiku/fan-open.exp3.json',
            'btn-heart-eye': './mikumiku/Heart-eye.exp3.json',
            'btn-tear': './mikumiku/Tear.exp3.json'
        };

        // Set up click handlers for each expression button
        Object.keys(expressionFiles).forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (!button) {
                console.warn(`Button with ID ${buttonId} not found`);
                return;
            }
            
            const expressionFile = expressionFiles[buttonId];
            
            button.addEventListener('click', async () => {
                if (!model) {
                    console.error('Model not loaded yet');
                    return;
                }
                
                try {
                    // Toggle button active state
                    button.classList.toggle('active');
                    
                    if (button.classList.contains('active')) {
                        // Try to load and apply the expression
                        try {
                            if (model.internalModel && model.internalModel.expressionManager) {
                                const expression = await PIXI.live2d.Live2DExpression.fromUrl(expressionFile);
                                model.internalModel.expressionManager.setExpression(expression);
                                console.log(`Expression ${expressionFile} applied`);
                            } else {
                                console.warn('Expression manager not available');
                            }
                        } catch (expError) {
                            console.warn(`Could not apply expression ${expressionFile}:`, expError);
                            
                            // Alternative approach for parameter-based expressions
                            try {
                                // Load the expression JSON file
                                const response = await fetch(expressionFile);
                                const expData = await response.json();
                                
                                // Apply parameters directly
                                if (expData && expData.Parameters && model.internalModel) {
                                    expData.Parameters.forEach(param => {
                                        if (param.Id && param.Value !== undefined) {
                                            model.internalModel.coreModel.setParameterValueById(param.Id, param.Value);
                                        }
                                    });
                                    console.log(`Applied expression ${expressionFile} via parameters`);
                                }
                            } catch (paramError) {
                                console.error(`Failed to apply expression parameters:`, paramError);
                            }
                        }
                    } else {
                        // Reset expression
                        if (model.internalModel && model.internalModel.expressionManager) {
                            model.internalModel.expressionManager.resetExpression();
                        } else {
                            // Try to reset parameters directly
                            try {
                                const response = await fetch(expressionFile);
                                const expData = await response.json();
                                
                                if (expData && expData.Parameters && model.internalModel) {
                                    expData.Parameters.forEach(param => {
                                        if (param.Id) {
                                            model.internalModel.coreModel.setParameterValueById(param.Id, 0);
                                        }
                                    });
                                }
                            } catch (resetError) {
                                console.warn('Could not reset expression parameters:', resetError);
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Failed to toggle expression ${expressionFile}:`, error);
                }
            });
        });
    }
    
    // Function to set up voice controls
    function setupVoiceControls(model) {
        // Initialize audio context on user interaction
        document.addEventListener('click', initAudio, { once: true });
        
        // Voice phrase buttons
        const phraseButtons = {
            'voice-greeting': { type: 'greetings', expression: 'greeting' },
            'voice-happy': { type: 'emotions', key: 'happy', expression: 'happy' },
            'voice-sad': { type: 'emotions', key: 'sad', expression: 'sad' },
            'voice-surprised': { type: 'emotions', key: 'surprised', expression: 'surprise' },
            'voice-random': { type: 'reactions', expression: 'random' }
        };
        
        // Set up voice phrase buttons
        Object.entries(phraseButtons).forEach(([id, config]) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', () => {
                    playVoiceClip(config.type, config.key);
                    playExpression(model, config.expression);
                });
            }
        });
        
        // Sound effect buttons
        const soundButtons = {
            'sound-laugh': { sound: 'laugh', expression: 'happy' },
            'sound-greeting': { sound: 'greeting', expression: 'greeting' },
            'sound-surprise': { sound: 'surprise', expression: 'surprise' },
            'sound-sad': { sound: 'sad', expression: 'sad' }
        };
        
        // Set up sound effect buttons
        Object.entries(soundButtons).forEach(([id, config]) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', () => {
                    playSound(config.sound);
                    playExpression(model, config.expression);
                });
            }
        });
    }
    
    // Play expression animation
    function playExpression(model, type) {
        if (!model || !model.internalModel) return;
        
        try {
            switch (type) {
                case 'happy':
                    // Happy expression
                    model.internalModel.coreModel.setParameterValueById('ParamMouthForm', 1);
                    model.internalModel.coreModel.setParameterValueById('ParamEyeLSmile', 1);
                    model.internalModel.coreModel.setParameterValueById('ParamEyeRSmile', 1);
                    
                    // Reset after animation
                    setTimeout(() => {
                        model.internalModel.coreModel.setParameterValueById('ParamMouthForm', 0);
                        model.internalModel.coreModel.setParameterValueById('ParamEyeLSmile', 0);
                        model.internalModel.coreModel.setParameterValueById('ParamEyeRSmile', 0);
                    }, 2000);
                    break;
                    
                case 'greeting':
                    // Wave animation
                    animateWave(model);
                    break;
                    
                case 'surprise':
                    // Surprise expression
                    model.internalModel.coreModel.setParameterValueById('ParamEyeLOpen', 1.5);
                    model.internalModel.coreModel.setParameterValueById('ParamEyeROpen', 1.5);
                    model.internalModel.coreModel.setParameterValueById('ParamBrowLY', 1);
                    model.internalModel.coreModel.setParameterValueById('ParamBrowRY', 1);
                    model.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', 0.8);
                    
                    // Reset after animation
                    setTimeout(() => {
                        model.internalModel.coreModel.setParameterValueById('ParamEyeLOpen', 1);
                        model.internalModel.coreModel.setParameterValueById('ParamEyeROpen', 1);
                        model.internalModel.coreModel.setParameterValueById('ParamBrowLY', 0);
                        model.internalModel.coreModel.setParameterValueById('ParamBrowRY', 0);
                        model.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', 0);
                    }, 2000);
                    break;
                    
                case 'sad':
                    // Sad expression
                    model.internalModel.coreModel.setParameterValueById('ParamBrowLY', -1);
                    model.internalModel.coreModel.setParameterValueById('ParamBrowRY', -1);
                    model.internalModel.coreModel.setParameterValueById('ParamBrowLForm', -1);
                    model.internalModel.coreModel.setParameterValueById('ParamBrowRForm', -1);
                    model.internalModel.coreModel.setParameterValueById('ParamMouthForm', -1);
                    
                    // Apply tears expression if available
                    const tearButton = document.getElementById('btn-tear');
                    if (tearButton && !tearButton.classList.contains('active')) {
                        tearButton.click();
                        
                        // Reset tear after animation
                        setTimeout(() => {
                            if (tearButton.classList.contains('active')) {
                                tearButton.click();
                            }
                        }, 5000);
                    }
                    
                    // Reset after animation
                    setTimeout(() => {
                        model.internalModel.coreModel.setParameterValueById('ParamBrowLY', 0);
                        model.internalModel.coreModel.setParameterValueById('ParamBrowRY', 0);
                        model.internalModel.coreModel.setParameterValueById('ParamBrowLForm', 0);
                        model.internalModel.coreModel.setParameterValueById('ParamBrowRForm', 0);
                        model.internalModel.coreModel.setParameterValueById('ParamMouthForm', 0);
                    }, 3000);
                    break;
                    
                case 'random':
                    // Random expression
                    const expressions = ['happy', 'surprise', 'sad'];
                    const randomExp = expressions[Math.floor(Math.random() * expressions.length)];
                    playExpression(model, randomExp);
                    break;
            }
        } catch (error) {
            console.warn(`Could not play expression ${type}:`, error);
        }
    }
    
    // Initialize audio context (must be triggered by user interaction)
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // Preload audio files
            preloadAudioFiles();
        }
    }
    
    // Preload audio files
    async function preloadAudioFiles() {
        // Preload sound effects
        for (const [name, url] of Object.entries(soundEffects)) {
            preloadAudio(url, `sound_${name}`);
        }
        
        // Preload voice clips
        for (const clip of voiceClips.greetings) {
            preloadAudio(clip, `voice_greeting_${voiceClips.greetings.indexOf(clip)}`);
        }
        
        for (const clip of voiceClips.reactions) {
            preloadAudio(clip, `voice_reaction_${voiceClips.reactions.indexOf(clip)}`);
        }
        
        for (const [emotion, url] of Object.entries(voiceClips.emotions)) {
            preloadAudio(url, `voice_emotion_${emotion}`);
        }
    }
    
    // Preload a single audio file
    async function preloadAudio(url, id) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            loadedAudio[id] = audioBuffer;
        } catch (error) {
            console.warn(`Could not preload audio: ${url}`, error);
        }
    }
    
    // Play a sound effect
    function playSound(name) {
        if (!audioContext) {
            initAudio();
            // If audio context isn't ready yet, try again after a delay
            setTimeout(() => playSound(name), 500);
            return;
        }
        
        const audioId = `sound_${name}`;
        if (loadedAudio[audioId]) {
            playAudioBuffer(loadedAudio[audioId]);
        } else {
            // Try to load and play
            fetch(soundEffects[name])
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    loadedAudio[audioId] = audioBuffer;
                    playAudioBuffer(audioBuffer);
                })
                .catch(error => console.error(`Error playing sound: ${name}`, error));
        }
    }
    
    // Play a voice clip
    function playVoiceClip(type, key = null) {
        if (!audioContext) {
            initAudio();
            // If audio context isn't ready yet, try again after a delay
            setTimeout(() => playVoiceClip(type, key), 500);
            return;
        }
        
        let clipUrl;
        
        if (type === 'emotions' && key) {
            // Play specific emotion
            clipUrl = voiceClips.emotions[key];
        } else if (type === 'greetings') {
            // Play random greeting
            const index = Math.floor(Math.random() * voiceClips.greetings.length);
            clipUrl = voiceClips.greetings[index];
        } else if (type === 'reactions') {
            // Play random reaction
            const index = Math.floor(Math.random() * voiceClips.reactions.length);
            clipUrl = voiceClips.reactions[index];
        }
        
        if (clipUrl) {
            // Try to find in preloaded audio
            const audioId = `voice_${type}_${key || Math.floor(Math.random() * 100)}`;
            if (loadedAudio[audioId]) {
                playAudioBuffer(loadedAudio[audioId]);
            } else {
                // Load and play
                fetch(clipUrl)
                    .then(response => response.arrayBuffer())
                    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
                    .then(audioBuffer => {
                        loadedAudio[audioId] = audioBuffer;
                        playAudioBuffer(audioBuffer);
                    })
                    .catch(error => console.error(`Error playing voice clip: ${clipUrl}`, error));
            }
        }
    }
    
    // Play an audio buffer
    function playAudioBuffer(buffer) {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
    }
    
    // Animate mouth while speaking
    function animateMouthWhileSpeaking(model, duration = 2000) {
        if (!model || !model.internalModel) return;
        
        const startTime = Date.now();
        const mouthInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                clearInterval(mouthInterval);
                model.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', 0);
                return;
            }
            
            // Random mouth movement to simulate talking
            const openValue = Math.random() * 0.8 + 0.2;
            model.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', openValue);
        }, 100);
    }
    
    // Animate waving
    function animateWave(model) {
        if (!model || !model.internalModel) return;
        
        const duration = 2000; // 2 seconds
        const startTime = Date.now();
        const waveInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                clearInterval(waveInterval);
                model.internalModel.coreModel.setParameterValueById('ParamBodyAngleZ', 0);
                model.internalModel.coreModel.setParameterValueById('ParamBodyAngleX', 0);
                return;
            }
            
            // Simple wave animation
            const progress = elapsed / duration;
            const angle = Math.sin(progress * Math.PI * 4) * 10;
            model.internalModel.coreModel.setParameterValueById('ParamBodyAngleZ', angle);
            model.internalModel.coreModel.setParameterValueById('ParamBodyAngleX', 5);
        }, 16);
    }
});