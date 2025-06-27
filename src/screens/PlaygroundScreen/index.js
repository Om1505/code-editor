import { useParams } from "react-router-dom";
import "./index.scss";
import { EditorContainer } from "./EditorContainer";
import { useCallback, useState } from "react";
import { makeSubmission } from "./service";
import ReactMarkdown from "react-markdown";
import { FaPaperPlane } from "react-icons/fa";

export const PlaygroundScreen = () => {
  const params = useParams();
  const { fileId, folderId } = params;

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [showLoader, setShowLoader] = useState(false);

  // Chatbot States
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // Import Input
  const importInput = (e) => {
    const file = e.target.files[0];
    if (file.type.includes("text")) {
      const fileReader = new FileReader();
      fileReader.readAsText(file);
      fileReader.onload = (e) => {
        setInput(e.target.result);
      };
    } else {
      alert("Please choose a program file");
    }
  };

  // Export Output
  const exportOutput = () => {
    const outputValue = output.trim();
    if (!outputValue) {
      alert("Output is Empty");
      return;
    }
    const blob = new Blob([outputValue], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `output.txt`;
    link.click();
  };

  // Callback for API Submission
  const callback = ({ apiStatus, data }) => {
    if (apiStatus === "loading") {
      setShowLoader(true);
    } else if (apiStatus === "error") {
      setShowLoader(false);
      setOutput("Something went wrong");
    } else {
      setShowLoader(false);
      if (data.status.id === 3) {
        setOutput(atob(data.stdout));
      } else {
        setOutput(atob(data.stderr));
      }
    }
  };

  // Run Code Handler
  const runCode = useCallback(
    ({ code, language }) => {
      makeSubmission({ code, language, stdin: input, callback });
    },
    [input]
  );

  // Chatbot Message Handler
  const handleSendMessage = async () => {
    if (chatInput.trim()) {
      const newMessages = [...messages, { text: chatInput, user: true }];
      setMessages(newMessages);
      setChatInput("");

      try {
        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=REACT_APP_GEMINI_API_KEY2",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: chatInput }] }],
            }),
          }
        );

        const data = await response.json();
        const botResponse =
          data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
        setMessages([...newMessages, { text: botResponse, user: false }]);
      } catch (error) {
        setMessages([
          ...newMessages,
          { text: "Error: Could not get a response from AI", user: false },
        ]);
      }
    }
  };

  return (
    <div className="playground-container">
      <div className="header-container">
        <img src="/logo.png" className="logo" alt="Logo" />
      </div>
      <div className="content-container">
        <div className="editor-container">
          <EditorContainer fileId={fileId} folderId={folderId} runCode={runCode} />
        </div>
        <div className="input-output-container">
          <div className="input-header">
            <b>Input:</b>
            <label htmlFor="input" className="icon-container">
              <span className="material-icons">cloud_upload</span>
              <b className="">Import Input</b>
            </label>
            <input
              type="file"
              id="input"
              style={{ display: "none" }}
              onChange={importInput}
            />
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}></textarea>
        </div>
        <div className="input-output-container">
          <div className="input-header">
            <b>Output:</b>
            <button className="icon-container" onClick={exportOutput}>
              <span className="material-icons">cloud_download</span>
              <b>Export Output</b>
            </button>
          </div>
          <textarea readOnly value={output}></textarea>
          <button className="chat-button" onClick={() => setIsChatVisible(true)}>
            Open Chat
          </button>
        </div>
      </div>
      {showLoader && (
        <div className="fullpage-loader">
          <div className="loader"></div>
        </div>
      )}
      {isChatVisible && (
        <div className="chat-popup">
          <div className="chat-header">
            <h2>AI ChatBot</h2>
            <button
              className="close-button"
              onClick={() => setIsChatVisible(false)}
            >
              ✖
            </button>
          </div>
          <div className="chat-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.user ? "user" : "bot"}`}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}
          </div>
          <div className="chat-footer">
            <input
              type="text"
              placeholder="Type your message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button onClick={handleSendMessage}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
