const express = require('express');
const cors = require('cors');
const zlib = require('zlib')

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const userAgent = "s&1FS&xdkf2r5k9p2zU!PDYXW$bqae";

function generateRandomHex() {
    let hex = '';
    for (let i = 0; i < 32; i++) {
        hex += Math.floor(Math.random() * 16).toString(16);
    }
    return hex;
}

app.post('/api/init', async (req, res) => {
  const response = await fetch("https://sharing.spaceflightsimulator.app/api/users/create", {
    method: "POST",
    mode: "no-cors",
    body: `{"platform_id":"${generateRandomHex()}"}`,
    headers: {
    "User-Agent": userAgent,
    "Content-Type": "application/json",
    }
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
});

app.post('/api/rocket', async (req, res) => {
  const rocketLink = req.body.rocketLink
  const clientToken = req.body.clientToken;
  console.log("ROCKET DATA: \n" + rocketLink + "\n" + clientToken + "\nEND ROCKET DATA");

  const sfsResponse = await fetch(
    rocketLink.replace("/rocket/", "/api/rockets/"),
    {
      method: "GET",
      headers: {
        "Login-token": clientToken,
        "User-agent": userAgent
      }
    }
  );

  let data = {
    success: false,
    b64data: ""
  }

  if (!sfsResponse.ok) {
    console.error(`Response status: ${sfsResponse.status}`);
    res.json(data);
  } else {
    const json = await sfsResponse.json();

    const gzippedBuffer = Buffer.from(json.data, 'base64');

    zlib.gunzip(gzippedBuffer, (err, decompressedBuffer) => {
      if (err) {
        console.error('Error during decompression:', err);
        return;
      }
      
      const decompressedString = decompressedBuffer.toString('utf-8');
      const base64Reencoded = Buffer.from(decompressedString, 'utf-8').toString('base64');
      data.success = true;
      data.b64data = base64Reencoded;
      res.json(data);
    });
  }
});

app.post('/api/upload', async (req, res) => {

});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});