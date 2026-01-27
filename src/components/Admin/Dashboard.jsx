import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Play, Clipboard, User, Award, Plus, Trash2, CheckCircle, LogOut } from 'lucide-react';

const AdminDashboard = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState({ text: '', options: ['', '', '', ''], answer_index: 0 });
    const [activeTab, setActiveTab] = useState('candidates');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: sessData } = await supabase.from('sessions').select('*').order('created_at', { ascending: false });
            const { data: qData } = await supabase.from('questions').select('*').order('created_at', { ascending: true });

            setSessions(sessData || []);
            setQuestions(qData || []);
            setLoading(false);
        };

        fetchData();

        const sessSub = supabase.channel('sess-sub').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sessions' }, payload => {
            setSessions(prev => [payload.new, ...prev]);
        }).subscribe();

        const qSub = supabase.channel('q-sub').on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => {
            fetchData();
        }).subscribe();

        return () => {
            supabase.removeChannel(sessSub);
            supabase.removeChannel(qSub);
        };
    }, []);

    const handleAddQuestion = async (e) => {
        e.preventDefault();

        // Filter out empty options
        const finalOptions = newQuestion.options.map(o => o.trim()).filter(o => o !== "");

        if (!newQuestion.text.trim()) {
            alert("Please enter the question text.");
            return;
        }

        if (finalOptions.length < 2) {
            alert("Please provide at least 2 non-empty options.");
            return;
        }

        const answerIndex = parseInt(newQuestion.answer_index);
        if (answerIndex >= finalOptions.length) {
            alert("The selected correct answer index is no longer valid for the number of options provided.");
            return;
        }

        const { error } = await supabase.from('questions').insert({
            text: newQuestion.text,
            options: finalOptions,
            answer_index: answerIndex
        });

        if (error) {
            console.error("DB Error:", error);
            alert("Database Error: " + error.message + "\n\nPlease ensure the 'questions' table exists in Supabase with JSONB 'options'.");
        } else {
            setNewQuestion({ text: '', options: ['', '', '', ''], answer_index: 0 });
            alert("Question added successfully!");
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (!window.confirm("Delete question?")) return;
        await supabase.from('questions').delete().eq('id', id);
    };

    const [newUser, setNewUser] = useState(null);
    const [genError, setGenError] = useState('');
    const [customUsername, setCustomUsername] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const generateCredential = async () => {
        let username = customUsername.trim() || `cand_${Math.random().toString(36).substr(2, 5)}`;
        const password = Math.random().toString(36).substr(2, 8);
        const { error } = await supabase.from('candidates').insert({ username, password });
        if (error) setGenError(error.message);
        else {
            setNewUser({ username, password });
            setGenError('');
            setCustomUsername('');
        }
    };

    const [recentCandidates, setRecentCandidates] = useState([]);

    useEffect(() => {
        const fetchCandidates = async () => {
            const { data } = await supabase.from('candidates').select('*').order('created_at', { ascending: false }).limit(20);
            setRecentCandidates(data || []);
        };
        fetchCandidates();
    }, [newUser, refreshTrigger]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied!');
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete candidate?")) return;
        await supabase.from('candidates').delete().eq('id', id);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleBan = async (id, currentStatus) => {
        await supabase.from('candidates').update({ banned: !currentStatus }).eq('id', id);
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="container fade-in" style={{ padding: '2rem' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Play size={40} color="var(--primary)" />
                        Interviewer Dashboard
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage candidates and assessment content</p>
                </div>
            </header>

            {/* Tab Bar */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '15px', width: 'fit-content' }}>
                {[
                    { id: 'candidates', label: 'Candidates', icon: <User size={18} /> },
                    { id: 'questions', label: 'Questions', icon: <Clipboard size={18} /> },
                    { id: 'results', label: 'Results', icon: <Award size={18} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="btn"
                        style={{
                            background: activeTab === tab.id ? 'var(--glass-border)' : 'transparent',
                            color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                            border: 'none',
                            padding: '10px 24px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontWeight: activeTab === tab.id ? 700 : 400
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Panels */}
            {activeTab === 'candidates' && (
                <div className="fade-in">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem' }}>
                        <div className="glass card" style={{ padding: '2rem', borderLeft: '4px solid var(--accent)', height: 'fit-content' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Add Candidate</h3>
                            <div className="input-group" style={{ marginBottom: '1.2rem' }}>
                                <input
                                    type="text"
                                    placeholder="Username (Optional)"
                                    value={customUsername}
                                    onChange={(e) => setCustomUsername(e.target.value)}
                                />
                            </div>
                            <button onClick={generateCredential} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                Create Access
                            </button>
                            {newUser && (
                                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,121,198,0.1)', borderRadius: '8px', border: '1px solid var(--accent)' }}>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '4px' }}>CREDENTIALS:</div>
                                    <code style={{ fontSize: '1.1rem', color: 'var(--accent)' }}>{newUser.username} / {newUser.password}</code>
                                </div>
                            )}
                        </div>
                        <div className="glass card">
                            <h3 style={{ marginBottom: '1.5rem' }}>Active Candidates</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '500px', overflowY: 'auto' }}>
                                {recentCandidates.map(cand => (
                                    <div key={cand.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', opacity: cand.banned ? 0.4 : 1 }}>
                                        <div>
                                            <div style={{ fontWeight: 600, textDecoration: cand.banned ? 'line-through' : 'none' }}>{cand.username}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>PWD: {cand.password}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => copyToClipboard(`${cand.username}/${cand.password}`)} className="btn-icon" title="Copy"><Clipboard size={14} /></button>
                                            <button onClick={() => handleBan(cand.id, cand.banned)} className="btn-icon" title={cand.banned ? "Unban" : "Ban"}>{cand.banned ? <CheckCircle size={14} /> : '⊘'}</button>
                                            <button onClick={() => handleDelete(cand.id)} className="btn-icon" style={{ borderColor: '#ff5555', color: '#ff5555' }} title="Delete">×</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'questions' && (
                <div className="fade-in">
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '2rem' }}>
                        <div className="glass card" style={{ padding: '2rem', borderLeft: '4px solid var(--secondary)', height: 'fit-content' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>New Question</h3>
                            <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        placeholder="Question Text"
                                        value={newQuestion.text}
                                        onChange={e => setNewQuestion({ ...newQuestion, text: e.target.value })}
                                        required
                                    />
                                </div>
                                {newQuestion.options.map((opt, i) => (
                                    <div key={i} className="input-group">
                                        <input
                                            type="text"
                                            placeholder={`Option ${i + 1}`}
                                            value={opt}
                                            onChange={e => {
                                                const next = [...newQuestion.options];
                                                next[i] = e.target.value;
                                                setNewQuestion({ ...newQuestion, options: next });
                                            }}
                                            required
                                        />
                                    </div>
                                ))}
                                <select
                                    value={newQuestion.answer_index}
                                    onChange={e => setNewQuestion({ ...newQuestion, answer_index: e.target.value })}
                                    style={{ padding: '12px', background: 'var(--glass)', color: 'white', borderRadius: '10px', border: '1px solid var(--glass-border)' }}
                                >
                                    {newQuestion.options.map((_, i) => (
                                        <option key={i} value={i}>Correct: Option {i + 1}</option>
                                    ))}
                                </select>
                                <button type="submit" className="btn btn-secondary" style={{ justifyContent: 'center' }}>Add Question</button>
                            </form>
                        </div>
                        <div className="glass card">
                            <h3 style={{ marginBottom: '1.5rem' }}>Question Bank ({questions.length})</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
                                {questions.map((q, idx) => (
                                    <div key={q.id} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, marginBottom: '8px' }}>{idx + 1}. {q.text}</div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                                                {q.options.map((opt, i) => (
                                                    <div key={i} style={{ fontSize: '0.85rem', color: i === q.answer_index ? 'var(--primary)' : 'var(--text-secondary)' }}>
                                                        • {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteQuestion(q.id)} className="btn-icon" style={{ borderColor: '#ff5555', color: '#ff5555' }}><Trash2 size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'results' && (
                <div className="fade-in">
                    <h3 style={{ marginBottom: '2rem' }}>Performance Results</h3>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>Loading results...</div>
                    ) : (
                        <div className="grid" style={{ marginTop: 0 }}>
                            {sessions.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center', gridColumn: '1/-1' }}>No results recorded yet.</p>
                            ) : (
                                sessions.map(session => (
                                    <div key={session.id} className="glass card" style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                                            <span style={{ fontWeight: 600 }}>{session.candidate_name || 'Anonymous'}</span>
                                            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(session.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Final Score</span>
                                            <span style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '1.2rem' }}>{session.score} / 10</span>
                                        </div>
                                        {session.recording_url && (
                                            <a href={session.recording_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                                                <Play size={16} fill="currentColor" />
                                                View Recording
                                            </a>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
