import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faClipboardList, faDatabase, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'; // นำเข้าไอคอนที่ใช้
import styles from '../css/headerAD.module.css'; // Assuming you have this CSS file

function HeaderAD() {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
        window.location.reload();
    };

    return (
        <header className={styles.ADDashboardHeader}>
            <div className={styles.ADLogo}>MoodMend</div>
            <nav className={styles.ADNav}>
                <Link to="/admin-dashboard" className={styles.ADNavLink}>
                    <FontAwesomeIcon icon={faHome} /> Home
                </Link>
                <Link to="/test" className={styles.ADNavLink}>
                    <FontAwesomeIcon icon={faClipboardList} /> Assessment
                </Link>
                <Link to="/Management" className={styles.ADNavLink}>
                    <FontAwesomeIcon icon={faDatabase} /> Data
                </Link>
                <Link to="/profileAD" className={styles.ADNavLink}>
                    <FontAwesomeIcon icon={faUser} /> Profile
                </Link>
                <a href="#logout" className={styles.ADNavLink} onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                </a>
            </nav>
        </header>
    );
}

export default HeaderAD;
