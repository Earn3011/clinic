import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Headerdoctor from './Headerdoctor';
import ChatPopup from './ChatPopup';
import styles from '../css/doctorSchedule.module.css';
import { FaEdit, FaTrashAlt, FaCommentDots, FaSave } from 'react-icons/fa';

function DoctorSchedule() {
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 10;
  const [editAppointmentId, setEditAppointmentId] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatUserId, setChatUserId] = useState(null);
  const [recipientName, setRecipientName] = useState('');
  const [hasNewMessage, setHasNewMessage] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const doctorId = localStorage.getItem('userId');
  const role = 'doctor';

  const today = new Date().toISOString().split('T')[0];

  // ดึงชื่อแพทย์จาก API
  useEffect(() => {
    axios.get(`http://localhost:3001/profile/${doctorId}`)
      .then((response) => {
        setDoctorName(response.data.name);
      })
      .catch((error) => {
        console.error('Error fetching doctor profile:', error);
      });

    axios
      .get(`http://localhost:3001/api/doctor/schedule?doctor_id=${doctorId}`)
      .then((response) => {
        const sortedAppointments = response.data.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          const todayDate = new Date(today);
          if (dateA >= todayDate && dateB >= todayDate) {
            return dateA - dateB;
          } else if (dateA < todayDate && dateB < todayDate) {
            return dateA - dateB;
          } else if (dateA >= todayDate && dateB < todayDate) {
            return -1;
          } else {
            return 1;
          }
        });
        setAppointments(sortedAppointments);
      })
      .catch((error) => console.error('Error fetching schedule:', error));
  }, [doctorId, today]);

  // ฟังก์ชันแปลงเวลาเป็นรูปแบบ 24 ชั่วโมงสำหรับการแสดงผล
  const formatTime = (timeString) => {
    const [hour, minute] = timeString.split(':');
    return `${hour}:${minute}`;
  };

  // ฟังก์ชันแปลงวันที่สำหรับการแสดงผล
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
  };

  // ฟังก์ชันแปลงวันที่สำหรับ input type="date"
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return '';
    }
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() +1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };

  // ฟังก์ชันแปลงเวลาเป็นรูปแบบ HH:MM สำหรับ input type="time"
  const formatTimeForInput = (timeString) => {
    const [hour, minute] = timeString.split(':');
    return `${hour}:${minute}`;
  };

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.phone.includes(searchTerm) ||
      appointment.IDcard.includes(searchTerm)
  );

  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleEdit = (appointmentId) => {
    const appointment = appointments.find((appt) => appt.appointment_id === appointmentId);
    setEditAppointmentId(appointmentId);
    setNewDate(formatDateForInput(appointment.date));
    setNewTime(formatTimeForInput(appointment.time));
  };

  const handleEditSubmit = () => {
    console.log('Submitting edit for:', editAppointmentId, newDate, newTime);
  
    // ดึงปัญหาที่ตรงกับการนัดหมายที่กำลังแก้ไข
    const appointmentToEdit = appointments.find(appt => appt.appointment_id === editAppointmentId);
    const problem = appointmentToEdit ? appointmentToEdit.problem : '';
  
    axios.get(`http://localhost:3001/api/appointment/check/${editAppointmentId}?doctor_id=${doctorId}&date=${newDate}&time=${newTime}`)
      .then(response => {
        console.log('Check response:', response.data);
        if (response.data.isAvailable) {
          axios.put(`http://localhost:3001/api/appointment/${editAppointmentId}`, {
              doctor_id: doctorId,
              date: newDate,
              time: newTime,
              problem // ส่งค่า problem กลับไปพร้อมกับข้อมูลการอัปเดต
          })
          .then(() => {
              alert('แก้ไขการนัดหมายสำเร็จ!');
              setEditAppointmentId(null);
              fetchAppointments();
          })
          .catch(error => {
              console.error('Error updating appointment:', error);
          });
        } else {
          alert('ไม่สามารถแก้ไขได้: มีการนัดหมายอื่นในวันและเวลาเดียวกัน');
        }
      })
      .catch(error => {
        console.error('Error checking for appointment conflicts:', error);
        alert('เกิดข้อผิดพลาดในการตรวจสอบความขัดแย้ง');
      });
  };  

  const fetchAppointments = () => {
    axios.get(`http://localhost:3001/api/doctor/schedule?doctor_id=${doctorId}`).then((response) => {
        setAppointments(response.data);
    }).catch((error) => {
        console.error('Error fetching schedule:', error);
    });
  }

  const handleCancel = (appointmentId) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการนัดหมายนี้?')) {
      axios
        .put(`http://localhost:3001/api/appointment/${appointmentId}/cancel`)
        .then((response) => {
          const { user_id, date, time } = response.data;
          if (!user_id) {
            console.error('Error: user_id is undefined!');
            alert('Error: user_id is undefined');
          } else {
            const formattedDate = formatDate(date);
            const formattedTime = formatTime(time);
            axios
              .post('http://localhost:3001/sendemail', {
                user_id,
                appointment_id: appointmentId,
                date: formattedDate,
                time: formattedTime,
              })
              .then(() => {
                alert('ยกเลิกการนัดหมายและส่งอีเมลเรียบร้อยแล้ว!');
              })
              .catch((err) => {
                console.error('Error sending email after cancellation:', err);
              });
          }

          // ลบเฉพาะนัดหมายที่ถูกยกเลิกจาก appointments
          setAppointments((prevAppointments) =>
            prevAppointments.filter((appt) => appt.appointment_id !== appointmentId)
          );
        })
        .catch((error) => console.error('Error canceling appointment:', error));
    }
  };

  const handleChat = (userId, name) => {
    setChatUserId(userId);
    setRecipientName(name);
    setShowChat(true);

    setHasNewMessage((prev) => ({ ...prev, [userId]: false }));

    axios
      .put(`http://localhost:3001/api/chat/mark-as-read/${userId}/${doctorId}`, {
        recipient_role: role,
      })
      .then(() => {
        console.log('Messages marked as read for chat with user:', userId);
      })
      .catch((error) => console.error('Error marking messages as read:', error));
  };

  const pollForMessages = useCallback(
    (userId) => {
      axios
        .get(`http://localhost:3001/api/chat/${userId}/${doctorId}`)
        .then((response) => {
          const messages = response.data;
          const latestMessage = messages[messages.length - 1];
          if (latestMessage && latestMessage.sender_role !== role && !latestMessage.is_read) {
            setHasNewMessage((prev) => ({
              ...prev,
              [userId]: true,
            }));
          }
        })
        .catch((error) => {
          console.error('Error polling for messages:', error);
        });
    },
    [doctorId, role]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      appointments.forEach((appt) => {
        pollForMessages(appt.user_id);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [appointments, pollForMessages]);

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div>
      <Headerdoctor />
      <div className={styles.doctorScheduleContainer}>
        <h2 className={styles.title}>ตารางการนัดหมายของแพทย์ {doctorName}</h2>

        {/* แถบค้นหา */}
        <div className={styles.searchBar}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหา"
              className={styles.searchInput}
            />
            <button onClick={handleClearSearch} className={styles.clearButton}>
              &times;
            </button>
          </div>
        </div>
        {currentAppointments.length === 0 ? (
          <p className={styles.noAppointments}>ไม่พบข้อมูล</p>
        ) : (
          <div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ชื่อ</th>
                  <th>เบอร์โทร</th>
                  <th>เลขบัตรประชาชน</th>
                  <th>วันที่</th>
                  <th>เวลา</th>
                  <th>ปัญหา</th>
                  <th>คะแนนประเมินล่าสุด</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {currentAppointments.map((appointment) => (
                  <tr key={appointment.appointment_id}>
                    <td data-label="ชื่อ">{appointment.name}</td>
                    <td data-label="เบอร์โทร">{appointment.phone}</td>
                    <td data-label="เลขบัตรประชาชน">{appointment.IDcard}</td>
                    <td data-label="วันที่">{formatDate(appointment.date)}</td>
                    <td data-label="เวลา">{formatTime(appointment.time)}</td>
                    <td data-label="ปัญหา">{appointment.problem}</td>
                    <td data-label="คะแนนประเมินล่าสุด">
                      {appointment.latest_assessment_score ? appointment.latest_assessment_score : 'ไม่ระบุ'}
                    </td>
                    <td data-label="การจัดการ">
                      {new Date(appointment.date) < new Date(today) ? (
                        <button
                          onClick={() => handleChat(appointment.user_id, appointment.name)}
                          className={`${styles.button} ${styles.chatButton}`}
                        >
                          <FaCommentDots /> แชท
                          {hasNewMessage[appointment.user_id] && (
                            <span className={styles.notificationBadge}>!</span>
                          )}
                        </button>
                      ) : editAppointmentId === appointment.appointment_id ? (
                        <div className={styles.editContainer}>
                          <input
                            type="date"
                            value={newDate}
                            min={today}
                            onChange={(e) => setNewDate(e.target.value)}
                            className={styles.input}
                          />
                          <input
                            type="time"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className={styles.input}
                          />
                          <button
                            onClick={handleEditSubmit}
                            className={`${styles.button} ${styles.saveButton}`}
                          >
                            <FaSave /> บันทึก
                          </button>
                        </div>
                      ) : (
                        <div className={styles.buttonContainer}>
                          <button
                            onClick={() => handleEdit(appointment.appointment_id)}
                            className={`${styles.button} ${styles.editButton}`}
                          >
                            <FaEdit /> แก้ไข
                          </button>
                          <button
                            onClick={() => handleChat(appointment.user_id, appointment.name)}
                            className={`${styles.button} ${styles.chatButton}`}
                          >
                            <FaCommentDots /> แชท
                            {hasNewMessage[appointment.user_id] && (
                              <span className={styles.notificationBadge}>!</span>
                            )}
                          </button>
                          <button
                            onClick={() => handleCancel(appointment.appointment_id)}
                            className={`${styles.button} ${styles.cancelButton}`}
                          >
                            <FaTrashAlt /> ยกเลิก
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.pagination}>
              <button onClick={handlePrevPage} disabled={currentPage === 1}>
                ก่อนหน้า
              </button>
              <span>
                {currentPage} จาก {totalPages}
              </span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>

      {showChat && (
        <ChatPopup
          userId={chatUserId}
          doctorId={doctorId}
          recipientName={recipientName}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}

export default DoctorSchedule;
