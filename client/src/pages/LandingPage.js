import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

const LandingPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/galaxy');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let stars = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: 280 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.6,
        alpha: 0.2 + Math.random() * 0.7,
        speed: 0.006 + Math.random() * 0.018,
        offset: Math.random() * Math.PI * 2,
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    const draw = () => {
      ctx.fillStyle = '#03050f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Nebula glow
      const cx = canvas.width * 0.5, cy = canvas.height * 0.42;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 340);
      grad.addColorStop(0, 'rgba(57,211,83,0.04)');
      grad.addColorStop(0.5, 'rgba(35,134,54,0.025)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(s => {
        const a = s.alpha * (0.5 + 0.5 * Math.sin(t * s.speed + s.offset));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,220,185,${a})`;
        ctx.fill();
      });
      t++;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="landing">
      <canvas ref={canvasRef} className="landing-canvas" />

      <nav className="landing-nav">
        <div className="nav-logo">✦ GALAXY</div>
        <button className="btn btn-primary" onClick={login}>Sign in with GitHub</button>
      </nav>

      <main className="landing-hero">
        <div className="hero-eyebrow">YOUR GITHUB UNIVERSE</div>
        <h1 className="hero-title">
          Every commit<br />
          <span className="hero-accent">builds a world.</span>
        </h1>
        <p className="hero-subtitle">
          Connect your GitHub and watch your repositories become planets —<br />
          orbiting, growing, glowing with every push you make.
        </p>
        <button className="btn-launch" onClick={login}>
          <span className="btn-launch-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </span>
          Launch your galaxy
        </button>

        <div className="hero-features">
          <div className="feature-pill">
            <span className="pill-dot" style={{ background: '#4fc3f7' }} />
            Active projects orbit in real-time
          </div>
          <div className="feature-pill">
            <span className="pill-dot" style={{ background: '#69f0ae' }} />
            Deployed repos form ringed planets
          </div>
          <div className="feature-pill">
            <span className="pill-dot" style={{ background: '#ffca28' }} />
            Commits = planetary mass
          </div>
        </div>
      </main>

      <div className="landing-preview">
        <div className="preview-orb orb-1" />
        <div className="preview-orb orb-2" />
        <div className="preview-orb orb-3" />
        <div className="preview-ring ring-1" />
        <div className="preview-ring ring-2" />
        <div className="preview-label label-1">portfolio-website</div>
        <div className="preview-label label-2">ml-experiments</div>
        <div className="preview-label label-3">devtools-cli</div>
      </div>

      <footer className="landing-footer">
        <span>Built with MERN · Three.js · GitHub OAuth</span>
      </footer>
    </div>
  );
};

export default LandingPage;
