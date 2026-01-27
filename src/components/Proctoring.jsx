import React, { useEffect, useRef, useState } from 'react';
import { Camera, Mic, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Proctoring = ({ candidateName, score, isFinished }) => {
    const videoRef = useRef(null);
    const [error, setError] = useState(null);
    const [isMicActive, setIsMicActive] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    useEffect(() => {
        let stream = null;

        const startProctoring = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 320, height: 240 },
                    audio: true
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                // Initialize MediaRecorder
                const recorder = new MediaRecorder(stream);
                mediaRecorderRef.current = recorder;
                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunksRef.current.push(e.data);
                };
                recorder.start();

                // Simple audio activity detection
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const analyser = audioContext.createAnalyser();
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);

                analyser.fftSize = 256;
                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                const checkAudio = () => {
                    analyser.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
                    setIsMicActive(average > 30);
                    requestAnimationFrame(checkAudio);
                };
                checkAudio();

            } catch (err) {
                console.error("Error accessing media devices:", err);
                setError("Camera/Microphone access denied. Proctoring required.");
            }
        };

        startProctoring();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        if (isFinished && mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const fileName = `recording-${Date.now()}.webm`;

                // Upload to Supabase Storage
                console.log("[System] Preparing video upload...");
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('proctoring-recordings')
                    .upload(fileName, blob);

                if (uploadError) {
                    console.error("[Storage] Upload failed:", uploadError.message);
                    console.warn("[Tip] Ensure the 'proctoring-recordings' bucket exists and is public in Supabase.");
                } else {
                    console.log("[Storage] Upload successful:", uploadData.path);
                }

                let recordingUrl = null;
                if (!uploadError) {
                    const { data: publicUrlData } = supabase.storage
                        .from('proctoring-recordings')
                        .getPublicUrl(fileName);
                    recordingUrl = publicUrlData.publicUrl;
                }

                // Save session to DB
                console.log("[System] Saving session record...");
                const { error: dbError } = await supabase.from('sessions').insert({
                    candidate_name: candidateName || 'Anonymous',
                    score: score,
                    recording_url: recordingUrl,
                    status: 'completed'
                });

                if (dbError) {
                    console.error("[Database] Session save failed:", dbError.message);
                } else {
                    console.log("[Database] Session saved successfully!");
                }
            };
            mediaRecorderRef.current.stop();
        }
    }, [isFinished, candidateName, score]);

    return (
        <div className="proctor-overlay">
            <div className="camera-container glass">
                {error ? (
                    <div className="proctor-error">
                        <AlertCircle color="#ff5555" size={24} />
                        <span>{error}</span>
                    </div>
                ) : (
                    <video ref={videoRef} autoPlay muted playsInline className="proctor-video" />
                )}
                <div className="proctor-status">
                    <div className="status-item">
                        <Camera size={14} color={error ? "#ff5555" : "#50fa7b"} />
                        <span style={{ color: error ? "#ff5555" : "inherit" }}>REC</span>
                    </div>
                    <div className="status-item">
                        <Mic size={14} color={isMicActive ? "#50fa7b" : "#9ea3b0"} />
                        <span>MIC</span>
                    </div>
                </div>
            </div>
            <div className="live-indicator">
                <div className="dot blink"></div>
                LIVE SESSION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </div>
        </div>
    );
};

export default Proctoring;
