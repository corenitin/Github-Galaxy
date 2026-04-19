import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { handleCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      navigate('/?error=' + error);
      return;
    }

    if (token) {
      handleCallback(token);
      navigate('/galaxy');
    } else {
      navigate('/');
    }
  }, [searchParams, handleCallback, navigate]);

  return (
    <div className="loading-cosmos">
      <div style={{ textAlign: 'center' }}>
        <div className="cosmos-spinner" style={{ margin: '0 auto 20px' }} />
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--star-dim)', fontSize: '13px' }}>
          Entering your galaxy...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
