import './App.css';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Analytics } from "@vercel/analytics/react"

const App = () => {

  const [token, setToken] = useState("");
  const site = window.location.href.substring(0, window.location.href.indexOf(":", "http://".length-1));
  const api = `${site}/api`

  const [lastExportText, setLET] = useState("");

  const [status, setStatusElem] = useState('Status: Idle');

  const [generatedLink, setGenLink] = useState('');
  const [pipMode, setPiPMode] = useState(false);

  //useEffect(() => {
  //  setToken(localStorage.getItem("web-bp-token") ?? "");
  //});

  const setStatus = (st) => {
    setStatusElem("Status: " + st);
  }

  const getToken = async () => {
    try {
      const result = await axios.post(api + "/init");
      setToken(result.data.token);
      return result.data.token;
      //localStorage.setItem("web-bp-token", result.data.token);
    } catch (error) {
      alert('Failed to get the sharing token: ', error);
      return "";
    };
  };

  const getBPData = async(link, overrideToken = "") => {
    if (!link.startsWith("https://")) link = "https://" + link;

    if (!link.startsWith("https://sharing.spaceflightsimulator.app/rocket/")) return false; // invalid link check
    
    if (token === "" && overrideToken === "") return false;

    const params = {
      rocketLink: link,
      clientToken: token === "" ? overrideToken : token
    };

    try {
      const result = await axios.post(api + "/rocket", params);

      console.log(result.data);
      if (result.data.success) {
        document.querySelector("#editor").value = (
          JSON.stringify(
            JSON.parse(
              atob(result.data.b64data)
            ), null, 2));
      } else {
        alert("Couldn't download blueprint data. Either the sharing system is down or recently changed.");
      };
    } catch (error) {
      console.error("Failed to download the blueprint: " + error);
      return false;
    }

    return true;
  };


  const importBP = async (overrideLink = null) => {
    let tok = "";
    if (token === "") {
      setStatus("Initializing sharing");
      tok = await getToken();
      if (tok === "") {
        setStatus("Import failed");
        setTimeout(() => { setStatus("Idle");}, 2000);
        return;
      }
    }
    setStatus("Downloading blueprint data");
    
    let l = overrideLink === null ? document.querySelector("#inputLink").value : overrideLink;

    console.log(l);

    if (await getBPData(l, tok))
      setStatus("Done!");
    else
      setStatus("Import failed");
    setTimeout(() => { setStatus("Idle");}, 2000);
  };

  const exportBP = async () => {
    let overrideTok = null;
    if (token === "") {
      setStatus("Initializing sharing");
      overrideTok = await getToken();
    }
    let link = await generateLink();
    setStatus("Generating link...")
    if (link[0]) {
      setStatus("Done!");
      setLET(document.querySelector("#editor").value);
    }
    else
      setStatus("Export failed");
    setTimeout(() => { setStatus("Idle");}, 2000);

    return link[1];
  };

  const generateBPData = () => {
    try {
      return btoa(JSON.stringify(JSON.parse(document.querySelector("#editor").value)))
    } catch (e) {
      console.log(e);
      return "";
    };
  };

  const generateLink = async (tok = null) => {
    const t = generateBPData();

    if (t === "") {
      alert("Invalid BP!");
      return [false, ""];
    };

    const body = {
      token: tok === null ? token : tok,
      data: t
    };
    try {
      console.log("Trying to generate link...");
      const result = await axios.post(api + "/upload", body);
      setGenLink(result.data.url);
      return [true, result.data.url];
    } catch (error) {
      alert('generateLink() error: ', error);
      return [false, ""];
    };
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
  }

  const openSFS = async () => {
    let link = await exportBP();
    console.log(link);
    let s = (link === null ? generatedLink : link).split("/");
    window.open(`sfs://rocket/${s[s.length - 1]}`);
  }

  const pasteImport = () => {
    navigator.clipboard.readText().then(async (text) => {
      await importBP(text);
    });
  }

  return (
    <div className="App" id={pipMode && "fullscreen-app"}>
      {!pipMode &&
      <div className="pip-disable">
        <div className="title">WebBP</div>
        <div className="uploadHolder">
          <input id="inputLink" placeholder="BP link"></input>
          <button id="importBtn" onClick={() => {importBP();}}>Import</button>
        </div>
      </div>
      }

      {pipMode &&
        <div id="pip-close">
          <button onClick={() => {setPiPMode(false);}}>x</button>
        </div>
      }
      
      <div className="editor-holder">
        <textarea id="editor" className={pipMode ? 'fullscreen-editor' : 'normal-editor'} name=""></textarea>
      </div>

      {pipMode &&
        <div id="pip-bar">
          <button onClick={() => {pasteImport();}}>Paste & Import</button>
          <button onClick={() => {openSFS();}}>Export to SFS</button>
        </div>
      }

      {!pipMode &&
      <div className="pip-disable">
        <div id="status">{status}</div>
        <div className="exportHolder">
          <div className="genLink">
            <button onClick={() => {exportBP();}}>Export</button>
            <input type="text" value={generatedLink} placeholder="Exported link" readOnly="1"></input>
          </div>
        </div>
        <div className="bpActions">
          <button onClick={() => {copyLink();}}>Copy link</button>
          <button onClick={() => {openSFS();}}>Open SFS with link</button>
        </div>
        <div className="pip-toggle">
          <input type="checkbox" id="pip" onChange={(elem) => {setPiPMode(elem.target.checked); console.log(elem.target.checked);}} /> Picture-in-Picture mode
        </div>
        <div className="author">Made with ❤️ by VerdiX094 in 2024</div>
      </div>
      }
      <Analytics/>
    </div>
  );
}

export default App;