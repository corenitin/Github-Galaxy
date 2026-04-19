import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Galaxy error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#03050f', gap: 20, padding: 40,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 40 }}>✦</div>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--star-white)', fontSize: 24 }}>
            A cosmic anomaly occurred
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--star-dim)', fontSize: 12, maxWidth: 400 }}>
            {this.state.error?.message || 'Something went wrong in the galaxy.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 13,
              padding: '10px 24px',
              background: 'rgba(79,195,247,0.1)',
              border: '1px solid rgba(79,195,247,0.4)',
              color: 'var(--accent-cyan)',
              borderRadius: 7, cursor: 'pointer',
            }}
          >
            Reload galaxy
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
