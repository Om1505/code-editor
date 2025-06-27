import "./index.scss";
import { useCallback, useState } from "react";
import { makeSubmission } from "./service";
import { EditorContainer1 } from "./EditorContainer1";
import { FaPaperPlane } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import axios from 'axios';

export const PlaygroundScreen1 = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
    const [loading, setLoading] = useState(false);
  const importInput = (e) => {
    const file = e.target.files[0];
    const fileType = file.type.includes("text");
    if (fileType) {
      const fileReader = new FileReader();
      fileReader.readAsText(file);
      fileReader.onload = (e) => {
        setInput(e.target.result);
      };
    } else {
      alert("Please choose a program file");
    }
  };

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

  const callback = ({ apiStatus, data, message }) => {
    if (apiStatus === "loading") {
      setShowLoader(true);
    } else if (apiStatus === "error") {
      setShowLoader(false);
      setOutput("Something went wrong");
    } else {
      if (data.status.id === 3) {
        setShowLoader(false);
        setOutput(atob(data.stdout));
      } else {
        setShowLoader(false);
        setOutput(atob(data.stderr));
      }
    }
  };

  const runCode = useCallback(
    ({ code, language }) => {
      makeSubmission({ code, language, stdin: input, callback });
    },
    [input]
  );

  const handleSendMessage = async () => {
    if (chatInput.trim()) {
      const newMessages = [...messages, { text: chatInput, user: true }];
      setMessages(newMessages);
      setInput('');

      try {
        setLoading(true);
        const response = await axios.post(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY2}`,
  {
    contents: [
      {
        parts: [{ text: chatInput }],
      },
    ],
  }
);

        console.log(response);
        const botResponse = response.data.candidates[0].content.parts[0].text;
        setLoading(false);
        setMessages([...newMessages, { text: botResponse, user: false }]);
      } catch (error) {
        console.error('Error sending message:', error);
        setLoading(false);
        setMessages([...newMessages, { text: 'Error: Could not get response from AI', user: false }]);
      }
    }
  };

  return (
    <div className="playground-container">
      <div className="header-container1">
        <nav>
          <button className="btn-login">Login</button>
        </nav>
      </div>
      <div className="content-container">
        <div className="editor-container">
          <EditorContainer1 runCode={runCode} />
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
          <textarea readOnly value={output} onChange={(e) => setOutput(e.target.value)}></textarea>
          {/* Add the Chat Button */}
          <button
            className="chat-button"
            onClick={() => setIsChatVisible(true)}
          >
            Open Chat
          </button>
        </div>
      </div>
      {showLoader && (
        <div className="fullpage-loader">
          <div className="loader"></div>
        </div>
      )}
      {/* Popup Chat Box */}
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
