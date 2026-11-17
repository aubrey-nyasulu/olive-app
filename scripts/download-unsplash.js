const fs = require('fs');
const path = require('path');
const https = require('https');

const TARGET_DIR = path.join(__dirname, '..', 'assets', 'images');

const IMAGES = [
  {
    name: 'profile-avatar.jpg',
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200&q=80',
    desc: 'Chisomo Banda avatar portrait (smiling African woman)'
  },
  {
    name: 'profile-cover.jpg',
    url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    desc: 'Lilongwe savannah sunset cover'
  },
  {
    name: 'place-bakery.jpg',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    desc: 'Mabu Artisan Bakes (sourdough & croissants)'
  },
  {
    name: 'place-chambo.jpg',
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80',
    desc: 'Kachere Chambo (grilled fish with lemon & herbs)'
  },
  {
    name: 'place-concert.jpg',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    desc: 'Lingadzi Sessions (acoustic live music)'
  },
  {
    name: 'place-fuel.jpg',
    url: 'https://images.unsplash.com/photo-1572292232947-5ad5c1149260?auto=format&fit=crop&w=1200&q=80',
    desc: 'Puma Energy (modern fuel service station)'
  },
  {
    name: 'place-market.jpg',
    url: 'https://images.unsplash.com/photo-1557844352-761f2565b576?auto=format&fit=crop&w=1200&q=80',
    desc: 'Four Seasons / Old Town Market (tropical fruits)'
  },
  {
    name: 'place-pharmacy.jpg',
    url: 'https://images.unsplash.com/photo-1587829060826-13d274f72c6b?auto=format&fit=crop&w=1200&q=80',
    desc: 'Bwaila Community Pharmacy (dispensary & medicines)'
  },
  {
    name: 'place-ev-charge.jpg',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
    desc: 'Kondwani Banda coffee drop / cafe'
  },
  {
    name: 'place-coffee.jpg',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
    desc: 'Misuku single-origin coffee & bun'
  },
  {
    name: 'place-nature.jpg',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    desc: 'Lilongwe Wildlife Sanctuary golden hour nature walk'
  }
];

function downloadImage(item) {
  return new Promise((resolve, reject) => {
    const dest = path.join(TARGET_DIR, item.name);
    console.log(`Downloading ${item.name} (${item.desc})...`);
    
    function fetchUrl(currentUrl) {
      https.get(currentUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchUrl(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download ${item.name}: Status code ${res.statusCode}`));
          return;
        }
        const fileStream = fs.createWriteStream(dest);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          const stats = fs.statSync(dest);
          console.log(`✓ ${item.name} saved (${Math.round(stats.size / 1024)} KB)`);
          resolve();
        });
      }).on('error', (err) => {
        reject(err);
      });
    }

    fetchUrl(item.url);
  });
}

async function main() {
  console.log(`Saving Unsplash photography to ${TARGET_DIR}...`);
  for (const img of IMAGES) {
    try {
      await downloadImage(img);
    } catch (err) {
      console.error(`Error downloading ${img.name}:`, err.message);
    }
  }
  console.log('All Unsplash images downloaded successfully!');
}

main();
