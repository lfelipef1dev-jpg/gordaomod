const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, 'dist');
if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist, { recursive: true });
}

const filesToCopy = [
  'index.html',
  'style.css',
  'style-gordao.css',
  'app.js',
  'robots.txt',
  '_headers',
  'checkout-scripts.html',
  'download-spoofer.html',
  'ficha-spoofer.html',
  'recursos-fivem.html',
];

filesToCopy.forEach(file => {
  const src = path.join(__dirname, file);
  const dest = path.join(dist, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
});

const assetsSrc = path.join(__dirname, 'assets');
const assetsDest = path.join(dist, 'assets');
if (fs.existsSync(assetsSrc)) {
  fs.cpSync(assetsSrc, assetsDest, { recursive: true });
}

console.log('Build concluido em dist/');
