import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Headerdoctor from './Headerdoctor';
import styles from '../css/doctorDashboard.module.css';
import { FaCheck, FaTrashAlt } from 'react-icons/fa';

function DoctorDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [doctorName, setDoctorName] = useState('');
    const doctorId = localStorage.getItem('userId');

    useEffect(() => {
        axios.get(`http://localhost:3001/profile/${doctorId}`)
            .then((response) => {
                setDoctorName(response.data.name);
            })
            .catch((error) => {
                console.error('Error fetching doctor profile:', error);
            });

        // ดึงข้อมูลการนัดหมายที่ยังไม่ได้ยืนยันที่เกี่ยวกับ doctorId นี้เท่านั้น
        axios.get(`http://localhost:3001/api/doctor/appointments-with-assessment?doctor_id=${doctorId}`)
            .then(response => {
                setAppointments(response.data);
            })
            .catch(error => {
                console.error('Error fetching appointments:', error);
            });
    }, [doctorId]);

    const handleConfirm = (appointmentId) => {
        axios.get(`http://localhost:3001/api/appointment/checks/${appointmentId}?doctor_id=${doctorId}`)
            .then(checkResponse => {
                if (checkResponse.data.isAvailable) {
                    axios.put(`http://localhost:3001/api/appointment/${appointmentId}/confirm`, {
                        doctor_id: doctorId,
                    })
                    .then(response => {
                        const userId = response.data.user_id;
                        alert('ยืนยันการนัดหมายสำเร็จ!');
    
                        const formattedDate = formatDate(response.data.date);
    
                        axios.post('http://localhost:3001/sendemail', {
                            user_id: userId,
                            appointment_id: appointmentId,
                            date: formattedDate,
                            time: response.data.time
                        })
                        .then(() => {
                            alert('ส่งอีเมลสำเร็จ!');
                        })
                        .catch(err => {
                            alert('เกิดข้อผิดพลาดในการส่งอีเมล');
                            console.error('Error sending email:', err);
                        });
    
                        // อัปเดตสถานะของการนัดหมายใน state
                        setAppointments(appointments.filter(appointment => appointment.appointment_id !== appointmentId));
                    })
                    .catch(error => {
                        if (error.response && error.response.status === 400) {
                            alert(error.response.data.message);
                        } else {
                            alert('เกิดข้อผิดพลาดในการยืนยันการนัดหมาย');
                        }
                        console.error('Error confirming appointment:', error);
                    });
                } else {
                    alert('ไม่สามารถยืนยันการนัดหมายได้: มีการนัดหมายที่ถูกยืนยันในวันและเวลานี้แล้ว');
                }
            })
            .catch(error => {
                alert('เกิดข้อผิดพลาดในการตรวจสอบการนัดหมาย');
                console.error('Error checking appointment:', error);
            });
    };
    

    const handleCancel = (appointmentId) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการนัดหมายนี้?')) {
            axios.put(`http://localhost:3001/api/appointment/${appointmentId}/cancel`)
                .then(response => {
                    const userId = response.data.user_id;
                    const formattedDate = formatDate(response.data.date);

                    // ส่งอีเมลแจ้งเตือนหลังจากยกเลิกการนัดหมาย
                    axios.post('http://localhost:3001/sendemail', {
                        user_id: userId,
                        appointment_id: appointmentId,
                        date: formattedDate,
                        time: response.data.time
                    })
                    .then(() => {
                        alert('ยกเลิกการนัดหมายและส่งอีเมลสำเร็จ!');
                    })
                    .catch(err => {
                        alert('เกิดข้อผิดพลาดในการส่งอีเมล');
                        console.error('Error sending email after cancellation:', err);
                    });

                    setAppointments(appointments.filter(appointment => appointment.appointment_id !== appointmentId));
                })
                .catch(error => {
                    alert('เกิดข้อผิดพลาดในการยกเลิกการนัดหมาย');
                    console.error('Error canceling appointment:', error);
                });
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('th-TH', options);
    };

    return (
        <div className={styles.dashboardBackground}>
            <Headerdoctor />
            <div className={styles.doctorDashboardContainer}>
                <h2 className={styles.title}>การนัดหมายที่ยังไม่ได้ยืนยันของแพทย์ {doctorName}</h2>
                
                {appointments.length === 0 ? (
                    <p className={styles.noAppointments}>ไม่มีการนัดหมายที่ยังไม่ได้ยืนยัน</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ชื่อ</th>
                                <th>เบอร์โทร</th>
                                <th>บัตรประชาชน</th>
                                <th>วันที่</th>
                                <th>เวลา</th>
                                <th>ปัญหา</th>
                                <th>คะแนนประเมิน</th>
                                <th>การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((appointment) => (
                                <tr key={appointment.appointment_id}>
                                    <td>{appointment.name}</td>
                                    <td>{appointment.phone}</td>
                                    <td>{appointment.IDcard}</td>
                                    <td>{formatDate(appointment.date)}</td>
                                    <td>{appointment.time}</td>
                                    <td>{appointment.problem}</td>
                                    <td>{appointment.latest_assessment_score ? appointment.latest_assessment_score : 'ไม่ระบุ'}</td>
                                    <td>
                                        <button
                                            className={styles.confirmButton}
                                            onClick={() => handleConfirm(appointment.appointment_id)}
                                        >
                                            <FaCheck /> ยืนยัน
                                        </button>
                                        <button
                                            className={styles.cancelButton}
                                            onClick={() => handleCancel(appointment.appointment_id)}
                                        >
                                            <FaTrashAlt /> ยกเลิก
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default DoctorDashboard;
