import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getMyRequests, getIncomingRequests } from "../api/requestService";

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile active chat list
  const [search, setSearch] = useState("");

  const endRef = useRef(null);
  const isFarmer = user?.role === "farmer";

  // Fetch all chats/requests
  const fetchChats = useCallback(async () => {
    setLoadingChats(true);
    try {
      let data = [];
      // Fetch multiple pages or a large limit to get most chats
      if (isFarmer) {
        const res = await getIncomingRequests({ limit: 50 });
        data = res.data;
      } else {
        const res = await getMyRequests({ limit: 50 });
        data = res.data;
      }
      setRequests(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChats(false);
    }
  }, [isFarmer]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Fetch messages for active request
  const fetchMessages = useCallback(async () => {
    if (!activeRequest) return;
    setLoadingMessages(true);
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/${activeRequest._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setMessages(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  }, [activeRequest]);

  useEffect(() => {
    if (activeRequest) fetchMessages();
  }, [activeRequest, fetchMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeRequest) return;

    try {
      const recipientId = isFarmer ? activeRequest.buyer._id : activeRequest.farmer._id;
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/messages`, {
        requestId: activeRequest._id,
        recipientId,
        text: text
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      if (data.success) {
        setMessages([...messages, data.data]);
        setText("");
      }
    } catch (err) {
      alert("Failed to send message: " + (err.response?.data?.message || err.message));
    }
  };

  const filteredRequests = requests.filter(r => {
    const s = search.toLowerCase();
    const otherName = isFarmer ? r.buyer?.name : r.farmer?.name;
    const cropName = r.crop?.name;
    return (otherName || "").toLowerCase().includes(s) || (cropName || "").toLowerCase().includes(s);
  });

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      {/* ── Left Sidebar (Chat List) ── */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-white border-r border-gray-100 flex flex-col z-20 transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-700 md:hidden cursor-pointer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-2 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all">
            <SearchIcon />
            <input type="text" placeholder="Search chats..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto hidden-scrollbar">
          {loadingChats ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading chats...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No chats found.</div>
          ) : (
            filteredRequests.map(r => {
              const isActive = activeRequest?._id === r._id;
              const otherName = isFarmer ? r.buyer?.name : r.farmer?.name;
              return (
                <div key={r._id} onClick={() => { setActiveRequest(r); setSidebarOpen(false); }}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${isActive ? "bg-green-50" : "hover:bg-gray-50"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {r.crop?.emoji || "🌿"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="text-sm font-semibold text-gray-900 truncate">{otherName}</p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{new Date(r.updatedAt || r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">Regarding: {r.crop?.name}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
        {!activeRequest ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <button className="md:hidden absolute top-4 left-4 p-2 bg-white rounded-lg shadow-sm text-gray-600" onClick={() => setSidebarOpen(true)}>
              <MenuIcon />
            </button>
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg font-medium text-gray-500">Select a chat to start messaging</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center gap-3 shadow-sm z-10 sticky top-0">
              <button className="md:hidden text-gray-500 p-1" onClick={() => setSidebarOpen(true)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl">
                {activeRequest.crop?.emoji || "🌿"}
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-900">{isFarmer ? activeRequest.buyer?.name : activeRequest.farmer?.name}</h2>
                <p className="text-xs text-gray-500">Request: {activeRequest.crop?.name} ({activeRequest.quantity} {activeRequest.unit})</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">
              {loadingMessages ? (
                <div className="m-auto text-gray-400 text-sm">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="m-auto flex flex-col items-center text-gray-400">
                  <span className="text-3xl mb-2">👋</span>
                  <p className="text-sm">No messages yet. Say hi!</p>
                </div>
              ) : (
                messages.map((m, i) => {
                  const isMine = m.sender._id === user._id;
                  return (
                    <div key={i} className={`flex flex-col max-w-[75%] sm:max-w-[60%] ${isMine ? "self-end items-end" : "self-start items-start"}`}>
                      <span className="text-[10px] text-gray-400 mb-1 px-1">{m.sender.name}</span>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                        ${isMine ? "bg-green-700 text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm"}
                        ${m.isBidOffer ? "border-2 border-amber-400" : "border border-transparent"}`}>
                        {m.isBidOffer && <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-90 border-b border-current pb-1">💰 Bid Offer</div>}
                        <p>{m.text}</p>
                        {m.isBidOffer && <p className="font-bold mt-1 text-base">${m.proposedPrice}</p>}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 px-1">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  );
                })
              )}
              <div ref={endRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-3 sm:p-4 border-t border-gray-200">
              <form onSubmit={handleSend} className="flex flex-col max-w-4xl mx-auto">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 text-sm outline-none focus:border-green-500 focus:bg-white transition-all shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!text.trim()}
                    className="bg-green-800 hover:bg-green-900 text-white w-11 h-11 flex items-center justify-center rounded-full transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer shadow-md"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-10 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
