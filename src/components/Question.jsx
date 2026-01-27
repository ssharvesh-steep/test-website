import React, { useEffect } from 'react';

const Question = ({ question, total, index, onSelect, timeLeft }) => {

    // Intentional Leak: Log the answer index to the console
    useEffect(() => {
        console.group(`%c[Security Scan] Question ${index + 1}`, "color: #ff79c6; font-weight: bold;");
        console.log(`%cHash Match Found: %c${question.answer_index}`, "color: #9ea3b0;", "color: #50fa7b; font-weight: bold;");
        console.groupEnd();
    }, [index, question.answer_index]);

    return (
        <div className="fade-in">
            <div className="question-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div className="question-count">SECTION A: CORE CONCEPTS — {index + 1} OF {total}</div>
                    <div style={{
                        color: timeLeft <= 10 ? '#ff5555' : 'var(--secondary)',
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        background: 'rgba(0,0,0,0.2)',
                        padding: '4px 12px',
                        borderRadius: '8px',
                        border: '1px solid currentColor'
                    }}>
                        {timeLeft}s
                    </div>
                </div>
                <h2 className="question-text">{question.text}</h2>
            </div>

            <div className="options-grid">
                {question.options.map((option, i) => (
                    <button
                        key={i}
                        className="option-btn"
                        onClick={() => onSelect(i)}
                        // Intentional Leak: DOM Attribute
                        data-is-correct={i === question.answer_index ? "true" : "false"}
                        // Harder to spot leakage: Encoded data attribute
                        data-meta-id={btoa(`ans-${i === question.answer_index}`)}
                    >
                        <span style={{ color: 'var(--text-secondary)', marginRight: '1rem', fontFamily: 'monospace' }}>
                            0{i + 1}
                        </span>
                        {option}
                    </button>
                ))}
            </div>

            <div style={{ marginTop: '3rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.1)', cursor: 'default' }}>
                CHECKSUM_OK: {btoa(question.text).substring(0, 10)}
            </div>
        </div>
    );
};

export default Question;
