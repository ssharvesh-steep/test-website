import React, { useState, useEffect } from 'react';
import { Play, Shield, Zap, Code, User, Mail, Phone, FileText, Edit2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Dashboard = ({ onStart, candidateName }) => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        phone: '',
        bio: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState({});

    useEffect(() => {
        if (candidateName) {
            fetchProfile();
        }
    }, [candidateName]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('candidates')
                .select('full_name, email, phone, bio')
                .eq('username', candidateName)
                .single();

            if (error) throw error;

            if (data) {
                setProfile(data);
                setEditedProfile(data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            // Only update fields that exist in our schema to avoid unexpected errors
            const updateData = {
                full_name: editedProfile.full_name,
                email: editedProfile.email,
                phone: editedProfile.phone,
                bio: editedProfile.bio
            };

            const { error } = await supabase
                .from('candidates')
                .update(updateData)
                .eq('username', candidateName);

            if (error) throw error;

            setProfile({ ...profile, ...updateData });
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error.message);
            alert(`Failed to update profile: ${error.message}\n\nPlease ensure your 'candidates' table has full_name, email, phone, and bio columns.`);
        }
    };

    const handleCancel = () => {
        setEditedProfile(profile);
        setIsEditing(false);
    };

    return (
        <div className="container fade-in" style={{ paddingBottom: '4rem' }}>
            <header className="hero" style={{ marginBottom: '3rem' }}>
                <h1>Advanced Technical Assessment</h1>
                <p>Welcome, <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{candidateName}</span>. Please complete your profile before starting.</p>
                <button className="btn btn-primary" onClick={onStart}>
                    <Play size={20} fill="currentColor" />
                    Initialize Assessment
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Profile Section */}
                <div className="glass card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                            <User size={24} color="var(--accent)" />
                            Candidate Profile
                        </h3>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="btn-icon" title="Edit Profile">
                                <Edit2 size={16} />
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={handleSave} className="btn-icon" style={{ borderColor: 'var(--green)' }} title="Save">
                                    <Save size={16} color="var(--green)" />
                                </button>
                                <button onClick={handleCancel} className="btn-icon" style={{ borderColor: 'var(--red)' }} title="Cancel">
                                    <X size={16} color="var(--red)" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                <User size={16} /> Full Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedProfile.full_name || ''}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                                    placeholder="John Doe"
                                    style={{ width: '100%' }}
                                />
                            ) : (
                                <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{profile.full_name || 'Not set'}</div>
                            )}
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                <Mail size={16} /> Email Address
                            </label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={editedProfile.email || ''}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                    placeholder="john@example.com"
                                    style={{ width: '100%' }}
                                />
                            ) : (
                                <div style={{ fontSize: '1.1rem' }}>{profile.email || 'Not set'}</div>
                            )}
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                <Phone size={16} /> Phone Number
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={editedProfile.phone || ''}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                                    placeholder="+1 234 567 890"
                                    style={{ width: '100%' }}
                                />
                            ) : (
                                <div style={{ fontSize: '1.1rem' }}>{profile.phone || 'Not set'}</div>
                            )}
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                <FileText size={16} /> Professional Bio
                            </label>
                            {isEditing ? (
                                <textarea
                                    value={editedProfile.bio || ''}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                                    placeholder="Brief background..."
                                    rows={4}
                                    style={{ width: '100%', resize: 'vertical' }}
                                />
                            ) : (
                                <div style={{ fontSize: '1rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>{profile.bio || 'No bio provided'}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid" style={{ alignContent: 'start', gridTemplateColumns: '1fr' }}>
                    <div className="glass card">
                        <Code color="#bd93f9" size={32} style={{ marginBottom: '1rem' }} />
                        <h3>Secure Environment</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Multi-layered security protocols ensure the integrity of your technical evaluation.
                        </p>
                    </div>
                    <div className="glass card">
                        <Shield color="#50fa7b" size={32} style={{ marginBottom: '1rem' }} />
                        <h3>Anti-Cheat System</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Advanced proctoring algorithms track focus, clipboard activity, and network requests.
                        </p>
                    </div>
                    <div className="glass card">
                        <Zap color="#ff79c6" size={32} style={{ marginBottom: '1rem' }} />
                        <h3>Real-time Analysis</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Immediate feedback on algorithmic complexity and code efficiency provided post-test.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
