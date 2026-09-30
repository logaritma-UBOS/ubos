"use client";
import { useState } from "react";
import { postTeamIdea, deleteTeamIdea, updateTeamIdea, postIdeaComment, deleteIdeaComment } from "@/actions/ideas";

export default function IdeasClient({ authorId, ideas, teamMember }: { authorId: string, ideas: any[], teamMember: any }) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    
    // States for Edit / Comment
    const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setLoading(true);
        await postTeamIdea(content, authorId);
        setContent("");
        setLoading(false);
    };

    const handleDeleteIdea = async (ideaId: string) => {
        if (!confirm("Hapus post ini?")) return;
        await deleteTeamIdea(ideaId, authorId);
    };

    const handleEditIdea = async (ideaId: string) => {
        if (!editContent.trim()) return;
        await updateTeamIdea(ideaId, authorId, editContent);
        setEditingIdeaId(null);
    };

    const handlePostComment = async (ideaId: string) => {
        const c = commentInputs[ideaId];
        if (!c?.trim()) return;
        await postIdeaComment(ideaId, authorId, c);
        setCommentInputs(prev => ({ ...prev, [ideaId]: "" }));
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm("Hapus komentar?")) return;
        await deleteIdeaComment(commentId, authorId);
    };

    const renderProfilePic = (author: any) => {
        if (author.profilePicture) {
            return <img src={author.profilePicture} alt={author.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />;
        }
        return (
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-lg">
                {author.name[0]}
            </div>
        );
    };

    const renderCommentProfilePic = (author: any) => {
        if (author.profilePicture) {
            return <img src={author.profilePicture} alt={author.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />;
        }
        return (
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm shrink-0">
                {author.name[0]}
            </div>
        );
    };

    return (
        <div className="w-full space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <form onSubmit={handleSubmit}>
                    <textarea 
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Tulis gagasan, laporan, atau ide cemerlang untuk tim..."
                        className="w-full p-4 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 min-h-[120px] mb-4 text-sm resize-none"
                    />
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-400 font-medium hidden sm:block">Bisa dilihat oleh semua anggota tim Pilot UBOS.</p>
                        <button disabled={loading || !content.trim()} type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 ml-auto">
                            {loading ? "Mengirim..." : "Kirim Post"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-6">
                {ideas.map((idea) => (
                    <div key={idea.id} className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
                        
                        {/* IDEA HEADER */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {renderProfilePic(idea.author)}
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{idea.author.name}</h4>
                                    <p className="text-xs text-gray-500">{new Date(idea.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })} &bull; {idea.author.role}</p>
                                </div>
                            </div>
                            {idea.authorId === authorId && (
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingIdeaId(idea.id); setEditContent(idea.content); }} className="text-gray-400 hover:text-blue-600 text-xs font-bold">Edit</button>
                                    <button onClick={() => handleDeleteIdea(idea.id)} className="text-gray-400 hover:text-red-600 text-xs font-bold">Hapus</button>
                                </div>
                            )}
                        </div>

                        {/* IDEA CONTENT */}
                        {editingIdeaId === idea.id ? (
                            <div className="mb-4">
                                <textarea 
                                    value={editContent}
                                    onChange={e => setEditContent(e.target.value)}
                                    className="w-full p-3 border rounded-lg text-sm bg-gray-50 mb-2"
                                    rows={3}
                                />
                                <div className="flex gap-2 justify-end">
                                    <button onClick={() => setEditingIdeaId(null)} className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg font-bold">Batal</button>
                                    <button onClick={() => handleEditIdea(idea.id)} className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Simpan</button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed mb-6">{idea.content}</p>
                        )}

                        {/* COMMENTS SECTION */}
                        <div className="border-t border-gray-100 pt-4 mt-2">
                            {idea.comments && idea.comments.length > 0 && (
                                <div className="space-y-4 mb-4">
                                    {idea.comments.map((comment: any) => (
                                        <div key={comment.id} className="flex gap-3">
                                            {renderCommentProfilePic(comment.author)}
                                            <div className="flex-1 bg-gray-50 p-3 rounded-2xl rounded-tl-none relative group">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-xs text-gray-900">{comment.author.name}</span>
                                                    {comment.authorId === authorId && (
                                                        <button onClick={() => handleDeleteComment(comment.id)} className="text-[10px] text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">Hapus</button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-700">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* COMMENT INPUT */}
                            <div className="flex gap-3 items-center">
                                {renderCommentProfilePic(teamMember)}
                                <input 
                                    type="text"
                                    value={commentInputs[idea.id] || ""}
                                    onChange={e => setCommentInputs({ ...commentInputs, [idea.id]: e.target.value })}
                                    onKeyDown={e => { if (e.key === "Enter") handlePostComment(idea.id); }}
                                    placeholder="Tulis komentar..."
                                    className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <button 
                                    onClick={() => handlePostComment(idea.id)}
                                    disabled={!commentInputs[idea.id]?.trim()}
                                    className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50 p-1"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                                </button>
                            </div>
                        </div>

                    </div>
                ))}
                {ideas.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-400">Belum ada linimasa yang diposting.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
