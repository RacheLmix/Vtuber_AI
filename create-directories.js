
   const fs = require('fs');
   const path = require('path');
   
   const soundsDir = path.join(__dirname, 'sounds');
   if (!fs.existsSync(soundsDir)) {
       fs.mkdirSync(soundsDir);
       console.log('Created sounds directory');
   }
   
   const voicesDir = path.join(__dirname, 'voices');
   if (!fs.existsSync(voicesDir)) {
       fs.mkdirSync(voicesDir);
       console.log('Created voices directory');
   }
   
   // Create placeholder sound files
   const createPlaceholderSound = (dir, name) => {
       const filePath = path.join(dir, `${name}.mp3`);
       if (!fs.existsSync(filePath)) {
           fs.writeFileSync(filePath, '');
           console.log(`Created placeholder for ${name}.mp3 in ${dir}`);
       }
   };
   
   // Create placeholders for sound effects
   createPlaceholderSound(soundsDir, 'laugh');
   createPlaceholderSound(soundsDir, 'greeting');
   createPlaceholderSound(soundsDir, 'surprise');
   createPlaceholderSound(soundsDir, 'sad');
   
   // Create placeholders for voice clips
   createPlaceholderSound(voicesDir, 'hello');
   createPlaceholderSound(voicesDir, 'hi_there');
   createPlaceholderSound(voicesDir, 'nice_to_meet_you');
   createPlaceholderSound(voicesDir, 'wow');
   createPlaceholderSound(voicesDir, 'amazing');
   createPlaceholderSound(voicesDir, 'oh_no');
   createPlaceholderSound(voicesDir, 'hehe');
   createPlaceholderSound(voicesDir, 'happy');
   createPlaceholderSound(voicesDir, 'sad');
   createPlaceholderSound(voicesDir, 'angry');
   createPlaceholderSound(voicesDir, 'surprised');
   
   console.log('Audio placeholders created. Replace these with actual audio files.');
   console.log('You can use the create-voices.html tool to generate voice files.');