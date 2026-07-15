import axios from "axios";

const LANGUAGE_MAP = {
  54: "cpp",
  71: "python3",
  63: "nodejs",
};

export const makeSubmission = async (payload) => {
  try {
    // Decode the Base64 values coming from the editor
    const decodedCode = atob(payload.source_code);
    const decodedStdin = payload.stdin ? atob(payload.stdin) : "";

    const language = LANGUAGE_MAP[payload.language_id];

    if (!language) {
      return {
        stdout: "",
        stderr: "Unsupported Language",
        status: {
          description: "Error",
        },
      };
    }

    const response = await axios.post(
      "http://localhost:5000/execute",
      {
        script: decodedCode,
        language: language,
        versionIndex: "0",
        stdin: decodedStdin,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      stdout: response.data.output || "",
      stderr: response.data.error || "",
      status: {
        description:
          response.data.statusCode === 200 ? "Accepted" : "Error",
      },
    };
  } catch (error) {
    console.error("Execution Error:", error);

    return {
      stdout: "",
      stderr:
        error.response?.data?.error ||
        "Unable to connect to execution server.",
      status: {
        description: "Error",
      },
    };
  }
};