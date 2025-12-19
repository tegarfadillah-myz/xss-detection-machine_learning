import React, { useState, useEffect } from 'react';

export default function BlogConfig() {
    const [mode, setMode] = useState('secure'); // 'secure' | 'vulnerable'
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    // Initial Load & Reflected XSS Check
    useEffect(() => {
        fetchComments();

        // DOM XSS: Unsafe Breadcrumb Update from URL
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q) {
            const breadcrumb = document.getElementById('dynamic-breadcrumb');
            if (breadcrumb) {
                if (mode === 'vulnerable') {
                    breadcrumb.innerHTML = `Search: ${q}`; // DOM XSS Sink
                } else {
                    breadcrumb.textContent = `Search: ${q}`;
                }
            }
        }
    }, [mode]);

    const fetchComments = async () => {
        try {
            const response = await fetch('/api/posts');
            const data = await response.json();
            setComments(data.posts);
        } catch (e) { console.error("Failed to load comments"); }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const q = formData.get('q');
        // Reload to simulate real Reflected XSS (server/client sync)
        window.location.href = `/?q=${encodeURIComponent(q)}`;
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(null); setNotification(null);

        const endpoint = mode === 'secure' ? '/api/posts' : '/api/vulnerable/posts';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({ content: commentInput })
            });

            if (response.status === 403) {
                const data = await response.json();
                throw new Error(data.message || 'WAF BLOCKED: Malicious Payload Detected!');
            }

            setCommentInput('');
            fetchComments();
            setNotification({ type: 'success', msg: 'Comment posted successfully!' });
        } catch (err) {
            setError(err.message);
            setNotification({ type: 'error', msg: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">WAF</div>
                        <span className="font-bold text-xl tracking-tight text-gray-900">XSS Detection</span>
                    </div>

                    <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-6 relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input
                            name="q"
                            type="text"
                            placeholder={mode === 'vulnerable' ? "Search... (Reflected XSS Vulnerable)" : "Search safe articles..."}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                        />
                    </form>

                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button onClick={() => setMode('secure')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'secure' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>Secure</button>
                        <button onClick={() => setMode('vulnerable')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'vulnerable' ? 'bg-red-500 shadow text-white' : 'text-gray-500 hover:text-gray-900'}`}>Vulnerable</button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content */}
                <article className="lg:col-span-3 space-y-8">
                    {/* Breadcrumbs (DOM XSS SINK) */}
                    <div className="text-sm text-gray-500 flex gap-2">
                        <span>Home</span>
                        <span>/</span>
                        <span>Articles</span>
                        <span>/</span>
                        <span id="dynamic-breadcrumb" className="text-indigo-600 font-medium">Cyber Security</span>
                    </div>

                    {/* Article Body */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="h-64 bg-gradient-to-r from-indigo-900 to-slate-900 relative">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                            <div className="absolute bottom-8 left-8 text-white">
                                <span className="bg-indigo-500/20 backdrop-blur border border-indigo-400/30 text-indigo-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">Analysis</span>
                                <h1 className="text-4xl font-extrabold leading-tight">Understanding Web Vulnerabilities</h1>
                            </div>
                        </div>
                        <div className="p-8 prose max-w-none text-gray-600 leading-relaxed">
                            <p className="text-lg text-gray-800 font-medium">Cross-Site Scripting (XSS) remains one of the most prevalent web security flaws.</p>
                            <p>
                                In this demonstration, we explore how different contexts affect security.
                                When <b>Secure Mode</b> is active, a machine learning powered WAF inspects your inputs.
                                Switching to <b>Vulnerable Mode</b> bypasses these checks, simulating a legacy or poorly coded application.
                            </p>
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
                                <p className="text-blue-700 text-sm font-bold">Try It Yourself:</p>
                                <ul className="list-disc list-inside text-blue-600 text-sm mt-2 space-y-1">
                                    <li><b>Reflected:</b> Type nested tags in search bar: <code>&lt;img src=x onError=alert(1)&gt;</code></li>
                                    <li><b>Stored:</b> Post a comment with a script tag.</li>
                                    <li><b>DOM:</b> Observe the breadcrumb update above.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            Discussion
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{comments.length}</span>
                        </h3>

                        {/* Comment Form */}
                        <div className="mb-8 flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0"></div>
                            <div className="flex-1">
                                <form onSubmit={handleCommentSubmit}>
                                    <textarea
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        placeholder={mode === 'vulnerable' ? "Write a comment... (WAF Disabled)" : "Write a comment... (Protected)"}
                                        className={`w-full p-4 rounded-xl border-2 focus:ring-0 focus:outline-none transition-colors resize-none h-32 text-sm ${mode === 'vulnerable' ? 'border-red-100 bg-red-50 focus:border-red-300' : 'border-gray-100 bg-gray-50 focus:border-indigo-300 focus:bg-white'}`}
                                    ></textarea>
                                    <div className="flex justify-between items-center mt-3">
                                        <div className="text-xs">
                                            {notification && (
                                                <span className={`${notification.type === 'error' ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                                                    {notification.msg}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading || !commentInput}
                                            className={`px-6 py-2 rounded-lg text-sm font-bold text-white shadow-lg transform transition hover:-translate-y-0.5 ${mode === 'vulnerable' ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-800'}`}
                                        >
                                            {loading ? 'Posting...' : 'Post Comment'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Comment Feed */}
                        <div className="space-y-6">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
                                        U{comment.id}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 border border-gray-100 relative group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-sm text-gray-900">User #{comment.id}</span>
                                                <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                                            </div>

                                            {/* CONDITIONAL RENDERING FOR STORED XSS */}
                                            {mode === 'vulnerable' ? (
                                                <div
                                                    className="text-gray-700 text-sm leading-relaxed text-red-800 border-l-2 border-red-200 pl-2"
                                                    dangerouslySetInnerHTML={{ __html: comment.content }}
                                                />
                                            ) : (
                                                <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                                            )}

                                            {mode === 'vulnerable' && (
                                                <div className="absolute -top-2 -right-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">
                                                    UNSAFE RENDER
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </article>

                {/* Sidebar */}
                <aside className="space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h4 className="font-bold text-gray-900 mb-4">About the Author</h4>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div>
                                <p className="font-bold text-sm text-gray-900">Antigravity AI</p>
                                <p className="text-xs text-gray-500">Security Researcher</p>
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm mt-4 leading-relaxed">
                            Demonstrating the importance of Web Application Firewalls (WAF) and Secure Coding practices in modern web development.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
                        <h4 className="font-bold mb-2">System Status</h4>
                        <div className="space-y-4">
                            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                                <p className="text-xs text-indigo-100 uppercase tracking-widest mb-1">Current Mode</p>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${mode === 'secure' ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`}></span>
                                    <span className="font-bold">{mode === 'secure' ? 'SECURE (WAF ON)' : 'VULNERABLE'}</span>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                                <p className="text-xs text-indigo-100 uppercase tracking-widest mb-1">Backend</p>
                                <p className="font-bold text-sm">Laravel 12 + Python ML</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}
