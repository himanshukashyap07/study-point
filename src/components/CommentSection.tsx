"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";

interface CommentSectionProps {
  videoId: string;
}

export default function CommentSection({ videoId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await axios.get(`/api/comments?videoId=${videoId}`);
        const data = res.data;
        if (data.success) {
          setComments(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch comments", error);
      } finally {
        setLoading(false);
      }
    }
    fetchComments();
  }, [videoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!session?.user) {
      toast.error("Please login to post a comment.");
      return;
    }

    setPosting(true);
    try {
      const res = await axios.post("/api/comments", { comment: newComment, video: videoId });
      const data = res.data;
      if (data.success) {
        // Optimistically insert locally to avoid refetch wait
        const userObj = {
          _id: (session.user as any)._id,
          username: session.user.name || "You",
          avatar: session.user.image || ""
        };
        const postedComment = { ...data.data, user: userObj };
        setComments([postedComment, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error posting comment", error);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await axios.delete(`/api/comments/${commentId}`);
      const data = res.data;
      if (data.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      } else {
        alert(data.message || "Failed to delete");
      }
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-extrabold text-[var(--foreground)] mb-6 flex items-center justify-between">
        <span>Discussion ({comments.length})</span>
      </h3>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8 relative">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={session ? "Ask a question or share your thoughts..." : "Please sign in to join the discussion."}
          disabled={!session || posting}
          className="w-full bg-[var(--background)] border border-[var(--border)] focus:border-blue-500 rounded-2xl p-4 pr-[120px] text-sm resize-none outline-none shadow-inner transition-colors min-h-[100px]"
        />
        <button
          type="submit"
          disabled={!session || posting || !newComment.trim()}
          className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all"
        >
          {posting ? "Posting..." : "Post"}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-6 text-[var(--muted-foreground)]">Loading comments...</div>
        ) : comments.length > 0 ? (
          comments.map((comment) => {
            const isOwner = session && comment.user && comment.user._id === (session.user as any)._id;
            const isAdmin = session && (session.user as any).role === 'admin';

            return (
              <div key={comment._id} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 shrink-0 border-2 border-[var(--background)] shadow-sm overflow-hidden flex items-center justify-center text-white text-xs font-bold">
                  {comment.user?.avatar ? (
                    <img src={comment.user.avatar} className="w-full h-full object-cover" alt="avatar" />
                  ) : (
                    <span className="uppercase">{comment.user?.username?.charAt(0) || "U"}</span>
                  )}
                </div>

                <div className="flex-1 bg-[var(--muted)]/20 p-4 rounded-2xl border border-transparent group-hover:border-[var(--border)] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--foreground)]">{comment.user?.username || "Deleted User"}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    {(isOwner || isAdmin) && (
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className="opacity-0 group-hover:opacity-100 text-xs font-bold text-red-500 hover:text-red-600 transition-opacity"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{comment.comment}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-[var(--border)] rounded-2xl">
            <span className="text-3xl mb-2 block">💬</span>
            <p className="text-[var(--muted-foreground)] text-sm font-medium">No comments yet. Be the first to start a discussion!</p>
          </div>
        )}
      </div>
    </div>
  );
}
