import "./index.scss";
import { useState } from "react";
import { makeSubmission } from "./service";
import { EditorContainer1 } from "./EditorContainer1";
import { FaPaperPlane } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import axios from "axios";

export const PlaygroundScreen1 = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // -----------------------------
  // Import Input
  // -----------------------------
  const importInput = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.includes("text")) {
      alert("Please choose a text file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      setInput(event.target.result);
    };

    reader.readAsText(file);
  };

  // -----------------------------
  // Export Output
  // -----------------------------
  const exportOutput = () => {
    if (!output.trim()) {
      alert("Output is Empty");
      return;
    }

    const blob = new Blob([output], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "output.txt";
    link.click();

    URL.revokeObjectURL(url);
  };

  // -----------------------------
  // Run Code
  // -----------------------------
  const runCode = async ({ code, language }) => {
    setLoading(true);
    setShowLoader(true);
    setOutput("Executing...");

    const languageMap = {
      cpp: 54,
      python: 71,
      javascript: 63,
      java: 62,
    };

    const payload = {
      language_id: languageMap[language],
      source_code: btoa(code || ""),
      stdin: btoa(input || ""),
    };

    try {
      const result = await makeSubmission(payload);

      if (result.status.description === "Accepted") {
        setOutput(result.stdout || "");
      } else {
        setOutput(result.stderr || "Compilation Error");
      }
    } catch (err) {
      console.error(err);
      setOutput("Execution Failed");
    } finally {
      setLoading(false);
      setShowLoader(false);
    }
  };

  // -----------------------------
  // Chat Bot
  // -----------------------------
  const handleSendMessage = async () => {
  if (!chatInput.trim()) return;

  const currentPrompt = chatInput;

  const newMessages = [
    ...messages,
    {
      text: currentPrompt,
      user: true,
    },
  ];

  setMessages(newMessages);
  setChatInput("");

  try {
    const { data } = await axios.post(
      "http://localhost:5000/api/v1/gemini/chat",
      {
        prompt: currentPrompt,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    setMessages([
      ...newMessages,
      {
        text: data.reply,
        user: false,
      },
    ]);
  } catch (err) {
    console.error("Gemini Error:", err);

    setMessages([
      ...newMessages,
      {
        text:
          err.response?.data?.message ||
          "Error: Could not get response from AI.",
        user: false,
      },
    ]);
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
          <EditorContainer1
            runCode={runCode}
          />
        </div>

        {/* INPUT */}

        <div className="input-output-container">
          <div className="input-header">
            <b>Input:</b>

            <label
              htmlFor="input-file"
              className="icon-container"
            >
              <span className="material-icons">
                cloud_upload
              </span>

              <b>Import Input</b>
            </label>

            <input
              id="input-file"
              type="file"
              style={{ display: "none" }}
              onChange={importInput}
            />
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* OUTPUT */}

        <div className="input-output-container">
          <div className="input-header">
            <b>Output:</b>

            <button
              className="icon-container"
              onClick={exportOutput}
            >
              <span className="material-icons">
                cloud_download
              </span>

              <b>Export Output</b>
            </button>
          </div>

          <textarea
            readOnly
            value={output}
          />

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

      {/* CHAT POPUP */}

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
                className={`message ${
                  msg.user ? "user" : "bot"
                }`}
              >
                <ReactMarkdown>
                  {msg.text}
                </ReactMarkdown>
              </div>
            ))}

          </div>

          <div className="chat-footer">

            <input
              type="text"
              placeholder="Type your message..."
              value={chatInput}
              onChange={(e) =>
                setChatInput(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
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