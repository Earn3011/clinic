import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // นำเข้า useNavigate
import styles from '../css/Register.module.css'; // แก้ไขการนำเข้า CSS Modules

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idCard, setIdCard] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate(); // ใช้ useNavigate เพื่อเปลี่ยนเส้นทาง

  const handleRegister = async (e) => {
    e.preventDefault();

    // ตรวจสอบว่า Username เป็นภาษาอังกฤษเท่านั้น
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      alert('Username ต้องประกอบด้วยตัวอักษรภาษาอังกฤษเท่านั้น');
      return;
    }

    // ตรวจสอบความยาวและรูปแบบของรหัสผ่าน
    if (password.length < 6 || password.length > 22) {
      alert('Password ต้องมีความยาวอย่างน้อย 6 ตัวและไม่เกิน 22 ตัว');
      return;
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(password)) {
      alert('Password ต้องประกอบด้วยตัวอักษรภาษาอังกฤษหรือตัวเลขเท่านั้น');
      return;
    }

    // ตรวจสอบว่ารหัสผ่านตรงกันหรือไม่
    if (password !== confirmPassword) {
      alert('Passwords ไม่เหมือนกัน');
      return;
    }

    // ตรวจสอบว่าฟิลด์ทั้งหมดถูกกรอกหรือไม่
    if (!username || !password || !name || !email || !phone || !idCard) {
      alert('All fields are required');
      return;
    }

    // ตรวจสอบความยาวของ Phone และ ID Card
    if (phone.length !== 10) {
      alert('Phone ต้องเป็นตัวเลข 10 หลัก');
      return;
    }

    if (idCard.length !== 13) {
      alert('ID Card ต้องเป็นตัวเลข 13 หลัก');
      return;
    }

    try {
      // ส่งข้อมูลการสมัครไปยัง backend
      const response = await axios.post('http://localhost:3001/register', {
        username,
        password,
        name,
        email,
        phone,
        idCard,
      });
      alert(response.data.message); // แสดงข้อความสำเร็จ

      // เปลี่ยนเส้นทางไปยังหน้า login
      navigate('/'); // เปลี่ยนเส้นทางไปที่หน้า login
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        alert(error.response.data.message); // แสดงข้อความ error จาก backend
      } else {
        alert('Registration failed. Please check your network connection or try again later.');
      }
    }
  };

  return (
    <div className={styles.registerContainer}>
      <header className={styles.headerContainer}>
        <h1 className={styles.headerTitle}>MoodMend</h1>
      </header>
      <main>
        <section id="register">
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
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
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                </button>
              </div>
            </label>
            <label className={styles.formLabel}>
              Confirm Password:
              <div className={styles.passwordContainer}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={styles.formInput}
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                </button>
              </div>
            </label>
            <label className={styles.formLabel}>
              Name:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="EX: มังมี ศรีสุข" 
                className={styles.formInput}
              />
            </label>
            <label className={styles.formLabel}>
              Email:
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.formInput}
              />
            </label>
            <label className={styles.formLabel}>
              Phone:
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const input = e.target.value;
                  const digitsOnly = input.replace(/\D/g, ''); // ลบตัวอักษรที่ไม่ใช่ตัวเลข
                  const limitedDigits = digitsOnly.slice(0, 10); // จำกัดความยาวไม่เกิน 10 ตัว
                  setPhone(limitedDigits);
                }}
                required
                className={styles.formInput}
              />
            </label>
            <label className={styles.formLabel}>
              ID Card:
              <input
                type="text"
                value={idCard}
                onChange={(e) => {
                  const input = e.target.value;
                  const digitsOnly = input.replace(/\D/g, ''); // ลบตัวอักษรที่ไม่ใช่ตัวเลข
                  const limitedDigits = digitsOnly.slice(0, 13); // จำกัดความยาวไม่เกิน 13 ตัว
                  setIdCard(limitedDigits);
                }}
                required
                className={styles.formInput}
              />
            </label>

            <button type="submit" className={styles.registerButton}>Register</button>
          </form>
          <p>Already Registered? <a href="/">Login here</a></p>
        </section>
      </main>
    </div>
  );
}

export default RegisterForm;
