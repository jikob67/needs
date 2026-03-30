
import React, { useState, useEffect, useRef } from 'react';
import { User, CommunityPost } from '../types';
import { Plus, MessageCircle, Heart, X, ArrowLeft, Send, Trash2 } from 'lucide-react';

interface CommunityProps {
    user: User;
}

interface Comment {
    id: string;
    postId: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    text: string;
    timestamp: number;
}

const Community: React.FC<CommunityProps> = ({ user }) => {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // View State (List vs Detail)
    const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
    const [postComments, setPostComments] = useState<Comment[]>([]);
    const [newCommentText, setNewCommentText] = useState('');
    const commentsEndRef = useRef<HTMLDivElement>(null);
    
    // Form State for new post
    const [newPost, setNewPost] = useState({
        title: '',
        content: '',
        category: 'GENERAL' as 'GENERAL' | 'HELP' | 'SUCCESS_STORY'
    });

    const POSTS_KEY = 'needs_community_posts';
    const COMMENTS_KEY = 'needs_community_comments';

    useEffect(() => {
        const savedPosts = localStorage.getItem(POSTS_KEY);
        if (savedPosts) {
            try {
                setPosts(JSON.parse(savedPosts));
            } catch (e) {
                setPosts([]);
            }
        }
    }, []);

    // Auto-scroll to bottom of comments
    useEffect(() => {
        if (selectedPost && commentsEndRef.current) {
            commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [postComments, selectedPost]);

    const handleCreatePost = (e: React.FormEvent) => {
        e.preventDefault();
        
        const post: CommunityPost = {
            id: 'post_' + Date.now(),
            authorId: user.id,
            authorName: user.fullName,
            authorAvatar: user.avatar,
            title: newPost.title,
            content: newPost.content,
            category: newPost.category,
            likes: 0,
            commentsCount: 0,
            timestamp: Date.now()
        };

        const updatedPosts = [post, ...posts];
        setPosts(updatedPosts);
        localStorage.setItem(POSTS_KEY, JSON.stringify(updatedPosts));
        
        setIsCreateModalOpen(false);
        setNewPost({ title: '', content: '', category: 'GENERAL' });
    };

    const handleLike = (e: React.MouseEvent, postId: string) => {
        e.stopPropagation();
        const updatedPosts = posts.map(p => {
            if (p.id === postId) {
                return { ...p, likes: p.likes + 1 };
            }
            return p;
        });
        setPosts(updatedPosts);
        localStorage.setItem(POSTS_KEY, JSON.stringify(updatedPosts));
        
        // Update selected post if open
        if (selectedPost && selectedPost.id === postId) {
             setSelectedPost(prev => prev ? {...prev, likes: prev.likes + 1} : null);
        }
    };

    const handleOpenPost = (post: CommunityPost) => {
        const allComments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
        const currentPostComments = allComments.filter((c: Comment) => c.postId === post.id);
        setPostComments(currentPostComments);
        setSelectedPost(post);
        setNewCommentText('');
    };

    const handleAddComment = () => {
        if (!newCommentText.trim() || !selectedPost) return;

        const newComment: Comment = {
            id: 'c_' + Date.now(),
            postId: selectedPost.id,
            authorId: user.id,
            authorName: user.fullName,
            authorAvatar: user.avatar,
            text: newCommentText,
            timestamp: Date.now()
        };

        const allComments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
        const updatedComments = [...allComments, newComment];
        localStorage.setItem(COMMENTS_KEY, JSON.stringify(updatedComments));

        setPostComments(prev => [...prev, newComment]);
        
        // Update post comment count
        const updatedPosts = posts.map(p => {
            if (p.id === selectedPost.id) {
                return { ...p, commentsCount: p.commentsCount + 1 };
            }
            return p;
        });
        setPosts(updatedPosts);
        localStorage.setItem(POSTS_KEY, JSON.stringify(updatedPosts));
        setSelectedPost(prev => prev ? {...prev, commentsCount: prev.commentsCount + 1} : null);
        
        setNewCommentText('');
    };

    const handleDeletePost = (e: React.MouseEvent, postId: string) => {
        e.stopPropagation();
        if (!window.confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;

        const updatedPosts = posts.filter(p => p.id !== postId);
        setPosts(updatedPosts);
        localStorage.setItem(POSTS_KEY, JSON.stringify(updatedPosts));

        // Delete associated comments
        const allComments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
        const filteredComments = allComments.filter((c: Comment) => c.postId !== postId);
        localStorage.setItem(COMMENTS_KEY, JSON.stringify(filteredComments));

        if (selectedPost && selectedPost.id === postId) {
            setSelectedPost(null);
        }
    };

    const handleDeleteComment = (commentId: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;
        if (!selectedPost) return;

        const allComments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
        const updatedComments = allComments.filter((c: Comment) => c.id !== commentId);
        localStorage.setItem(COMMENTS_KEY, JSON.stringify(updatedComments));

        setPostComments(prev => prev.filter(c => c.id !== commentId));

        // Update post comment count
        const updatedPosts = posts.map(p => {
            if (p.id === selectedPost.id) {
                return { ...p, commentsCount: Math.max(0, p.commentsCount - 1) };
            }
            return p;
        });
        setPosts(updatedPosts);
        localStorage.setItem(POSTS_KEY, JSON.stringify(updatedPosts));
        setSelectedPost(prev => prev ? {...prev, commentsCount: Math.max(0, prev.commentsCount - 1)} : null);
    };

    const getCategoryLabel = (cat: string) => {
        switch(cat) {
            case 'HELP': return { text: 'طلب مساعدة', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' };
            case 'SUCCESS_STORY': return { text: 'قصة نجاح', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300' };
            default: return { text: 'نقاش عام', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' };
        }
    };

    // --- Detail View ---
    if (selectedPost) {
        const catStyle = getCategoryLabel(selectedPost.category);
        return (
            <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <button 
                        onClick={() => setSelectedPost(null)}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                        {selectedPost.title}
                    </h2>
                </div>

                {/* Post Content Scrollable */}
                <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                    {/* Original Post */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                         <div className="flex items-start justify-between mb-4">
                             <div className="flex items-center gap-3">
                                 <img src={selectedPost.authorAvatar || 'https://ui-avatars.com/api/?name='+selectedPost.authorName} alt={selectedPost.authorName} className="w-12 h-12 rounded-full bg-gray-100 border-2 border-white dark:border-gray-700 shadow-sm" />
                                 <div>
                                     <h4 className="font-bold text-gray-900 dark:text-white">{selectedPost.authorName}</h4>
                                     <span className="text-xs text-gray-400">{new Date(selectedPost.timestamp).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                 </div>
                             </div>
                             <div className="flex items-center gap-2">
                                {(selectedPost.authorId === user.id || user.role === 'ADMIN') && (
                                    <button 
                                        onClick={(e) => handleDeletePost(e, selectedPost.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                        title="حذف المنشور"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${catStyle.color}`}>
                                    {catStyle.text}
                                </span>
                             </div>
                         </div>
                         <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap text-base">
                             {selectedPost.content}
                         </p>
                         <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                             <button 
                                onClick={(e) => handleLike(e, selectedPost.id)}
                                className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors text-sm font-medium"
                             >
                                 <Heart size={18} className={selectedPost.likes > 0 ? "fill-red-500 text-red-500" : ""} />
                                 {selectedPost.likes} إعجاب
                             </button>
                             <div className="flex items-center gap-2 text-gray-500 text-sm">
                                 <MessageCircle size={18} />
                                 {selectedPost.commentsCount} تعليق
                             </div>
                         </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-500 px-2">التعليقات ({postComments.length})</h3>
                        {postComments.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm italic">
                                لا توجد تعليقات بعد. كن أول من يشارك!
                            </div>
                        ) : (
                            postComments.map((comment) => (
                                <div key={comment.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm flex gap-3 border border-gray-50 dark:border-gray-700">
                                    <img src={comment.authorAvatar || 'https://ui-avatars.com/api/?name='+comment.authorName} className="w-8 h-8 rounded-full flex-shrink-0" alt={comment.authorName} />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-gray-900 dark:text-white">{comment.authorName}</span>
                                                {(comment.authorId === user.id || user.role === 'ADMIN') && (
                                                    <button 
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="text-red-400 hover:text-red-600 transition-colors"
                                                        title="حذف التعليق"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-gray-400">{new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{comment.text}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={commentsEndRef} />
                    </div>
                </div>

                {/* Comment Input */}
                <div className="mt-2 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <input 
                        type="text" 
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="أضف تعليقاً..."
                        className="flex-1 bg-transparent p-3 outline-none text-sm dark:text-white"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <button 
                        onClick={handleAddComment}
                        disabled={!newCommentText.trim()}
                        className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        );
    }

    // --- Main List View ---
    return (
        <div className="space-y-6 animate-fade-in relative min-h-[calc(100vh-140px)]">
             <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">مجتمع needs</h2>
                    <p className="text-xs text-gray-500">تواصل، شارك قصتك، واطلب الدعم</p>
                </div>
             </div>

             {/* Floating Action Button */}
             <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="fixed bottom-20 left-4 z-40 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg shadow-primary-600/40 transition-transform active:scale-95 flex items-center justify-center"
            >
                <Plus size={28} />
            </button>

             {/* Posts Feed */}
             {posts.length === 0 ? (
                 <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                     <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
                     <h3 className="text-gray-600 dark:text-gray-300 font-bold mb-2">لا توجد نقاشات بعد</h3>
                     <p className="text-sm text-gray-500">كن أول من يفتح غرفة نقاش أو يشارك تجربة</p>
                 </div>
             ) : (
                 <div className="space-y-4 pb-20">
                     {posts.map(post => {
                         const catStyle = getCategoryLabel(post.category);
                         return (
                             <div 
                                key={post.id} 
                                className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleOpenPost(post)}
                             >
                                 <div className="flex items-start justify-between mb-3">
                                     <div className="flex items-center gap-3">
                                         <img src={post.authorAvatar || 'https://ui-avatars.com/api/?name='+post.authorName} alt={post.authorName} className="w-10 h-10 rounded-full bg-gray-100" />
                                         <div>
                                             <h4 className="font-bold text-sm text-gray-900 dark:text-white">{post.authorName}</h4>
                                             <span className="text-[10px] text-gray-400">{new Date(post.timestamp).toLocaleDateString('ar-SA')}</span>
                                         </div>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        {(post.authorId === user.id || user.role === 'ADMIN') && (
                                            <button 
                                                onClick={(e) => handleDeletePost(e, post.id)}
                                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                title="حذف المنشور"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${catStyle.color}`}>
                                            {catStyle.text}
                                        </span>
                                     </div>
                                 </div>
                                 
                                 <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">{post.title}</h3>
                                 <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                                     {post.content}
                                 </p>

                                 <div className="flex items-center gap-4 border-t border-gray-50 dark:border-gray-700 pt-3">
                                     <button 
                                        onClick={(e) => handleLike(e, post.id)}
                                        className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors text-xs"
                                     >
                                         <Heart size={16} className={post.likes > 0 ? "fill-red-500 text-red-500" : ""} />
                                         {post.likes} إعجاب
                                     </button>
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); handleOpenPost(post); }}
                                        className="flex items-center gap-1 text-gray-400 hover:text-primary-500 transition-colors text-xs"
                                     >
                                         <MessageCircle size={16} />
                                         {post.commentsCount} تعليق
                                     </button>
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); handleOpenPost(post); }}
                                        className="mr-auto text-primary-600 text-xs font-bold hover:underline"
                                     >
                                         انضم للنقاش
                                     </button>
                                 </div>
                             </div>
                         );
                     })}
                 </div>
             )}

             {/* Create Post Modal */}
             {isCreateModalOpen && (
                 <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                     <div className="bg-white dark:bg-gray-800 w-full max-w-lg p-6 rounded-t-3xl md:rounded-3xl shadow-2xl">
                         <div className="flex justify-between items-center mb-6">
                             <h3 className="text-lg font-bold text-gray-900 dark:text-white">إنشاء غرفة نقاش جديدة</h3>
                             <button onClick={() => setIsCreateModalOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                                 <X size={20} />
                             </button>
                         </div>

                         <form onSubmit={handleCreatePost} className="space-y-4">
                             <div>
                                 <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">عنوان النقاش</label>
                                 <input 
                                     type="text" 
                                     required
                                     placeholder="مثلاً: تجربتي مع العلاج الطبيعي..."
                                     value={newPost.title}
                                     onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                                     className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none"
                                 />
                             </div>

                             <div>
                                 <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">نوع الغرفة</label>
                                 <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                                     {[
                                         { id: 'GENERAL', label: 'نقاش عام' },
                                         { id: 'HELP', label: 'طلب مساعدة' },
                                         { id: 'SUCCESS_STORY', label: 'قصة نجاح' }
                                     ].map(cat => (
                                         <button
                                             key={cat.id}
                                             type="button"
                                             onClick={() => setNewPost({...newPost, category: cat.id as any})}
                                             className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border ${
                                                 newPost.category === cat.id 
                                                 ? 'bg-primary-600 text-white border-primary-600' 
                                                 : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                                             }`}
                                         >
                                             {cat.label}
                                         </button>
                                     ))}
                                 </div>
                             </div>

                             <div>
                                 <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">المحتوى</label>
                                 <textarea 
                                     required
                                     rows={4}
                                     placeholder="اكتب تفاصيل الموضوع هنا..."
                                     value={newPost.content}
                                     onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                                     className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                 />
                             </div>

                             <button 
                                 type="submit"
                                 className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all"
                             >
                                 إنشاء الغرفة
                             </button>
                         </form>
                     </div>
                 </div>
             )}
        </div>
    );
};

export default Community;
