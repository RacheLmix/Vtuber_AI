// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
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
            model.x = app.renderer.width / 2;
            model.y = app.renderer.height / 2;
            
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
            
            // Try to load the idle animation
            try {
                if (model.internalModel && model.internalModel.motionManager) {
                    const motionPath = './mikumiku/Standby.motion3.json';
                    const motion = await PIXI.live2d.Live2DMotion.fromUrl(motionPath);
                    model.internalModel.motionManager.startMotion(motion);
                    console.log('Idle animation loaded successfully!');
                }
            } catch (animError) {
                console.warn('Could not load idle animation:', animError);
            }
            
            // Set up expression buttons
            setupExpressionButtons(model);
            
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
}); 