const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Define directories
const baseDir = __dirname;
const bigDir = path.join(baseDir, 'assets', 'images', 'releases', 'big');
const smallDir = path.join(baseDir, 'assets', 'images', 'releases', 'small');

console.log(`Script running from: ${baseDir}`);
console.log(`Big directory path: ${bigDir}`);
console.log(`Small directory path: ${smallDir}`);

// Check directory access
try {
  // Check if we can access the big directory
  fs.accessSync(bigDir, fs.constants.R_OK);
  console.log('Big directory is accessible for reading');
} catch (err) {
  console.error(`Cannot access big directory: ${err.message}`);
}

// Ensure small directory exists
try {
  if (!fs.existsSync(smallDir)) {
    fs.mkdirSync(smallDir, { recursive: true });
    console.log('Created small directory');
  } else {
    console.log('Small directory already exists');
    try {
      fs.accessSync(smallDir, fs.constants.W_OK);
      console.log('Small directory is writable');
    } catch (err) {
      console.error(`Cannot write to small directory: ${err.message}`);
    }
  }
} catch (err) {
  console.error(`Error with small directory: ${err.message}`);
}

// Clean small directory
try {
  const smallFiles = fs.readdirSync(smallDir);
  for (const file of smallFiles) {
    const filePath = path.join(smallDir, file);
    if (fs.statSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
    }
  }
} catch (err) {
  console.error(`Error cleaning small directory: ${err.message}`);
}

// Process each big image
(async () => {
  try {
    console.log(`Looking for images in: ${bigDir}`);
    const files = fs.readdirSync(bigDir);
    console.log(`Found ${files.length} files in big directory`);
    
    for (const filename of files) {
      const imgPath = path.join(bigDir, filename);
      console.log(`Processing: ${filename}`);
      
      if (!fs.statSync(imgPath).isFile()) {
        console.log(`Skipping non-file: ${filename}`);
        continue;
      }
      
      try {
        // Get file name and create small name
        const name = path.parse(filename).name;
        const ext = path.parse(filename).ext;
        
        // Replace _big with _small in filename
        let smallName;
        if (name.includes('_big')) {
          smallName = name.replace('_big', '_small');
        } else {
          smallName = `${name}_small`;
        }
        
        const smallPath = path.join(smallDir, `${smallName}${ext}`);
        
        // Get image metadata
        const metadata = await sharp(imgPath).metadata();
          // Calculate new dimensions (500px width)
        const width = 500;
        const height = Math.round(metadata.height * (width / metadata.width));
        console.log(`Resizing to ${width}x${height}`);
        
        // Resize and save
        await sharp(imgPath)
          .resize(width, height)
          .toFile(smallPath);
        
        console.log(`Resized: ${filename} -> ${smallName}${ext}`);
        
        // Verify the file was created
        if (fs.existsSync(smallPath)) {
          console.log(`Verified: ${smallName}${ext} was created successfully`);
        } else {
          console.log(`Warning: ${smallName}${ext} was not created`);
        }
      } catch (e) {
        console.error(`Error processing ${filename}: ${e.message}`);
      }
    }
    
    console.log("Image resizing completed.");
  } catch (err) {
    console.error(`Error reading directory: ${err.message}`);
  }
})();
