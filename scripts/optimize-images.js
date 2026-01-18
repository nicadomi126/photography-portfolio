const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'images');
const OPTIMIZED_DIR = path.join(__dirname, '..', 'images-optimized');

// Configuration
const CONFIG = {
  // Main gallery image (what users see in the grid)
  gallery: {
    width: 1200,
    quality: 80,
  },
  // Full-size for lightbox viewing
  full: {
    width: 2400,
    quality: 85,
  },
  // Thumbnail for faster initial load
  thumb: {
    width: 400,
    quality: 75,
  }
};

const isDryRun = process.argv.includes('--dry-run');

async function getImageFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...await getImageFiles(fullPath));
    } else if (/\.(jpe?g|png)$/i.test(item.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function optimizeImage(inputPath, outputDir) {
  const relativePath = path.relative(IMAGES_DIR, inputPath);
  const dirName = path.dirname(relativePath);
  const baseName = path.basename(inputPath, path.extname(inputPath));

  const targetDir = path.join(outputDir, dirName);

  if (!isDryRun) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const originalSize = fs.statSync(inputPath).size;
  const originalSizeMB = (originalSize / 1024 / 1024).toFixed(2);

  console.log(`\nProcessing: ${relativePath} (${originalSizeMB} MB)`);

  if (isDryRun) {
    console.log(`  [DRY RUN] Would create gallery, full, and thumb versions`);
    return { original: originalSize, optimized: 0 };
  }

  let totalOptimized = 0;

  // Gallery size (main display)
  const galleryPath = path.join(targetDir, `${baseName}.jpg`);
  await sharp(inputPath)
    .resize(CONFIG.gallery.width, null, { withoutEnlargement: true })
    .jpeg({ quality: CONFIG.gallery.quality, progressive: true })
    .toFile(galleryPath);
  const gallerySize = fs.statSync(galleryPath).size;
  totalOptimized += gallerySize;
  console.log(`  Gallery: ${(gallerySize / 1024).toFixed(0)} KB`);

  // Full size (lightbox)
  const fullPath = path.join(targetDir, `${baseName}-full.jpg`);
  await sharp(inputPath)
    .resize(CONFIG.full.width, null, { withoutEnlargement: true })
    .jpeg({ quality: CONFIG.full.quality, progressive: true })
    .toFile(fullPath);
  const fullSize = fs.statSync(fullPath).size;
  totalOptimized += fullSize;
  console.log(`  Full: ${(fullSize / 1024).toFixed(0)} KB`);

  // Thumbnail
  const thumbPath = path.join(targetDir, `${baseName}-thumb.jpg`);
  await sharp(inputPath)
    .resize(CONFIG.thumb.width, null, { withoutEnlargement: true })
    .jpeg({ quality: CONFIG.thumb.quality, progressive: true })
    .toFile(thumbPath);
  const thumbSize = fs.statSync(thumbPath).size;
  totalOptimized += thumbSize;
  console.log(`  Thumb: ${(thumbSize / 1024).toFixed(0)} KB`);

  return { original: originalSize, optimized: totalOptimized };
}

async function main() {
  console.log('Image Optimization Script');
  console.log('=========================\n');

  if (isDryRun) {
    console.log('DRY RUN MODE - No files will be created\n');
  }

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Images directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  const imageFiles = await getImageFiles(IMAGES_DIR);
  console.log(`Found ${imageFiles.length} images to process`);

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of imageFiles) {
    try {
      const result = await optimizeImage(file, OPTIMIZED_DIR);
      totalOriginal += result.original;
      totalOptimized += result.optimized;
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
  }

  console.log('\n=========================');
  console.log('Summary:');
  console.log(`  Original total: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  if (!isDryRun) {
    console.log(`  Optimized total: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Savings: ${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%`);
    console.log(`\nOptimized images saved to: ${OPTIMIZED_DIR}`);
    console.log('\nNext steps:');
    console.log('1. Review the optimized images in images-optimized/');
    console.log('2. If satisfied, replace images/ with images-optimized/');
    console.log('3. Update HTML to use the new image naming convention');
  }
}

main().catch(console.error);
