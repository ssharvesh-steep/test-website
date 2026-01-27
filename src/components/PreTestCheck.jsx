import React, { useState, useEffect } from 'react';
import { Camera, Mic, CheckCircle, AlertCircle, Play } from 'lucide-react';

const PreTestCheck = ({ onProceed, onBack }) => {
    const [cameraReady, setCameraReady] = useState(false);
    const [micReady, setMicReady] = useState(false);
    const [error, setError] = useState('');

    const checkPermissions = async () => {
        try {
            setError('');
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setCameraReady(true);
            setMicReady(true);

            // Stop tracks immediately after check
            stream.getTracks().forEach(track => track.stop());
        } catch (err) {
            console.error("Permission error:", err);
            setError("Access denied. Please enable camera and microphone in your browser/system settings to proceed.");
            setCameraReady(false);
            setMicReady(false);
        }
    };

    useEffect(() => {
        checkPermissions();
    }, []);

    return (
        <div className="container hero fade-in">
            <div className="glass card" style={{ maxWidth: '600px', width: '100%', padding: '3rem' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>System Readiness Check</h2>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
                    To ensure a fair testing environment, we require access to your camera and microphone.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1.5rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        border: cameraReady ? '1px solid var(--green)' : '1px solid var(--glass-border)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <Camera size={24} color={cameraReady ? "var(--green)" : "var(--text-secondary)"} />
                            <div>
                                <div style={{ fontWeight: 600 }}>Camera Access</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Required for visual proctoring</div>
                            </div>
                        </div>
                        {cameraReady ? <CheckCircle color="var(--green)" size={20} /> : <AlertCircle color="#ff5555" size={20} />}
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1.5rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        border: micReady ? '1px solid var(--green)' : '1px solid var(--glass-border)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <Mic size={24} color={micReady ? "var(--green)" : "var(--text-secondary)"} />
                            <div>
                                <div style={{ fontWeight: 600 }}>Microphone Access</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Required for audio proctoring</div>
                            </div>
                        </div>
                        {micReady ? <CheckCircle color="var(--green)" size={20} /> : <AlertCircle color="#ff5555" size={20} />}
                    </div>
                </div>

                {error && (
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(255, 85, 85, 0.1)',
                        color: '#ff5555',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        marginBottom: '2rem',
                        textAlign: 'center'
                    }}>
                        {error}
                        <button
                            onClick={checkPermissions}
                            style={{
                                display: 'block',
                                margin: '8px auto 0',
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                textDecoration: 'underline',
                                cursor: 'pointer'
                            }}
                        >
                            Retry Check
                        </button>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={onBack} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                        Back to Dashboard
                    </button>
                    <button
                        onClick={onProceed}
                        className="btn btn-primary"
                        disabled={!cameraReady || !micReady}
                        style={{ flex: 2, justifyContent: 'center', opacity: (!cameraReady || !micReady) ? 0.5 : 1 }}
                    >
                        <Play size={18} fill="currentColor" />
                        Enter Assessment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreTestCheck;
