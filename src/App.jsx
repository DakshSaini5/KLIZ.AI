import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { URL, API_KEY } from "./Service"; 

function App() {
  const [Ques, setQues] = useState("");
  const [messages, setMessages] = useState([
    { role: "model", text: "How may I help you today?" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const askQuestion = async () => {
    if (!Ques.trim()) return;

    const userMessage = { role: "user", text: Ques };
    setMessages((prev) => [...prev, userMessage]);
    setQues("");
    setIsLoading(true);

    try {
      const historyForApi = messages.map((msg) => ({
        role: msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.text }],
      }));

      historyForApi.push({
        role: "user",
        parts: [{ text: userMessage.text }],
      });

      const payload = { contents: historyForApi };

      const res = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "API Error");
      }

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response generated.");
      }

      const aiText = data.candidates[0].content.parts[0].text;
      setMessages((prev) => [...prev, { role: "model", text: aiText }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `Sorry, I encountered an error: ${error.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") askQuestion();
  };

  return (
    <div className="flex h-screen bg-zinc-900 text-white font-sans">
      <div className="hidden md:flex flex-col w-64 bg-zinc-800 p-4 border-r border-zinc-700">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
          Kliz AI
        </h1>
        <div className="text-sm text-gray-400 uppercase tracking-wider mb-4">
          History
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 bg-zinc-700/50 rounded-lg text-sm mb-2 cursor-pointer hover:bg-zinc-700 transition">
            New Conversation
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl shadow-md ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-zinc-700 text-gray-100 rounded-tl-none"
                }`}
              >
                <div className="prose prose-invert max-w-none text-sm md:text-base leading-relaxed">
                  <ReactMarkdown
                    components={{
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-5 my-2" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal pl-5 my-2" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <span className="font-bold text-blue-300" {...props} />
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-700 px-4 py-3 rounded-2xl rounded-tl-none animate-pulse text-gray-400 text-sm">
                Thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-zinc-900 border-t border-zinc-800">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <input
              type="text"
              className="flex-1 bg-zinc-800 text-white px-5 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-zinc-500 transition-all"
              placeholder="Ask Kliz AI..."
              value={Ques}
              onChange={(e) => setQues(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              onClick={askQuestion}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white px-6 py-3 rounded-full font-semibold transition-all disabled:opacity-50 shadow-lg"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;