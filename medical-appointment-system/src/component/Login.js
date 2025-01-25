import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../css/Login.module.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', {
        username,
        password
      });

      const result = response.data;
      console.log('Login response:', result);

      if (response.status === 200) {
        localStorage.setItem('role', result.role);
        localStorage.setItem('userId', result.userId);
        if (result.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (result.role === 'doctor') {
          navigate('/doctor-dashboard');
        } else if (result.role === 'user') {
          navigate('/user-dashboard');
        } else {
          alert('Role not recognized');
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.loginContainer}>
      <header>
        <div className={styles.headerContainer}>
          <h1 className={styles.headerTitle}>MoodMend</h1>
        </div>
      </header>
      <main>
        <section id="login">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <label className={styles.formLabel}>
              Username:
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={styles.formInput}
              />
            </label>
            <label className={styles.formLabel}>
              Password:
              <div className={styles.passwordContainer}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={styles.formInput}
                />
                <button 
                  type="button" 
                  className={styles.togglePassword} 
                  onClick={togglePasswordVisibility}>
                  <FontAwesomeIcon 
                    icon={showPassword ? faEyeSlash : faEye} 
                    aria-hidden="true" 
                  />
                </button>
              </div>
            </label>
            <button type="submit" className={styles.loginButton}>Login</button>
          </form>
          <p>Don't have an account? <a href="/register">Register here</a></p>
        </section>
      </main>
    </div>
  );
}

export default Login;
