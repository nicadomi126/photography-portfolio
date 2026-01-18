const fs = require('fs');
const path = require('path');

const COLLECTIONS_DIR = path.join(__dirname, '..', 'collections');

const folders = fs.readdirSync(COLLECTIONS_DIR).filter(f =>
  fs.statSync(path.join(COLLECTIONS_DIR, f)).isDirectory()
);

folders.forEach(folder => {
  const descPath = path.join(COLLECTIONS_DIR, folder, 'Description.txt');
  const indexPath = path.join(COLLECTIONS_DIR, folder, 'index.html');

  if (!fs.existsSync(descPath) || !fs.existsSync(indexPath)) {
    console.log(`Skipping ${folder} - missing files`);
    return;
  }

  const description = fs.readFileSync(descPath, 'utf8').trim();
  let html = fs.readFileSync(indexPath, 'utf8');

  // Replace the collection-intro paragraph content
  html = html.replace(
    /<p class="collection-intro">\s*[\s\S]*?\s*<\/p>/,
    `<p class="collection-intro">\n                ${description}\n            </p>`
  );

  fs.writeFileSync(indexPath, html);
  console.log(`Updated: ${folder}`);
});

console.log('\nDone!');
