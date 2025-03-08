# Miku Miku VTuber Web Application

This is a simple web application that displays a Live2D VTuber model named "Miku Miku". The model can be controlled with various expressions and animations.

## Features

- Display a Live2D VTuber model
- Toggle various expressions (clothes cover, canine teeth, dress, fan, heart eyes, tears)
- Drag the model around the canvas
- Responsive design for different screen sizes

## Setup Instructions

1. Make sure all the model files are in the `mikumiku` directory
2. There are two ways to run the application:

### Option 1: Using Node.js (Recommended)

If you have Node.js installed:

```bash
# Navigate to the project directory
cd path/to/project

# Run the Node.js server
node server.js
```

Then open your browser and go to `http://localhost:3000`

### Option 2: Using Python's HTTP Server

```bash
# Navigate to the project directory
cd path/to/project

# Start a simple HTTP server
python -m http.server
```

Then open your browser and go to `http://localhost:8000`

### Option 3: Using Live Server in VS Code

1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Model Controls

- **Toggle Clothes Cover**: Shows/hides the clothes cover
- **Toggle Down Canine Teeth**: Shows/hides the lower canine teeth
- **Toggle Up Canine Teeth**: Shows/hides the upper canine teeth
- **Toggle Dress**: Shows/hides the dress
- **Toggle Fan Hand**: Shows/hides the fan in hand
- **Toggle Fan Open**: Opens/closes the fan
- **Toggle Heart Eyes**: Shows/hides heart-shaped eyes
- **Toggle Tears**: Shows/hides tears

## Technical Details

This application uses:
- [Live2D Cubism SDK](https://www.live2d.com/en/download/cubism-sdk/download-web/)
- [PixiJS](https://pixijs.com/) for rendering
- [pixi-live2d-display](https://github.com/guansss/pixi-live2d-display) for integrating Live2D with PixiJS

## Troubleshooting

If the model doesn't load:
1. Check browser console for errors
2. Ensure all model files are in the correct location
3. Make sure you're using a web server (not opening the HTML file directly)
4. Check if your browser supports WebGL
5. Try using a different browser (Chrome or Firefox recommended)
6. Clear your browser cache and reload the page

## License

Please note that the Live2D model may have its own licensing terms. Make sure you have the right to use and display the model. 