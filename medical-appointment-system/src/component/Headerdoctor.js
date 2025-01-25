import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardCheck, faCalendarAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'; // นำเข้าไอคอนที่ใช้
import styles from '../css/headerdoctor.module.css'; // Assuming you have this CSS file

function Headerdoctor() {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
        window.location.reload();
    };

    return (
        <header className={styles.doctorDashboardHeader}>
            <div className={styles.doctorLogo}>MoodMend</div>
            <nav className={styles.doctorNav}>
                <Link to="/doctor-dashboard" className={styles.doctorNavLink}>
                    <FontAwesomeIcon icon={faClipboardCheck} /> Booking
                </Link>
                <Link to="/doctor-schedule" className={styles.doctorNavLink}>
                    <FontAwesomeIcon icon={faCalendarAlt} /> Schedule
                </Link>
                <a href="#logout" className={styles.doctorNavLink} onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                </a>
            </nav>
        </header>
    );
}

export default Headerdoctor;
