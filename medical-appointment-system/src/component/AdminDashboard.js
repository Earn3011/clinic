import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import '../css/ADB.css';
import HeaderAD from './HeaderAD';

// ลงทะเบียนส่วนประกอบที่จำเป็น
ChartJS.register(ArcElement, Tooltip, Legend);

function AdminDashboard() {
  const [userCount, setUserCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // เพิ่มตัวแปร warning แยกสำหรับการจัดการคำเตือนแต่ละฝั่ง
  const [warningUser, setWarningUser] = useState(''); 
  const [warningBooking, setWarningBooking] = useState(''); 

  const [targetUserCount, setTargetUserCount] = useState(1000);
  const [targetBookingCount, setTargetBookingCount] = useState(500);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ดึงข้อมูลจำนวนสมาชิกและจำนวนการจองจาก API
        const userResponse = await axios.get('http://localhost:3001/api/users/count');
        const bookingResponse = await axios.get('http://localhost:3001/api/bookings/latest');
        const targetResponse = await axios.get('http://localhost:3001/api/targets'); // ดึงค่าเป้าหมายจาก API

        const totalUsers = userResponse.data.count;
        const totalBookings =
          bookingResponse.data.pending +
          bookingResponse.data.confirmed +
          bookingResponse.data.canceled;

        setUserCount(totalUsers);
        setBookingCount(totalBookings);

        // ตั้งค่าเป้าหมายจากฐานข้อมูล
        setTargetUserCount(targetResponse.data.target_user_count);
        setTargetBookingCount(targetResponse.data.target_booking_count);

        setLoading(false);
      } catch (error) {
        setError('Error fetching data');
        setLoading(false);
        console.error('Error fetching data', error);
      }
    };

    fetchData();
  }, []);

  // ฟังก์ชันอัปเดตค่าเป้าหมายสมาชิกและส่งไปยัง API
  const handleTargetUserChange = (event) => {
    const newValue = event.target.value;

    // ตรวจสอบว่าค่าที่กรอกไม่ต่ำกว่าจำนวนสมาชิกปัจจุบัน
    if (newValue < userCount) {
      setWarningUser(`เป้าหมายจำนวนสมาชิกต้องไม่ต่ำกว่า ${userCount}`);
    } else {
      setTargetUserCount(newValue);
      setWarningUser(''); // ล้างข้อความเตือนเมื่อค่าเป็นไปตามเงื่อนไข
    }
  };

  // ฟังก์ชันอัปเดตค่าเป้าหมายการจองและส่งไปยัง API
  const handleTargetBookingChange = (event) => {
    const newValue = event.target.value;

    // ตรวจสอบว่าค่าที่กรอกไม่ต่ำกว่าจำนวนการจองปัจจุบัน
    if (newValue < bookingCount) {
      setWarningBooking(`เป้าหมายจำนวนการจองต้องไม่ต่ำกว่า ${bookingCount}`);
    } else {
      setTargetBookingCount(newValue);
      setWarningBooking(''); // ล้างข้อความเตือนเมื่อค่าเป็นไปตามเงื่อนไข
    }
  };

  // ฟังก์ชันที่ใช้เมื่อผู้ใช้กรอกตัวเลขเสร็จ (onBlur)
  const saveTargetValues = async () => {
    if (!warningUser && !warningBooking) { // ตรวจสอบว่ามีข้อความเตือนหรือไม่ ถ้ามีไม่บันทึก
      try {
        await axios.post('http://localhost:3001/api/targets', {
          target_user_count: targetUserCount,
          target_booking_count: targetBookingCount,
        });
        console.log('Target values saved successfully.');
      } catch (error) {
        console.error('Error saving target values:', error);
      }
    }
  };

  // คำนวณเปอร์เซ็นต์
  const userPercentage = (userCount / Number(targetUserCount)) * 100;
  const bookingPercentage = (bookingCount / Number(targetBookingCount)) * 100;

  // ข้อมูลกราฟสำหรับ Doughnut chart
  const userData = {
    labels: ['จำนวนสมาชิก', 'เป้าหมาย'],
    datasets: [
      {
        data: [userPercentage, 100 - userPercentage],
        backgroundColor: ['#27AE60', '#EAEDED'],
      },
    ],
  };

  const bookingData = {
    labels: ['จำนวนการจอง', 'เป้าหมาย'],
    datasets: [
      {
        data: [bookingPercentage, 100 - bookingPercentage],
        backgroundColor: ['#3498DB', '#EAEDED'],
      },
    ],
  };

  if (loading) {
    return <div>กำลังโหลด...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <HeaderAD />
      <div className="dashboard-container">
        <div className="stat-box">
          <p>จำนวนสมาชิกทั้งหมด / เป้าหมาย</p>
          <h2>{userCount} / {targetUserCount}</h2>
          
          <div className="input-container">
            <label htmlFor="targetUserCount">เป้าหมายจำนวนสมาชิก:</label>
            <input
              type="number"
              id="targetUserCount"
              value={targetUserCount}
              onChange={handleTargetUserChange}
              onBlur={saveTargetValues}
            />
          </div>

          {/* แสดงกราฟ Doughnut */}
          <div className="doughnut-chart">
            <Doughnut data={userData} />
          </div>

          {/* แสดงคำเตือนด้านล่างของกราฟสำหรับสมาชิก */}
          {warningUser && <p className="warning">{warningUser}</p>}
        </div>
        
        <div className="stat-box">
          <p>จำนวนการจองทั้งหมด / เป้าหมาย</p>
          <h2>{bookingCount} / {targetBookingCount}</h2>
          
          <div className="input-container">
            <label htmlFor="targetBookingCount">เป้าหมายจำนวนการจอง:</label>
            <input
              type="number"
              id="targetBookingCount"
              value={targetBookingCount}
              onChange={handleTargetBookingChange}
              onBlur={saveTargetValues}
            />
          </div>

          {/* แสดงกราฟ Doughnut */}
          <div className="doughnut-chart">
            <Doughnut data={bookingData} />
          </div>

          {/* แสดงคำเตือนด้านล่างของกราฟสำหรับการจอง */}
          {warningBooking && <p className="warning">{warningBooking}</p>}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
