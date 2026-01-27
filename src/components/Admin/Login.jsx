import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // 1. Check if user is an Admin (Super or Sub)
        const { data: adminData } = await supabase
            .from('admins')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        if (adminData) {
            onLogin(adminData.role, adminData.username); // 'super_admin' or 'sub_admin'
            setLoading(false);
            return;
        }

        // 2. Check if user is a Candidate
        const { data: candidateData } = await supabase
            .from('candidates')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        if (candidateData) {
            onLogin('candidate', username);
        } else {
            setError('Invalid credentials. Please contact your administrator.');
        }
        setLoading(false);
    };

    return (
        <div className="container hero fade-in">
            <div className="glass card" style={{ maxWidth: '400px', width: '100%', padding: '3rem' }}>
                <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Login Page</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="input-group">
                        <User size={18} color="var(--text-secondary)" />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <Lock size={18} color="var(--text-secondary)" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p style={{ color: '#ff5555', fontSize: '0.9rem' }}>{error}</p>}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
