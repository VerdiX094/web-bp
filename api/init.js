const fetch = require('node-fetch');

const userAgent = "s&1FS&xdkf2r5k9p2zU!PDYXW$bqae";

function generateRandomHex() {
  let hex = '';
  for (let i = 0; i < 32; i++) {
    hex += Math.floor(Math.random() * 16).toString(16);
  }
  return hex;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const response = await fetch("https://sharing.spaceflightsimulator.app/api/users/create", {
    method: "POST",
    headers: {
      "User-Agent": userAgent,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ platform_id: generateRandomHex() })
  });

  let t = "";
  if (!response.ok) {
    console.error(`Response status: ${response.status}`);
  } else {
    const json = await response.json();
    console.log(json.login_token);
    t = json.login_token;
  }

  res.json({ token: t });
};
