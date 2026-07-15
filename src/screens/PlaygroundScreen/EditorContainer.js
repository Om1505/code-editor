import { useContext, useRef, useState } from "react";
import "./EditorContainer.scss";
import Editor from "@monaco-editor/react";
import { PlaygroundContext } from "../../Providers/PlaygrondProvider";

const editorOptions = {
  fontSize: 18,
  wordWrap: "on",
};

const fileExtensionMapping = {
  cpp: "cpp",
  javascript: "js",
  python: "py",
  java: "java",
};

export const EditorContainer = ({ fileId, folderId, runCode }) => {
  const {
    getLanguage,
    getDefaultCode,
    updateLanguage,
    saveCode,
  } = useContext(PlaygroundContext);

  const [code, setCode] = useState(() => {
    return getDefaultCode(fileId, folderId);
  });

  const [language, setLanguage] = useState(() =>
    getLanguage(fileId, folderId)
  );

  const [theme, setTheme] = useState("vs-dark");

  const codeRef = useRef(code);

  const [isFullScreen, setIsFullScreen] = useState(false);

  // FIXED
  const onChangeCode = (newCode) => {
    const updatedCode = newCode || "";
    setCode(updatedCode);
    codeRef.current = updatedCode;
  };

  const importCode = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const validExtensions = ["cpp", "js", "py", "java"];
    const fileExtension = file.name.split(".").pop();

    if (validExtensions.includes(fileExtension)) {
      const fileReader = new FileReader();

      fileReader.readAsText(file);

      fileReader.onload = (e) => {
        const importedCode = e.target.result;

        setCode(importedCode);
        codeRef.current = importedCode;
      };
    } else {
      alert(
        "Please choose a valid program file (.cpp, .js, .py, .java)"
      );
    }
  };

  const exportCode = () => {
    const codeValue = codeRef.current?.trim();

    if (!codeValue) {
      alert("Please type some code before exporting.");
      return;
    }

    const blob = new Blob([codeValue], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `code.${fileExtensionMapping[language]}`;

    link.click();

    URL.revokeObjectURL(url);
  };

  const onChangeLanguage = (e) => {
    const newLanguage = e.target.value;

    updateLanguage(fileId, folderId, newLanguage);

    const newCode = getDefaultCode(fileId, folderId);

    setLanguage(newLanguage);
    setCode(newCode);
    codeRef.current = newCode;
  };

  const onChangeTheme = (e) => {
    setTheme(e.target.value);
  };

  const onSaveCode = () => {
    saveCode(fileId, folderId, codeRef.current);
    alert("Code saved successfully.");
  };

  const fullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const onRunCode = () => {
    runCode({
      code: codeRef.current,
      language,
    });
  };

  return (
    <div
      className="root-editor-container"
      style={isFullScreen ? styles.fullScreen : {}}
    >
      <div className="editor-header">
        <div className="editor-left-container">
          <b className="title">title of the card</b>

          <span className="material-icons">edit</span>

          <button onClick={onSaveCode}>
            Save Code
          </button>
        </div>

        <div className="editor-right-container">
          <select
            onChange={onChangeLanguage}
            value={language}
          >
            <option value="cpp">CPP</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
          </select>

          <select
            onChange={onChangeTheme}
            value={theme}
          >
            <option value="vs-dark">vs-dark</option>
            <option value="vs-light">vs-light</option>
          </select>
        </div>
      </div>

      <div className="editor-body">
        <Editor
          height="100%"
          language={language}
          theme={theme}
          options={editorOptions}
          value={code}
          onChange={onChangeCode}
        />
      </div>

      <div className="editor-footer">
        <button
          className="btn"
          onClick={fullScreen}
        >
          <span className="material-icons">
            fullscreen
          </span>

          <span>
            {isFullScreen ? "Minimize" : "Full Screen"}
          </span>
        </button>

        <label
          htmlFor="import-code"
          className="btn"
        >
          <span className="material-icons">
            cloud_download
          </span>

          <span>Import Code</span>
        </label>

        <input
          id="import-code"
          type="file"
          style={{ display: "none" }}
          onChange={importCode}
        />

        <button
          className="btn"
          onClick={exportCode}
        >
          <span className="material-icons">
            cloud_upload
          </span>

          <span>Export Code</span>
        </button>

        <button
          className="btn"
          onClick={onRunCode}
        >
          <span className="material-icons">
            play_arrow
          </span>

          <span>Run Code</span>
        </button>
      </div>
    </div>
  );
};

const styles = {
  fullScreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
};