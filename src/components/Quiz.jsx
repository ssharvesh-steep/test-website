import React, { useState, useEffect } from 'react';
import Question from './Question';
import { supabase } from '../lib/supabase';

const Quiz = ({ onFinish }) => {
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching questions:', error);
            } else {
                setQuestions(data || []);
                window.__QUIZ_DATA__ = data;
            }
            setLoading(false);
        };

        fetchQuestions();
    }, []);

    useEffect(() => {
        if (loading || questions.length === 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleSelect(-1); // Fail question if time runs out
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [loading, questions.length, currentIdx]);

    const handleSelect = (idx) => {
        const isCorrect = idx !== -1 && idx === questions[currentIdx].answer_index;
        const newScore = isCorrect ? score + 1 : score;
        setScore(newScore);
        setTimeLeft(60);

        if (currentIdx + 1 < questions.length) {
            setCurrentIdx(currentIdx + 1);
        } else {
            onFinish(newScore);
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>Loading questions...</div>;

    if (questions.length === 0) return (
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
            <h2>No questions available</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Please contact the administrator to set up the assessment.</p>
        </div>
    );

    return (
        <div className="container quiz-container fade-in">
            <Question
                question={questions[currentIdx]}
                total={questions.length}
                index={currentIdx}
                onSelect={handleSelect}
                timeLeft={timeLeft}
            />
        </div>
    );
};

export default Quiz;
