import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../css/Profile.module.css';
import HeaderAD from './HeaderAD'; // นำเข้า Headeruser

function ProfileAD() {
    const [originalProfileData, setOriginalProfileData] = useState(null);
    const [profileData, setProfileData] = useState({
      username: '',
      password: '',
      name: '',
      gender: '',
      phone: '',
      address: '',
      IDcard: '',
      email: ''
    });
  
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
  
    const userId = localStorage.getItem('userId');
  
    useEffect(() => {
      async function fetchProfile() {
        if (!userId) {
          console.error('User ID not found');
          return;
        }
        try {
          const response = await axios.get(`http://localhost:3001/profile/${userId}`);
          setProfileData(response.data);
          setOriginalProfileData(response.data);
        } catch (error) {
          console.error('Error fetching profile data:', error);
        }
      }
  
      fetchProfile();
    }, [userId]);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setProfileData({ ...profileData, [name]: value });
    };
  
    const handleSave = async (e) => {
      e.preventDefault();
    
      // ตรวจสอบว่า Phone เป็นตัวเลขและมีความยาว 10 ตัว
      const phonePattern = /^\d{10}$/;
      if (!phonePattern.test(profileData.phone)) {
        alert('Phone ต้องเป็นตัวเลข 10 หลัก');
        return;
      }
    
      // ตรวจสอบว่า ID Card เป็นตัวเลขและมีความยาว 13 ตัว
      const idCardPattern = /^\d{13}$/;
      if (!idCardPattern.test(profileData.IDcard)) {
        alert('ID Card ต้องเป็นตัวเลข 13 หลัก');
        return;
      }
    
      // ตรวจสอบรหัสผ่านต้องมีความยาวขั้นต่ำ 6 ตัวอักษรและไม่เกิน 22 ตัว
      const passwordPattern = /^[A-Za-z0-9]{6,22}$/;
      if (!passwordPattern.test(profileData.password)) {
        alert('Password ต้องประกอบด้วยตัวอักษรภาษาอังกฤษหรือตัวเลขและมีความยาวระหว่าง 6 ถึง 22 ตัว');
        return;
      }
    
      try {
        await axios.put(`http://localhost:3001/profile/${userId}`, profileData);
        alert('อัปเดตข้อมูลโปรไฟล์สำเร็จ');
        setOriginalProfileData(profileData);
        setIsEditing(false);
        setShowPassword(false);
      } catch (error) {
        console.error('Error updating profile:', error);
        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message);
        } else {
          alert('เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์');
        }
      }
    };    
  
    const handleCancel = () => {
      setProfileData(originalProfileData);
      setIsEditing(false);
    };
  
    const handleEdit = () => {
      setIsEditing(true);
    };
  
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

  return (
    <div>
      <HeaderAD /> {/* เรียกใช้ Headeruser */}
      <div className={styles.profileContainer}>
        <h2 className={styles.title}>Profile</h2>
        <form className={styles.profileForm}>
          <label className={styles.formLabel}>Username:</label>
          <input
            type="text"
            name="username"
            value={profileData.username}
            disabled
            className={styles.formInput}
          />

          <label className={styles.formLabel}>Password:</label>
          <div className={styles.passwordContainer}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={profileData.password}
              onChange={handleChange}
              disabled={!isEditing}
              className={styles.formInput}
            />
            {isEditing && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={styles.togglePassword}
              >
                <i className={showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'} aria-hidden="true"></i>
              </button>
            )}
          </div>

          <label className={styles.formLabel}>Name:</label>
          <input
            type="text"
            name="name"
            value={profileData.name}
            onChange={handleChange}
            disabled={!isEditing}
            className={styles.formInput}
          />

          <label className={styles.formLabel}>Gender:</label>
          <select
            name="gender"
            value={profileData.gender}
            onChange={handleChange}
            disabled={!isEditing}
            className={styles.formInput}
          >
            <option value="">กรุณาเลือกเพศ</option>
            <option value="หญิง">หญิง</option>
            <option value="ชาย">ชาย</option>
          </select>

          <label className={styles.formLabel}>Phone:</label>
          <input
            type="text"
            name="phone"
            value={profileData.phone}
            onChange={handleChange}
            disabled={!isEditing}
            className={styles.formInput}
          />

          <label className={styles.formLabel}>Address:</label>
          <input
            type="text"
            name="address"
            value={profileData.address}
            onChange={handleChange}
            disabled={!isEditing}
            className={styles.formInput}
          />

          <label className={styles.formLabel}>ID Card:</label>
          <input
            type="text"
            name="IDcard"
            value={profileData.IDcard}
            onChange={handleChange}
            disabled={!isEditing}
            className={styles.formInput}
          />

          <label className={styles.formLabel}>Email:</label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleChange}
            disabled={!isEditing}
            className={styles.formInput}
          />

          {isEditing ? (
            <div className={styles.buttonGroup}>
              <button type="button" onClick={handleSave} className={styles.saveButton}>Save</button>
              <button type="button" onClick={handleCancel} className={styles.cancelButton}>Cancel</button>
            </div>
          ) : (
            <button type="button" onClick={handleEdit} className={styles.editButton}>Edit</button>
          )}
        </form>
      </div>
    </div>
  );
}

export default ProfileAD;
