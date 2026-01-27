import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';
import Proctoring from './components/Proctoring';
import Login from './components/Admin/Login';
import AdminDashboard from './components/Admin/Dashboard';
import SuperAdminDashboard from './components/Admin/SuperAdminDashboard'; // Import new dashboard
import PreTestCheck from './components/PreTestCheck'; // Import new check component
import { Terminal, LogOut, Shield } from 'lucide-react';

function App() {
  const [view, setView] = useState('login');
  const [score, setScore] = useState(0);
  const [candidateName, setCandidateName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Intentional Vulnerability: Expose answers in global window object
  useEffect(() => {
    window.__QUIZ_VERSION__ = "1.0.4-PROD";
    window.__DEBUG_MODE__ = true;

    // This will be populated when the quiz starts
    window.__QUIZ_DATA__ = null;

    console.log("%c[System] Interview Tester loaded.", "color: #50fa7b; font-weight: bold;");
    console.log("%c[System] Use window.__QUIZ_DATA__ to inspect current quiz set.", "color: #ff79c6;");
  }, []);

  const { ipcRenderer } = window.require ? window.require('electron') : {};

  const handleLogin = (role, name) => {
    if (role === 'super_admin') {
      setIsAdmin(true);
      setView('super-admin-dashboard');
    } else if (role === 'sub_admin') {
      setIsAdmin(true);
      setView('admin-dashboard');
    } else {
      // It's a candidate
      setCandidateName(name);
      setView('dashboard');
      if (ipcRenderer) {
        ipcRenderer.send('enter-kiosk');
      }
    }
  };

  const finishQuiz = (finalScore) => {
    setScore(finalScore);
    setView('result');
    if (ipcRenderer) {
      ipcRenderer.send('exit-kiosk'); // Release lock on finish
    }
  };

  const startQuiz = () => {
    // Restriction: Candidates can only START the quiz via the Electron App
    if (!ipcRenderer) {
      alert("⚠️ Action Restricted\n\nYou are allowed to view your profile, but the assessment cannot be started in a web browser.\nPlease switch to the desktop application to take the test.");
      return;
    }
    setView('pre-check');
  };

  const handleProceedToQuiz = () => {
    setView('quiz');
  };

  return (
    <div className="app-wrapper">
      <nav className="glass" style={{ margin: '1rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Terminal color="#50fa7b" size={24} />
          <span style={{ fontWeight: 700, fontSize: '1.2rem', tracking: '1px' }}>CORE_TESTER</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {isAdmin ? 'ADMIN MODE' : (candidateName ? `CANDIDATE: ${candidateName}` : 'ID: UNKNOWN')}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a
              href="/downloads/InterviewTester.dmg"
              download
              className="btn-icon"
              title="Download for macOS"
              style={{ textDecoration: 'none', fontSize: '0.8rem', width: 'auto', padding: '8px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)' }}
            >
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}> macOS</span>
            </a>
            <a
              href="/downloads/InterviewTester-Setup.exe"
              download
              className="btn-icon"
              title="Download for Windows"
              style={{ textDecoration: 'none', fontSize: '0.8rem', width: 'auto', padding: '8px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)' }}
            >
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>⊞ Windows</span>
            </a>
          </div>
          <button
            className="btn-icon"
            title="Exit Application"
            onClick={() => {
              if (window.confirm("Are you sure you want to exit?")) {
                if (ipcRenderer) {
                  ipcRenderer.send('exit-app');
                } else {
                  window.close();
                }
              }
            }}
          >
            <LogOut size={18} color="#ff5555" />
          </button>
        </div>
      </nav>

      {view === 'login' && <Login onLogin={handleLogin} />}
      {view === 'quiz' && (
        <Proctoring
          candidateName={candidateName}
          score={score}
          isFinished={false}
        />
      )}
      {view === 'dashboard' && <Dashboard onStart={startQuiz} candidateName={candidateName} />}
      {view === 'pre-check' && <PreTestCheck onProceed={handleProceedToQuiz} onBack={() => setView('dashboard')} />}
      {view === 'quiz' && <Quiz onFinish={finishQuiz} />}
      {view === 'admin-dashboard' && <AdminDashboard />}
      {view === 'super-admin-dashboard' && <SuperAdminDashboard onLogout={() => setView('login')} />}
      {view === 'result' && (
        <div className="container hero fade-in">
          <Proctoring
            candidateName={candidateName}
            score={score}
            isFinished={true}
          />
          <h1>Test Completed</h1>
          <p>Your performance has been logged to the secure central server.</p>
          <div className="glass card" style={{ padding: '3rem', marginTop: '2rem' }}>
            <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>FINAL SCORE</div>
            <div style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--primary)' }}>{score} / 10</div>
          </div>
          <button className="btn btn-secondary" style={{ marginTop: '2rem' }} onClick={() => window.location.reload()}>
            Retake Assessment
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
