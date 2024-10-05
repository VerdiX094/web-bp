import './App.css';
import axios from 'axios';
import { useState } from 'react';

const App = () => {
  let token = "";
  const [link, setLink] = useState("");
  const api = 'http://localhost:5000/api'

  const [text, setText] = useState(''); // Initial value can be empty or pre-populated
  const [status, setStatusElem] = useState('Status: Idle');

  const [generatedLink, setGenLink] = useState('')

  const setStatus = (st) => {
    setStatusElem("Status: " + st);
  }

  // Step 2: Function to handle changes in the textarea
  const handleTextChange = (event) => {
    setText(event.target.value); // Update state with the new value from the textarea
  };

  const getToken = async () => {
    try {
      const result = await axios.post(api + "/init");
      token = result.data.token;
      console.log(result.data.token);
    } catch (error) {
      alert('getToken() error: ', error);
    };
  };

  const getBPData = async() => {
    if (!link.startsWith("https://")) setLink("https://" + link);

    if (!link.startsWith("https://sharing.spaceflightsimulator.app/rocket/")) return; // invalid link check
    
    if (token === "") return;

    const params = {
      rocketLink: link,
      clientToken: token
    };

    try {
      const result = await axios.post(api + "/rocket", params);

      console.log(result.data);
      if (result.data.success) {
        setText(
          JSON.stringify(
            JSON.parse(
              atob(result.data.b64data)
            ), null, 2));
      } else {
        alert("Couldn't download blueprint data. Either the sharing system is down or recently changed.");
      };
    } catch (error) {
      console.error("getBPData() error: " + error);
    }
  };

  const onLinkChange = (e) => {
    setLink(e.target.value);
  };


  const importBP = async () => {
    if (token == "") {
      setStatus("Initializing sharing");
      await getToken();
    }
    setStatus("Downloading blueprint data");
    await getBPData();
    setStatus("Done!");
    setTimeout(() => { setStatus("Idle");}, 2000);
  };

  const exportBP = async () => {
    if (token == "") {
      setStatus("Initializing sharing");
      await getToken();
    }
    generateLink();
    setStatus("Done!");
    setTimeout(() => { setStatus("Idle");}, 2000)
  };

  const generateBPData = () => {
    try {
      return btoa(JSON.stringify(JSON.parse(text)))
    } catch (e) {
      console.log(e);
      return "";
    };
  };

  const generateLink = async () => {
    const t = generateBPData();

    if (t === "") {
      alert("Invalid BP!");
      return;
    };

    const body = {
      token: token,
      data: t
    };
    try {
      console.log("Trying to generate link...");
      const result = await axios.post(api + "/upload", body);
      setGenLink(result.data.url);
    } catch (error) {
      alert('generateLink() error: ', error);
    };
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
  }

  return (
    <div className="App">
      <div className="title">WebBP</div>
      <div className="uploadHolder">
        <input id="inputLink" placeholder="BP link" onChange={onLinkChange}></input>
        <button id="importBtn" onClick={importBP}>Import</button>
      </div>
      <div className="status">{status}</div>
      <textarea id="editor" value={text} onChange={handleTextChange} name="" rows="16" cols="32"></textarea>
      <div className="exportHolder">
        <div class="genLink">
          <button onClick={exportBP}>Generate link</button>
          <input type="text" value={generatedLink} readOnly="true"></input>
        </div>
        <button onClick={copyLink}>Copy link</button>
        <button>Open SFS with link</button>
      </div>
    </div>
  );
}

export default App;
