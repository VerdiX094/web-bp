const fetch = require('node-fetch');
const zlib = require('zlib');

const userAgent = "s&1FS&xdkf2r5k9p2zU!PDYXW$bqae";

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { rocketLink, clientToken } = req.body;
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
  };

  if (!sfsResponse.ok) {
    console.error(`Response status: ${sfsResponse.status}`);
    return res.json(data);
  } else {
    const json = await sfsResponse.json();
    const gzippedBuffer = Buffer.from(json.data, 'base64');

    zlib.gunzip(gzippedBuffer, (err, decompressedBuffer) => {
      if (err) {
        console.error('Error during decompression:', err);
        return;
      }

      const base64Reencoded = decompressedBuffer.toString('base64');
      data.success = true;
      data.b64data = base64Reencoded;
      res.json(data);
    });
  }
};
