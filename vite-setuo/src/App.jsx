import React, { useState } from "react";
import { URL, API_KEY } from "./Service";

function App() {
  const [Ques, setQues] = useState("");
  const [result, setResult] = useState(undefined);
  const [message, setMessage] = useState([{
    role : "assiantant", text : "How May I Help You?"},
])

  // Ask Question
const askQuestion = async () => {

  setMessage((mgs) => [...mgs, {role : "user", text : Ques}])


  try {
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: Ques || "Explain how AI works" }],
        },
      ],
    };

    let res = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("API Error:", data);
      return;
    }

    let dataString = data.candidates[0].content.parts[0].text;
    let parts = dataString.split(" * ").map(item => item.trim());
    let processedResult = parts.join("\n• ");

    setResult(processedResult);
  } catch (error) {
    console.error("Fetch Error:", error);
  }
};


  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-1/5 bg-zinc-800 text-center text-2xl text-white flex justify-center p-3">
        <span className="animate-pulse">Recent Search</span>
      </div>

      {/* Right Content */}
      <div className="w-4/5 bg-zinc-900 flex flex-col h-screen">
        {/* Response Display */}
        <div
          className="flex-1 w-full flex items-center justify-center"
          style={{ minHeight: 0 }}
        >
          <div
            className="w-full text-3xl font-bold text-transparent bg-clip-text
                       bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                       bg-[length:200%_200%] animate-gradient-x whitespace-pre-line overflow-auto px-8"
            style={{ maxHeight: "80vh" }}
          >
            {result}
          </div>
        </div>

        {/* Input + Button */}
        <div className="flex w-full justify-center items-center py-6 bg-zinc-900">
          <input
            type="text"
            placeholder="Ask Me Anything"
            className="px-4 py-2 w-80 bg-slate-700 text-white outline-none rounded-l-lg"
            value={Ques}
            onChange={(e) => setQues(e.target.value)}
          />
          <button
            className="px-7 py-2 bg-slate-700 text-white rounded-r-lg hover:bg-slate-600"
            onClick={askQuestion}
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
