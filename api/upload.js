const fetch = require('node-fetch');
const zlib = require('zlib');

const userAgent = "s&1FS&xdkf2r5k9p2zU!PDYXW$bqae";

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { token, data } = req.body;
  const buffer = Buffer.from(data, 'base64');

  zlib.gzip(buffer, async (err, compressed) => {
    if (err) {
      console.error('Error during compression:', err);
      return;
    }

    const base64Reencoded = compressed.toString('base64');

    const response = await fetch("https://sharing.spaceflightsimulator.app/api/rockets/linked-upload", {
      method: "POST",
      headers: {
        "User-Agent": userAgent,
        "Login-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rocket_data: base64Reencoded,
        version: "1.5.10.2",
        preview_url: ""
      })
    });

    if (!response.ok) {
      console.error('Error during upload');
      res.status(500).json({ message: 'Error during upload' });
    } else {
      const jsonResponse = await response.json();
      res.json(jsonResponse);
    }
  });
};
