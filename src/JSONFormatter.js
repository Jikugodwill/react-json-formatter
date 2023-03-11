import React, { useState } from "react";

function JSONFormatter() {
  const [jsonStr, setJsonStr] = useState("");
  const [prettifiedJson, setPrettifiedJson] = useState("");
  const [fixedErrors, setFixedErrors] = useState("");

  async function handleFormatClick() {
    let formattedJsonStr = "";
    let fixedErrors = "";
    try {
      // Validate input as JSON according to RFC 8259
      const jsonObj = JSON.parse(jsonStr);
      // Stringify the JSON object with indentation and sorting keys
      formattedJsonStr = JSON.stringify(jsonObj, null, 4);
    } catch (error) {
      // If parsing fails, try to fix common errors in the JSON string
      let fixedJsonStr = jsonStr
        // Fix missing quotes around property names
        .replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, (match, p1, p2) => {
          fixedErrors += `Missing quotes around "${p2}"\n`;
          return `${p1}"${p2}":`;
        })
        // Fix trailing commas in arrays and objects
        .replace(/,(?=\s*([}\]]))/g, (match) => {
          fixedErrors += `Trailing comma removed\n`;
          return "";
        })
        // Fix single quotes around property names and string values
        .replace(/'/g, (match) => {
          fixedErrors += `Single quotes replaced with double quotes\n`;
          return '"';
        })
        // Fix unquoted property values
        .replace(
          /([{,]\s*)([a-zA-Z0-9_$]+)\s*:\s*([a-zA-Z0-9_$]+)\s*(?=([,}]))/g,
          (match, p1, p2, p3, p4) => {
            fixedErrors += `Unquoted value "${p3}" surrounded with quotes\n`;
            return `${p1}"${p2}":"${p3}"${p4}`;
          }
        )
        // Fix invalid escape sequences in string values
        .replace(/\\([^"\\/bfnrtu])/g, (match, p1) => {
          fixedErrors += `Invalid escape sequence "\\${p1}" removed\n`;
          return "";
        });
      try {
        // Try to parse the fixed JSON string
        const jsonObj = JSON.parse(fixedJsonStr);
        // Stringify the JSON object with indentation and sorting keys
        formattedJsonStr = JSON.stringify(jsonObj, null, 4);
      } catch (error) {
        // If parsing still fails, return an error message
        formattedJsonStr = `Error: ${error.message}`;
      }
    }
    setPrettifiedJson(formattedJsonStr);
    setFixedErrors(fixedErrors);
  }

  async function handleFileDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    const fileReader = new FileReader();
    fileReader.onload = function () {
      const fileData = fileReader.result;
      setJsonStr(fileData);
      setPrettifiedJson("");
      setFixedErrors("");
    };
    fileReader.readAsText(file);
  }

  async function handleFileUpload(event) {
    const file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.onload = function () {
      const fileData = fileReader.result;
      setJsonStr(fileData);
      setPrettifiedJson("");
      setFixedErrors("");
    };
    fileReader.readAsText(file);
  }

  async function handleUrlInput(event) {
    const url = event.target.value;
    try {
      const response = await fetch(url);
      const jsonData = await response.json();
      const jsonStr = JSON.stringify(jsonData, null, 4);
      setJsonStr(jsonStr);
      setPrettifiedJson("");
      setFixedErrors("");
    } catch (error) {
      console.error(error);
      setJsonStr("");
      setPrettifiedJson("Error: Failed to fetch JSON data from URL");
      setFixedErrors("");
    }
  }

  const handleCopyClick = () => {
    navigator.clipboard.writeText(prettifiedJson);
  };

  const fileDownloadHandler = () => {
    const element = document.createElement("a");
    const file = new Blob([prettifiedJson], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "formatted.json";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div>
      <div className="input-container">
        <h3>Input JSON data</h3>
        <textarea
          className="json-input"
          rows="10"
          value={jsonStr}
          onChange={(event) => setJsonStr(event.target.value)}
          onDrop={handleFileDrop}
          onDragOver={(event) => event.preventDefault()}
          placeholder="Enter or drop JSON data here..."
        />
        <div className="input-actions">
          <input type="file" accept=".json" onChange={handleFileUpload} />
          <input
            type="text"
            placeholder="Enter URL to fetch JSON data"
            onBlur={handleUrlInput}
          />
        </div>
      </div>
      <button onClick={handleFormatClick}>Format JSON</button>
      {prettifiedJson && (
        <>
          <div className="output-container">
            <h3>Formatted JSON data</h3>
            {fixedErrors && (
              <div className="fixed-errors">
                <h3>Fixed errors</h3>
                <pre>{fixedErrors}</pre>
              </div>
            )}
            <textarea
              className="json-output"
              rows="10"
              value={prettifiedJson}
              readOnly
            />
          </div>

          <div className="output-actions">
            <button onClick={handleCopyClick}>Copy to clipboard</button>
            <button onClick={fileDownloadHandler}>Download as file</button>
          </div>
        </>
      )}
    </div>
  );
}

export default JSONFormatter;
