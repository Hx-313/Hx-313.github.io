// Imgur anonymous upload — no account needed
// Usage: node imgur-upload.js <local_image_path>
// Output: JSON { directUrl, pageUrl }
// Use pageUrl in tweets for OG image card rendering.

const fs = require('fs');
const https = require('https');

// IMGUR_CLIENT_ID is REQUIRED. Get a free one in 30 seconds:
//   1. Go to https://api.imgur.com/oauth2/addclient
//   2. Choose "Anonymous usage without user authorization"
//   3. Set the env var: export IMGUR_CLIENT_ID="<your_client_id>"
// Do NOT hardcode shared/public Client-IDs — they get rate-limited or revoked.
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
if (!IMGUR_CLIENT_ID) {
  console.error('Error: IMGUR_CLIENT_ID env var is required.');
  console.error('Register a free Client-ID at https://api.imgur.com/oauth2/addclient');
  console.error('Then run: export IMGUR_CLIENT_ID="<your_client_id>"');
  process.exit(1);
}

function uploadToImgur(imagePath) {
  return new Promise((resolve, reject) => {
    const imageData = fs.readFileSync(imagePath);
    const base64Data = imageData.toString('base64');
    const postData = JSON.stringify({ image: base64Data, type: 'base64' });

    const options = {
      hostname: 'api.imgur.com',
      port: 443,
      path: '/3/image',
      method: 'POST',
      headers: {
        'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.success) {
            resolve({
              directUrl: parsed.data.link,                 // https://i.imgur.com/{id}.png
              pageUrl: `https://imgur.com/${parsed.data.id}`, // <-- USE THIS in tweets
              id: parsed.data.id,
            });
          } else {
            reject(new Error('Imgur upload failed: ' + data));
          }
        } catch (e) {
          reject(new Error('Imgur response parse error: ' + data));
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

if (require.main === module) {
  const path = process.argv[2];
  if (!path) {
    console.error('Usage: node imgur-upload.js <local_image_path>');
    process.exit(1);
  }
  uploadToImgur(path)
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}

module.exports = { uploadToImgur };
