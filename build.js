const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, 'dist');
if (!fs.existsSync(dist)) fs.mkdirSync(dist, { recursive: true });

const filesToCopy = [
  'index.html',
  'app.html',
  'style.css',
  'data.js',
  'views.js',
  'app.js',
  'robots.txt',
  'sitemap.xml',
  '_headers',
];

filesToCopy.forEach(file => {
  const src = path.join(__dirname, file);
  const dest = path.join(dist, file);
  if (fs.existsSync(src)) fs.copyFileSync(src, dest);
});

const assetsSrc = path.join(__dirname, 'assets');
const assetsDest = path.join(dist, 'assets');
if (fs.existsSync(assetsSrc)) fs.cpSync(assetsSrc, assetsDest, { recursive: true });

console.log('Build concluido em dist/');
