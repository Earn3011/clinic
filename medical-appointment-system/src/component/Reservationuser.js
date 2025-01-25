import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Headeruser from './Headeruser';
import ChatPopup from './ChatPopup';
import styles from '../css/reservation.module.css';
import {
  FaEdit,
  FaTrash,
  FaComments,
  FaCalendarAlt,
  FaClock,
  FaStethoscope,
} from 'react-icons/fa';

function Reservationuser() {
  const [date, setDate] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [problem, setProblem] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editAppointmentId, setEditAppointmentId] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatDoctorId, setChatDoctorId] = useState(null);
  const [recipientName, setRecipientName] = useState('');
  const [hasNewMessage, setHasNewMessage] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');

  const today = new Date().toISOString().split('T')[0];

  // ฟังก์ชันดึงข้อมูลการนัดหมาย
  const fetchAppointments = useCallback(() => {
    axios
      .get(`http://localhost:3001/api/appointments?user_id=${userId}`)
      .then((response) => {
        setAppointments(response.data);
      })
      .catch((error) =>
        console.error('Error fetching appointments:', error)
      );
  }, [userId]);

  // ดึงข้อมูลการนัดหมายเมื่อโหลดหน้า
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // ฟังก์ชันแปลงเวลาให้ตรงกับรูปแบบของตัวเลือกใน <select>
  const formatTimeForSelect = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return `${parseInt(hours, 10)}:${minutes}`;
  };

  // ดึงเวลาที่ว่างเมื่อวันที่และแพทย์เปลี่ยนแปลง
  useEffect(() => {
    if (date && selectedDoctor) {
      axios
        .get(
          `http://localhost:3001/api/available-times?date=${date}&doctor_id=${selectedDoctor}`
        )
        .then((response) => {
          let times = response.data;
          // ถ้าอยู่ในโหมดแก้ไข และเวลาไม่อยู่ใน availableTimes ให้เพิ่มเข้าไป
          if (isEditing && selectedTime && !times.includes(selectedTime)) {
            times = [...times, selectedTime];
          }
          setAvailableTimes(times);
          if (selectedDoctor === 'auto' && response.data.length === 0) {
            alert('การจองล้มเหลว เวลาที่จองเต็มแล้ว');
          }
        })
        .catch((error) =>
          console.error('Error fetching available times:', error)
        );
    } else {
      setAvailableTimes([]);
    }
  }, [date, selectedDoctor, isEditing, selectedTime]);

  // ดึงรายชื่อแพทย์
  useEffect(() => {
    axios
      .get('http://localhost:3001/api/doctors')
      .then((response) => setDoctors(response.data))
      .catch((error) => console.error('Error fetching doctors:', error));
  }, []);

  // จัดการเมื่อส่งฟอร์ม
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !selectedTime || !problem) {
      alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    if (role !== 'user') {
      alert('เฉพาะผู้ใช้เท่านั้นที่สามารถจองการนัดหมายได้');
      return;
    }

    const formattedTime = selectedTime.split('-')[0].trim();

    if (isEditing) {
      axios
        .put(`http://localhost:3001/api/appointment/${editAppointmentId}`, {
          date,
          time: formattedTime,
          problem,
          doctor_id: selectedDoctor,
        })
        .then(() => {
          alert('แก้ไขการนัดหมายสำเร็จ!');
          fetchAppointments(); // ดึงข้อมูลการนัดหมายใหม่
          setIsEditing(false);
          clearForm();
        })
        .catch((error) => {
          if (error.response && error.response.status === 409) {
            alert('การจองล้มเหลว: เวลาที่เลือกถูกจองแล้ว');
          } else {
            console.error('Error updating appointment:', error);
            alert('เกิดข้อผิดพลาดในการแก้ไขการนัดหมาย');
          }
        });
    } else {
      axios
        .post('http://localhost:3001/api/appointment', {
          user_id: userId,
          doctor_id: selectedDoctor,
          date,
          time: formattedTime,
          status: 'pending',
          problem,
        })
        .then((response) => {
          alert('จองการนัดหมายสำเร็จ!');
          fetchAppointments(); // ดึงข้อมูลการนัดหมายใหม่
          clearForm();
        })
        .catch((error) => {
          if (error.response && error.response.status === 409) {
            alert('การจองล้มเหลว: เวลาที่เลือกถูกจองแล้ว');
          } else {
            console.error('Error booking appointment:', error);
            alert('เกิดข้อผิดพลาดในการจองการนัดหมาย');
          }
        });
    }
  };

  // จัดการเมื่อแก้ไขการนัดหมาย
  const handleEdit = (appointmentId) => {
    const appointmentToEdit = appointments.find(
      (app) => app.appointment_id === appointmentId
    );
    if (appointmentToEdit) {
      const formattedDate = new Date(appointmentToEdit.date)
        .toISOString()
        .split('T')[0];

      setDate(formattedDate);
      setSelectedDoctor(appointmentToEdit.doctor_id || 'auto');
      setSelectedTime(formatTimeForSelect(appointmentToEdit.time));
      setProblem(appointmentToEdit.problem);
      setIsEditing(true);
      setEditAppointmentId(appointmentId);
    }
  };

  // จัดการเมื่อยกเลิกการนัดหมาย
  const handleDelete = (appointmentId) => {
    axios
      .delete(`http://localhost:3001/api/appointment/${appointmentId}`)
      .then(() => {
        alert('ลบการนัดหมายสำเร็จ!');
        fetchAppointments(); // ดึงข้อมูลการนัดหมายใหม่
      })
      .catch((error) =>
        console.error('Error deleting appointment:', error)
      );
  };

  // จัดการเมื่อเปิดแชท
  const handleChat = (doctorId, name) => {
    setChatDoctorId(doctorId);
    setRecipientName(name);
    setShowChat(true);

    setHasNewMessage((prev) => ({ ...prev, [doctorId]: false }));

    axios
      .put(
        `http://localhost:3001/api/chat/mark-as-read/${userId}/${doctorId}`,
        {
          recipient_role: role,
        }
      )
      .then(() => {
        console.log(
          'Messages marked as read for chat with doctor:',
          doctorId
        );
      })
      .catch((error) =>
        console.error('Error marking messages as read:', error)
      );
  };

  // ใช้ useCallback สำหรับฟังก์ชัน polling
  const pollForMessages = useCallback(
    (doctorId) => {
      axios
        .get(`http://localhost:3001/api/chat/${userId}/${doctorId}`)
        .then((response) => {
          const latestMessage = response.data[response.data.length - 1];
          if (
            latestMessage &&
            latestMessage.sender_role !== role &&
            !latestMessage.is_read
          ) {
            setHasNewMessage((prev) => ({
              ...prev,
              [doctorId]: true,
            }));
          }
        })
        .catch((error) =>
          console.error('Error polling for messages:', error)
        );
    },
    [userId, role]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      appointments.forEach((appt) => {
        if (appt.doctor_id) {
          pollForMessages(appt.doctor_id);
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [appointments, pollForMessages]);

  // ฟังก์ชันล้างฟอร์ม
  const clearForm = () => {
    setDate('');
    setSelectedTime('');
    setProblem('');
    setAvailableTimes([]);
    setSelectedDoctor('');
  };

  // ฟังก์ชันจัดรูปแบบวันที่สำหรับการแสดงผล
  const formatDateDisplay = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
  };

  // การแบ่งหน้า
  const itemsPerPage = 5;
  const sortedAppointments = appointments.sort((a, b) => {
    const todayDate = new Date(today);
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    if (dateA >= todayDate && dateB >= todayDate) {
      return dateA - dateB;
    } else if (dateA < todayDate && dateB < todayDate) {
      return dateB - dateA;
    } else if (dateA >= todayDate && dateB < todayDate) {
      return -1;
    } else {
      return 1;
    }
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = sortedAppointments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev === 1 ? prev : prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) =>
      prev === totalPages ? prev : prev + 1
    );
  };

  return (
    <div>
      <Headeruser />
      <div className={styles.pageContainer}>
        <div className={styles.content}>
          <div className={styles.reservationContainer}>
            <h2 className={styles.title}>
              <FaCalendarAlt />{' '}
              {isEditing ? 'แก้ไขการจอง' : 'จองการนัดหมาย'}
            </h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.label}>
                <FaCalendarAlt /> เลือกวันที่:
              </label>
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className={styles.input}
              />

              <label className={styles.label}>
                <FaStethoscope /> เลือกแพทย์:
              </label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className={styles.select}
                disabled={!date}
              >
                <option value="">กรุณาเลือกหมอ</option>
                <option value="auto">เลือกอัตโนมัติ</option>
                {doctors.map((doctor) => (
                  <option key={doctor.user_id} value={doctor.user_id}>
                    แพทย์{doctor.name}
                  </option>
                ))}
              </select>

              <label className={styles.label}>
                <FaClock /> เลือกเวลา:
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className={styles.select}
                disabled={!date || selectedDoctor === ''}
              >
                <option value="">
                  {availableTimes.length
                    ? 'เลือกเวลา'
                    : 'ไม่มีเวลาว่างในวันนี้'}
                </option>
                {availableTimes.map((time, index) => (
                  <option key={index} value={time}>
                    {time}
                  </option>
                ))}
              </select>

              <label className={styles.label}>
                <FaStethoscope /> อธิบายปัญหาของคุณ:
              </label>
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                className={styles.textarea}
                placeholder="กรอกปัญหาของคุณที่นี่..."
              />
              <button
                type="submit"
                className={`${styles.button} ${styles.submitButton}`}
              >
                {isEditing
                  ? 'อัปเดตการนัดหมาย'
                  : 'จองการนัดหมาย'}
              </button>
            </form>
          </div>

          <div className={styles.appointmentsContainer}>
            <h2 className={styles.title}>
              <FaCalendarAlt /> ประวัติการนัดหมาย
            </h2>
            {appointments.length === 0 ? (
              <p className={styles.noAppointments}>
                ไม่พบประวัติการจอง กรุณาจองคิว
              </p>
            ) : (
              <>
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>วันที่</th>
                        <th>เวลา</th>
                        <th>ปัญหา</th>
                        <th className={styles.doctorColumn}>แพทย์</th>
                        <th>สถานะ</th>
                        <th>การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentAppointments.map((appointment) => (
                        <tr key={appointment.appointment_id}>
                          <td>{formatDateDisplay(appointment.date)}</td>
                          <td>{appointment.time}</td>
                          <td>{appointment.problem}</td>
                          <td>
                            {appointment.doctor_name
                              ? `แพทย์${appointment.doctor_name}`
                              : 'ยังไม่ระบุ'}
                          </td>
                          <td>{appointment.status}</td>
                          <td>
                            {appointment.status === 'confirmed' ? (
                              <button
                                className={`${styles.button} ${styles.chatButton}`}
                                onClick={() =>
                                  handleChat(
                                    appointment.doctor_id,
                                    appointment.doctor_name || 'Doctor'
                                  )
                                }
                              >
                                <FaComments /> แชท
                                {hasNewMessage[appointment.doctor_id] && (
                                  <span
                                    className={styles.notificationBadge}
                                  >
                                    !
                                  </span>
                                )}
                              </button>
                            ) : (
                              appointment.status !== 'canceled' && (
                                <div className={styles.buttonContainer}>
                                  <button
                                    className={`${styles.button} ${styles.editButton}`}
                                    onClick={() =>
                                      handleEdit(
                                        appointment.appointment_id
                                      )
                                    }
                                  >
                                    <FaEdit /> แก้ไข
                                  </button>
                                  <button
                                    className={`${styles.button} ${styles.deleteButton}`}
                                    onClick={() =>
                                      handleDelete(
                                        appointment.appointment_id
                                      )
                                    }
                                  >
                                    <FaTrash /> ลบ
                                  </button>
                                </div>
                              )
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className={styles.pagination}>
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={styles.pageButton}
                  >
                    ก่อนหน้า
                  </button>
                  <span className={styles.pageInfo}>
                    หน้า {currentPage} จาก {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={styles.pageButton}
                  >
                    ถัดไป
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showChat && (
        <ChatPopup
          userId={userId}
          doctorId={chatDoctorId}
          recipientName={recipientName}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}

export default Reservationuser;
