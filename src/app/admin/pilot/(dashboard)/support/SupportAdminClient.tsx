"use client";
import { useState, useEffect, useRef } from "react";
import { sendMessage, getChatHistory, markMessagesAsRead } from "@/actions/chat";

export default function SupportAdminClient({ inboxData }: { inboxData: any[] }) {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [showInbox, setShowInbox] = useState(true); // mobile: toggle between inbox & chat
    const endRef = useRef<HTMLDivElement>(null);

    const selectedUser = inboxData.find(u => u.id === selectedUserId);

    const fetchMessages = async () => {
        if (!selectedUserId) return;
        const res = await getChatHistory(selectedUserId);
        setMessages(res);
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [selectedUserId]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSelectUser = (userId: string) => {
        setSelectedUserId(userId);
        setShowInbox(false); // on mobile, switch to chat view
        markMessagesAsRead(userId);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !selectedUserId) return;
        setLoading(true);
        const tempMsg = input;
        setInput("");
        await sendMessage(selectedUserId, tempMsg, "ADMIN");
        await fetchMessages();
        setLoading(false);
    };

    return (
        <div className="flex h-[75vh] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            
            {/* INBOX SIDEBAR - full width on mobile when showInbox, hidden when chat selected */}
            <div className={`${showInbox ? "flex" : "hidden"} md:flex flex-col w-full md:w-1/3 border-r border-gray-100 bg-gray-50`}>
                <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                    <h3 className="font-bold text-gray-900">Inbox Support</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{inboxData.length} percakapan aktif</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {inboxData.length === 0 && (
                        <div className="p-6 text-center">
                            <p className="text-sm text-gray-400">Belum ada tiket support.</p>
                        </div>
                    )}
                    {inboxData.map(user => (
                        <button
                            key={user.id}
                            onClick={() => handleSelectUser(user.id)}
                            className={`w-full text-left p-4 border-b border-gray-100 transition-colors ${selectedUserId === user.id ? "bg-indigo-50 border-l-4 border-l-indigo-600" : "hover:bg-white"}`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center flex-shrink-0">
                                        {(user.name || user.email || "?")[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-gray-900 text-sm truncate">{user.name || user.email}</h4>
                                        <p className="text-xs text-gray-500 truncate">{user.supportMessages[0]?.message}</p>
                                    </div>
                                </div>
                                {user.unreadCount > 0 && (
                                    <span className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-black flex items-center justify-center">
                                        {user.unreadCount > 9 ? "9+" : user.unreadCount}
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* CHAT AREA - full width on mobile when !showInbox */}
            <div className={`${!showInbox ? "flex" : "hidden"} md:flex flex-col w-full md:w-2/3 bg-white`}>
                {selectedUserId && selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white flex-shrink-0">
                            {/* Back button - mobile only */}
                            <button
                                onClick={() => setShowInbox(true)}
                                className="md:hidden p-1 -ml-1 text-gray-500 hover:text-gray-900"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center flex-shrink-0">
                                {(selectedUser.name || selectedUser.email || "?")[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-gray-900 text-sm truncate">{selectedUser.name || selectedUser.email}</h3>
                                <p className="text-xs text-gray-500">{selectedUser.email}</p>
                            </div>
                        </div>
                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.senderRole === "ADMIN" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed ${msg.senderRole === "ADMIN" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm"}`}>
                                        {msg.message}
                                    </div>
                                </div>
                            ))}
                            <div ref={endRef} />
                        </div>
                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-3 flex-shrink-0">
                            <input
                                type="text"
                                disabled={loading}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Balas pesan user..."
                                className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <button
                                disabled={loading || !input.trim()}
                                type="submit"
                                className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex-shrink-0 text-sm"
                            >
                                Kirim
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 text-sm flex-col gap-3">
                        <svg className="w-14 h-14 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <p>Pilih percakapan untuk membalas</p>
                    </div>
                )}
            </div>
        </div>
    );
}
