import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Shield, Trash2, Plus, LogOut } from 'lucide-react';

const SuperAdminDashboard = ({ onLogout }) => {
    const [subAdmins, setSubAdmins] = useState([]);
    const [newAdminUser, setNewAdminUser] = useState('');
    const [newAdminPass, setNewAdminPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSubAdmins();
    }, []);

    const fetchSubAdmins = async () => {
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('role', 'sub_admin')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching admins:', error);
        else setSubAdmins(data || []);
    };

    const handleCreateSubAdmin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (newAdminPass.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase
                .from('admins')
                .insert({
                    username: newAdminUser,
                    password: newAdminPass, // Note: In production, hash this!
                    role: 'sub_admin'
                });

            if (error) throw error;

            setNewAdminUser('');
            setNewAdminPass('');
            fetchSubAdmins();
            alert('Sub Admin created successfully!');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAdmin = async (id) => {
        if (!window.confirm('Are you sure you want to delete this Sub Admin?')) return;

        const { error } = await supabase
            .from('admins')
            .delete()
            .eq('id', id);

        if (error) alert('Error deleting admin: ' + error.message);
        else fetchSubAdmins();
    };

    return (
        <div className="container fade-in" style={{ padding: '2rem' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Shield size={40} color="var(--primary)" />
                        Main Admin Portal
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>manage system access and sub-administrators</p>
                </div>
                <button onClick={onLogout} className="btn-icon" title="Logout">
                    <LogOut size={24} color="#ff5555" />
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Create Admin Form */}
                <div className="glass card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Plus size={20} color="var(--accent)" />
                        New Sub Admin
                    </h3>
                    <form onSubmit={handleCreateSubAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="input-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={newAdminUser}
                                onChange={e => setNewAdminUser(e.target.value)}
                                placeholder="e.g. interviewer_1"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="text"
                                value={newAdminPass}
                                onChange={e => setNewAdminPass(e.target.value)}
                                placeholder="Secure password"
                                required
                            />
                        </div>
                        {error && <p style={{ color: '#ff5555', fontSize: '0.9rem' }}>{error}</p>}
                        <button disabled={loading} className="btn btn-primary" type="submit">
                            {loading ? 'Creating...' : 'Create Access'}
                        </button>
                    </form>
                </div>

                {/* Sub Admin List */}
                <div className="glass card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <User size={20} color="var(--secondary)" />
                        Active Sub Admins
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {subAdmins.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No sub admins created yet.</p>
                        ) : (
                            subAdmins.map(admin => (
                                <div key={admin.id} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ background: 'rgba(189, 147, 249, 0.2)', padding: '8px', borderRadius: '50%' }}>
                                            <User size={16} color="#bd93f9" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{admin.username}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                Password: <span style={{ fontFamily: 'monospace' }}>{admin.password}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteAdmin(admin.id)}
                                        className="btn-icon"
                                        style={{ borderColor: '#ff5555' }}
                                        title="Delete Access"
                                    >
                                        <Trash2 size={16} color="#ff5555" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
