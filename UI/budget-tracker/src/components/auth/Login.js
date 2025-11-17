import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Login</h1>
          <p>Enter your credentials to access your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <div className="login-footer">
          <div className="test-credentials">
            <p>Test credentials:</p>
            <p><strong>Email:</strong> admin@example.com</p>
            <p><strong>Password:</strong> admin123</p>
          </div>
        </div>
      </div>
    </div>
    
  );
}
