import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faClipboardCheck, faCalendarAlt, faInfoCircle, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'; // นำเข้าไอคอนที่ใช้
import styles from '../css/Headeruser.module.css';

function Headeruser() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  return (
    <header className={styles.userDashboardHeader}>
      <div className={styles.userLogo}>MoodMend</div>
      <nav className={styles.userNav}>
        <Link to="/user-dashboard" className={styles.userNavLink}>
          <FontAwesomeIcon icon={faHome} /> Home
        </Link>
        <Link to="/AssessmentUI" className={styles.userNavLink}>
          <FontAwesomeIcon icon={faClipboardCheck} /> Assessment
        </Link>
        <Link to="/reservation" className={styles.userNavLink}>
          <FontAwesomeIcon icon={faCalendarAlt} /> Reservation
        </Link>
        <Link to="/about-us" className={styles.userNavLink}>
          <FontAwesomeIcon icon={faInfoCircle} /> About us
        </Link>
        <Link to="/profile" className={styles.userNavLink}>
          <FontAwesomeIcon icon={faUser} /> Profile
        </Link>
        <a href="#logout" className={styles.userNavLink} onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </a>
      </nav>
    </header>
  );
}

export default Headeruser;
