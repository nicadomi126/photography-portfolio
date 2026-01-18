const fs = require('fs');
const path = require('path');

const COLLECTIONS_DIR = path.join(__dirname, '..', 'collections');

function addLazyLoading(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let imageCount = 0;

  // Add loading="lazy" to gallery images (skip first 2 for above-the-fold)
  content = content.replace(
    /<img src="([^"]+)" alt="([^"]+)">/g,
    (match, src, alt) => {
      imageCount++;
      // First 2 images load eagerly (above the fold)
      if (imageCount <= 2) {
        return match;
      }
      return `<img src="${src}" alt="${alt}" loading="lazy">`;
    }
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated: ${path.relative(COLLECTIONS_DIR, filePath)} (${imageCount} images, ${imageCount - 2} lazy)`);
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.name === 'index.html') {
      addLazyLoading(fullPath);
    }
  }
}

console.log('Adding lazy loading to collection pages...\n');
processDirectory(COLLECTIONS_DIR);
console.log('\nDone! First 2 images in each gallery load eagerly, rest are lazy-loaded.');
