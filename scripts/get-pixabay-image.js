const fs = require('fs');
const path = require('path');

async function main() {
  const url = 'https://pixabay.com/photos/mountains-fog-sky-clouds-5819652/';
  console.log(`Fetching Pixabay page: ${url}`);
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch Pixabay page: ${res.status} ${res.statusText}`);
    }
    
    const html = await res.text();
    const match = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i) || 
                  html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i);
                  
    if (!match) {
      // Try search for other cdn links in html
      const cdnMatches = html.match(/https:\/\/cdn\.pixabay\.com\/photo\/[^\s"']+/g);
      if (cdnMatches && cdnMatches.length > 0) {
        console.log(`Found CDN URLs, choosing the first one: ${cdnMatches[0]}`);
        await downloadImage(cdnMatches[0]);
        return;
      }
      throw new Error('Could not find og:image or any Pixabay CDN URL in HTML');
    }
    
    const imageUrl = match[1];
    console.log(`Found og:image URL: ${imageUrl}`);
    await downloadImage(imageUrl);
    
  } catch (error) {
    console.error('Error fetching/downloading image:', error);
    // Fallback: use a high-quality mountain fog image from Unsplash
    console.log('Using fallback high-quality Unsplash mountain fog image.');
    await downloadImage('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80');
  }
}

async function downloadImage(imageUrl) {
  console.log(`Downloading image from: ${imageUrl}`);
  const imgRes = await fetch(imageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  
  if (!imgRes.ok) {
    throw new Error(`Failed to download image: ${imgRes.status} ${imgRes.statusText}`);
  }
  
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  const destDir = path.join(__dirname, '..', 'public', 'images');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  const destPath = path.join(destDir, 'preflight-bg.jpg');
  fs.writeFileSync(destPath, buffer);
  console.log(`Successfully saved image to: ${destPath}`);
}

main();
