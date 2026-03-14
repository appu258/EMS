import { useState, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const FloatingChat = () => {
  const { user } = useContext(AuthContext);
  const socketRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  /* ================= SOCKET CONNECTION ================= */

  useEffect(() => {
    if (!user) return;

    socketRef.current = io("http://localhost:5000");

    socketRef.current.emit("joinRoom", user.id);

    socketRef.current.on("receiveMessage", (data) => {
      setMessages(prev => {
        const exists = prev.find(msg => msg._id === data._id);
        if (exists) return prev;
        return [...prev, data];
      });
    });

    return () => socketRef.current.disconnect();
  }, [user]);

  /* ================= LOAD EMPLOYEES (ADMIN ONLY) ================= */

  useEffect(() => {
    if (open && user?.role === "admin") {
      axios.get("/auth/employees")
        .then(res => setEmployees(res.data));
    }

    if (open && user?.role === "employee") {
      axios.get("/auth/admin")
        .then(res => {
          setEmployees([res.data]);
        });
    }
  }, [open, user]);

  /* ================= LOAD CHAT HISTORY ================= */

  useEffect(() => {
    if (selectedUser) {
      axios.get(`/chat/${selectedUser._id}`)
        .then(res => setMessages(res.data));
    }
  }, [selectedUser]);

  /* ================= SEND MESSAGE ================= */

  const sendMessage = async () => {
    if (!text.trim() || !selectedUser) return;

    const res = await axios.post("/chat", {
      receiver: selectedUser._id,
      text
    });

    socketRef.current.emit("sendMessage", res.data);

    setText("");
  };

  return (
    <>
      {/* Floating Button */}
      <div
  onClick={() => setOpen(!open)}
  className="fixed bottom-8 right-8 z-50 cursor-pointer group"
>
  {/* Pulse Ring */}
  <div className="absolute inset-0 rounded-full bg-purple-500 opacity-30 blur-md animate-ping"></div>

  {/* Main Button */}
  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-2xl transform transition duration-300 group-hover:scale-110">

    {/* Custom SVG Icon */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="white"
      className="w-7 h-7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4-.8L3 20l1.1-3.3A7.89 7.89 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>

  </div>
</div>

      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-[420px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col z-50">

          {/* HEADER */}
          <div className="p-4 border-b border-gray-700 font-semibold text-lg bg-black/30 rounded-t-2xl flex justify-between items-center">
            {selectedUser ? (
              <>
                <span>{selectedUser.name}</span>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  ← Back
                </button>
              </>
            ) : (
              <span>Chats</span>
            )}
          </div>

          {/* ================= EMPLOYEE LIST ================= */}
          {!selectedUser && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {employees.map(emp => (
                <div
                  key={emp._id}
                  onClick={() => setSelectedUser(emp)}
                  className="p-3 bg-black/40 rounded-lg cursor-pointer hover:bg-black/60 transition"
                >
                  {emp.name}
                </div>
              ))}
            </div>
          )}

          {/* ================= CHAT WINDOW ================= */}
          {selectedUser && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`max-w-[70%] px-4 py-2 rounded-lg text-sm ${
                      msg.sender?.toString() === user.id?.toString()
                        ? "bg-green-500 ml-auto"
                        : "bg-gray-700"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              <div className="p-3 flex gap-2 border-t border-gray-700">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type message..."
                  className="flex-1 p-2 rounded-lg bg-black/40 border border-gray-600 outline-none text-sm"
                />
                <button
                  onClick={sendMessage}
                  className="bg-indigo-600 px-4 rounded-lg text-sm hover:bg-indigo-700 transition"
                >
                  Send
                </button>
              </div>
            </>
          )}

        </div>
      )}
    </>
  );
};

export default FloatingChat;