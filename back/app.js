const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(bodyParser.json());
app.use(cors()); // ใช้ CORS middleware

// การเชื่อมต่อกับฐานข้อมูล
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'clinic'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

//สมัครสมาชิก
app.post('/register', (req, res) => {
  const { username, password, name, email, phone, idCard } = req.body;

  console.log("Received Data: ", req.body); // ตรวจสอบข้อมูลที่ถูกส่งเข้ามา

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!username || !password || !name || !email || !phone || !idCard) {
    console.log('Validation Failed: Missing required fields');
    return res.status(400).json({ message: 'All fields are required' });
  }

  // ตรวจสอบรูปแบบและความยาวของ Phone และ ID Card
  const phoneRegex = /^\d{10}$/;
  const idCardRegex = /^\d{13}$/;

  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
  }

  if (!idCardRegex.test(idCard)) {
    return res.status(400).json({ message: 'ID Card must be exactly 13 digits' });
  }

  // ตรวจสอบว่าข้อมูลซ้ำหรือไม่
  const checkDuplicateQuery = 'SELECT * FROM user WHERE username = ? OR email = ? OR phone = ? OR IDcard = ? OR name = ?';
  db.query(checkDuplicateQuery, [username, email, phone, idCard, name], (err, result) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    console.log("Query result: ", result);

    if (result.length > 0) {
      const duplicateFields = [];
      if (result.some(user => user.username === username)) duplicateFields.push('username');
      if (result.some(user => user.email === email)) duplicateFields.push('email');
      if (result.some(user => user.phone === phone)) duplicateFields.push('phone');
      if (result.some(user => user.IDcard === idCard)) duplicateFields.push('idCard');
      if (result.some(user => user.name === name)) duplicateFields.push('name');

      console.log("Duplicate fields found: ", duplicateFields);

      return res.status(400).json({ message: `The following fields are already taken: ${duplicateFields.join(', ')}` });
    }

    // ถ้าไม่พบข้อมูลซ้ำ ให้ดำเนินการเพิ่มข้อมูลผู้ใช้
    const userQuery = 'INSERT INTO user (username, password, name, email, phone, IDcard) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(userQuery, [username, password, name, email, phone, idCard], (err, userResult) => {
      if (err) {
        console.error('Error inserting into user table:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      const userId = userResult.insertId;

      // เพิ่มข้อมูลการเข้าสู่ระบบ
      const loginQuery = 'INSERT INTO login (user_id, role) VALUES (?, ?)';
      db.query(loginQuery, [userId, 'user'], (err, loginResult) => {
        if (err) {
          console.error('Error inserting into login table:', err);
          return res.status(500).json({ message: 'Database error' });
        }

        console.log('User registered successfully');
        res.status(201).json({ message: 'User registered successfully' });
      });
    });
  });
});

//ล็อกอิน
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const query = 'SELECT * FROM user WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error querying user:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = results[0];
    // ดึง role จากฐานข้อมูล login
    const loginQuery = 'SELECT role FROM login WHERE user_id = ?';
    db.query(loginQuery, [user.user_id], (err, loginResult) => {
      if (err) {
        console.error('Error querying login:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (loginResult.length === 0) {
        return res.status(401).json({ message: 'Role not found' });
      }

      const role = loginResult[0].role;
      res.status(200).json({ role, userId: user.user_id, message: 'Login successful' });
    });
  });
});


// เส้นทางสำหรับดึงข้อมูลโปรไฟล์ผู้ใช้
app.get('/profile/:userId', (req, res) => {
  const userId = req.params.userId; // รับ userId จาก URL parameter
  const sql = 'SELECT username, password, name, gender, phone, address, IDcard, email FROM user WHERE user_id = ?';
  
  db.query(sql, [userId], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).send('User not found');
    }
  });
});

// อัปเดตข้อมูลผู้ใช้งาน
app.put('/profile/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { password, name, gender, phone, address, IDcard, email } = req.body;

  // ตรวจสอบว่า Phone เป็นตัวเลขและมีความยาว 10 ตัว
  const phonePattern = /^\d{10}$/;
  if (!phonePattern.test(phone)) {
    return res.status(400).json({ message: 'Phone ต้องเป็นตัวเลข 10 หลัก' });
  }

  // ตรวจสอบว่า ID Card เป็นตัวเลขและมีความยาว 13 ตัว
  const idCardPattern = /^\d{13}$/;
  if (!idCardPattern.test(IDcard)) {
    return res.status(400).json({ message: 'ID Card ต้องเป็นตัวเลข 13 หลัก' });
  }

  // ตรวจสอบข้อมูลซ้ำ
  let duplicateFields = [];

  const checkDuplicate = (fieldName, fieldValue) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT user_id FROM user WHERE ${fieldName} = ? AND user_id != ?`;
      db.query(sql, [fieldValue, userId], (err, results) => {
        if (err) {
          return reject(err);
        }
        if (results.length > 0) {
          duplicateFields.push(fieldName);
        }
        resolve();
      });
    });
  };

  try {
    await Promise.all([
      checkDuplicate('name', name),
      checkDuplicate('phone', phone),
      checkDuplicate('IDcard', IDcard),
      checkDuplicate('email', email),
    ]);

    if (duplicateFields.length > 0) {
      return res.status(400).json({ message: 'ข้อมูลซ้ำในฟิลด์: ' + duplicateFields.join(', ') });
    }

    // ไม่มีข้อมูลซ้ำ ทำการอัปเดตข้อมูล
    const sql = `
      UPDATE user SET
      password = ?,
      name = ?,
      gender = ?,
      phone = ?,
      address = ?,
      IDcard = ?,
      email = ?
      WHERE user_id = ?
    `;

    db.query(sql, [password, name, gender, phone, address, IDcard, email, userId], (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.send('อัปเดตข้อมูลโปรไฟล์สำเร็จ');
    });
  } catch (err) {
    return res.status(500).send(err);
  }
});


// เส้นทางสำหรับการส่งแบบประเมิน
app.post('/assessment', (req, res) => {
  const { user_id, score, request } = req.body;

  if (!user_id || score === null || score === undefined || request === null || request === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = 'INSERT INTO Assessment (user_id, score, request, created_at) VALUES (?, ?, ?, NOW())';
  db.query(query, [user_id, score, request], (err, result) => {
      if (err) {
          console.error('Error inserting data:', err);
          return res.status(500).json({ error: 'Failed to save assessment' });
      }
      res.status(200).json({ message: 'Assessment saved successfully' });
  });
});


// เส้นทางสำหรับดึงประวัติแบบประเมินของผู้ใช้
app.get('/api/assessments/:userId', (req, res) => {
  const userId = req.params.userId;
  const sql = 'SELECT created_at, score, request FROM assessment WHERE user_id = ? ORDER BY created_at DESC';
  
  db.query(sql, [userId], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(result); // ส่งข้อมูลที่เรียงใหม่ล่าสุดไปยังเก่าสุดกลับไป
  });
});



// เส้นทางสำหรับดึงข้อมูลคำถามแบบประเมิน
app.get('/api/questions', (req, res) => {
  const query = 'SELECT no, question_text FROM questions ORDER BY no ASC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching questions:', err);
      return res.status(500).json({ error: 'Database query error' });
    }
    
    // ส่งผลลัพธ์เป็น JSON
    res.json(results);
  });
});


// API สำหรับสร้างการนัดหมาย (เลือกแพทย์อัตโนมัติถ้าไม่ระบุ)
app.post('/api/appointment', (req, res) => {
  const { user_id, doctor_id, date, time, status, problem } = req.body;

  const chooseDoctor = (callback) => {
    if (doctor_id === 'auto' || !doctor_id) {
      // เลือกแพทย์ที่มีการนัดหมายน้อยที่สุดในวันที่เลือก
      const autoSelectDoctorQuery = `
        SELECT u.user_id 
        FROM user u
        JOIN login l ON u.user_id = l.user_id
        LEFT JOIN appointment a ON u.user_id = a.doctor_id AND a.date = ?
        WHERE l.role = 'doctor'
        GROUP BY u.user_id
        ORDER BY COUNT(a.appointment_id) ASC
        LIMIT 1
      `;
      db.query(autoSelectDoctorQuery, [date], (err, results) => {
        if (err || results.length === 0) {
          console.error('Error selecting doctor automatically:', err);
          return res.status(500).json({ message: 'Error selecting doctor', error: err });
        }
        callback(results[0].user_id); // ส่ง user_id ของแพทย์ที่เลือกกลับไป
      });
    } else {
      callback(doctor_id); // ถ้ามี doctor_id อยู่แล้ว ใช้ doctor_id นี้
    }
  };

  chooseDoctor((selectedDoctorId) => {
    // ตรวจสอบว่ามีการนัดหมายซ้ำหรือไม่
    const checkConflictQuery = `
      SELECT * FROM appointment 
      WHERE doctor_id = ? 
        AND date = ? 
        AND time = ? 
        AND status = 'confirmed';
    `;
    db.query(checkConflictQuery, [selectedDoctorId, date, time], (err, conflicts) => {
      if (err) {
        console.error('Error checking for conflicts:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }

      if (conflicts.length > 0) {
        // แจ้งเตือนว่ามีการนัดหมายซ้ำ
        return res.status(409).json({ message: 'ไม่สามารถจองได้: มีการนัดหมายซ้ำในวันและเวลาเดียวกัน' });
      } else {
        // ถ้าไม่มีการนัดหมายซ้ำ บันทึกการนัดหมาย
        const appointmentQuery = `
          INSERT INTO appointment (user_id, doctor_id, date, time, status, problem)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(appointmentQuery, [user_id, selectedDoctorId, date, time, status, problem], (err, result) => {
          if (err) {
            console.error('Error inserting appointment:', err);
            return res.status(500).json({ message: 'Database error', error: err });
          }
          res.status(201).json({ message: 'จองการนัดหมายสำเร็จ' });
        });
      }
    });
  });
});


// API สำหรับดึงรายชื่อแพทย์
app.get('/api/doctors', (req, res) => {
  const sql = `
    SELECT u.user_id, u.name
    FROM user u
    JOIN login l ON u.user_id = l.user_id
    WHERE l.role = 'doctor'
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching doctors:', err);
      res.status(500).send('Error fetching doctors');
    } else {
      res.json(results);
    }
  });
});

// ดึงข้อมูลการจองทั้งหมดสำหรับผู้ใช้
app.get('/api/appointments', (req, res) => {
  const userId = req.query.user_id; // ดึง user_id จาก query
  
  // ใช้การ JOIN เพื่อดึงชื่อแพทย์เสมอ
  const query = `
    SELECT 
      a.appointment_id, 
      a.date, 
      a.time, 
      a.problem, 
      a.status,
      a.doctor_id,
      u.name AS doctor_name
    FROM appointment a
    LEFT JOIN user u ON a.doctor_id = u.user_id
    WHERE a.user_id = ?
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching appointments:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.status(200).json(results);
  });
});


//ลบ
app.delete('/api/appointment/:appointmentId', (req, res) => {
  const { appointmentId } = req.params;

  const deleteQuery = `DELETE FROM appointment WHERE appointment_id = ?`;

  db.query(deleteQuery, [appointmentId], (err, result) => {
      if (err) {
          console.error('Error deleting appointment:', err);
          return res.status(500).json({ message: 'Database error', error: err });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Appointment not found' });
      }

      res.status(200).json({ message: 'Appointment deleted successfully' });
  });
});

// API สำหรับแก้ไขการนัดหมาย
app.put('/api/appointment/:appointmentId', (req, res) => {
  const { appointmentId } = req.params;
  const { doctor_id, date, time, problem } = req.body;

  // ตรวจสอบว่ามีการนัดหมายซ้ำหรือไม่
  const checkConflictQuery = `
    SELECT * FROM appointment 
    WHERE doctor_id = ? 
      AND date = ? 
      AND time = ? 
      AND status = 'confirmed' 
      AND appointment_id != ?;
  `;

  db.query(checkConflictQuery, [doctor_id, date, time, appointmentId], (err, conflicts) => {
    if (err) {
      console.error('Error checking for conflicts:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (conflicts.length > 0) {
      // ถ้ามีการนัดหมายซ้ำ ให้แจ้งเตือนว่าไม่สามารถแก้ไขได้
      return res.status(409).json({ message: 'ไม่สามารถแก้ไขได้: มีการนัดหมายซ้ำในวันและเวลาเดียวกัน' });
    } else {
      // ถ้าไม่มีการนัดหมายซ้ำ ให้ดำเนินการแก้ไข
      const updateQuery = `
        UPDATE appointment 
        SET doctor_id = ?, date = ?, time = ?, problem = ? 
        WHERE appointment_id = ?;
      `;
      db.query(updateQuery, [doctor_id, date, time, problem, appointmentId], (err, result) => {
        if (err) {
          console.error('Error updating appointment:', err);
          return res.status(500).json({ message: 'Database error', error: err });
        }

        res.status(200).json({ message: 'แก้ไขการนัดหมายสำเร็จ' });
      });
    }
  });
});


//ยืนยันการจองหมอ
app.put('/api/appointment/:appointmentId/confirm', (req, res) => {
  const { appointmentId } = req.params;
  const doctorId = req.body.doctor_id;

  // ตรวจสอบว่า user ที่ยืนยันเป็นหมอหรือไม่
  const roleQuery = `SELECT role FROM login WHERE user_id = ?`;

  db.query(roleQuery, [doctorId], (err, results) => {
    if (err || results.length === 0 || results[0].role !== 'doctor') {
      return res.status(400).json({ message: 'Invalid doctor_id or user is not a doctor' });
    }

    // อัปเดต doctor_id และเปลี่ยนสถานะเป็น 'confirmed'
    const confirmQuery = `
      UPDATE appointment
      SET doctor_id = ?, status = 'confirmed'
      WHERE appointment_id = ?
    `;

    db.query(confirmQuery, [doctorId, appointmentId], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Appointment not found or not updated' });
      }

      // ดึง user_id ของผู้จองนัดหมายเพื่อนำไปใช้ในการส่งอีเมล
      const getUserQuery = `SELECT user_id FROM appointment WHERE appointment_id = ?`;
      db.query(getUserQuery, [appointmentId], (err, userResult) => {
        if (err) {
          return res.status(500).json({ message: 'Error fetching user_id', error: err });
        }

        if (userResult.length === 0) {
          return res.status(404).json({ message: 'User not found for this appointment' });
        }

        const userId = userResult[0].user_id;

        // ส่งกลับไปยัง frontend พร้อมกับ user_id เพื่อใช้ในการส่งอีเมล
        res.status(200).json({ message: 'Appointment confirmed successfully', user_id: userId });
      });
    });
  });
});

// เส้นทางสำหรับการดึงเวลาว่างในวันนั้นๆ
app.get('/api/available-times', (req, res) => {
  const { date, doctor_id } = req.query;

  const availableTimes = [
    '8:00',
    '9:00',
    '10:00',
    '11:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00'
  ];

  // ตรวจสอบเวลาที่ถูกจองในวันนั้นของแพทย์คนนั้น
  const query = `
    SELECT time FROM appointment 
    WHERE date = ? AND doctor_id = ? AND status = 'confirmed';
  `;

  db.query(query, [date, doctor_id], (err, results) => {
    if (err) {
      console.error('Error fetching booked times:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    // แปลงเวลาที่จองแล้วให้อยู่ในรูปแบบที่ตรงกับ availableTimes (เช่น '09:00:00' เป็น '9:00')
    const bookedTimes = results.map(result => {
      const time = result.time;
      const [hours, minutes] = time.split(':');
      return `${parseInt(hours, 10)}:${minutes}`; // เช่น 09:00:00 -> 9:00
    });

    const freeTimes = availableTimes.filter(time => !bookedTimes.includes(time));

    res.json(freeTimes);
  });
});

// เส้นทางสำหรับการดึงนัดหมายทั้งหมดของผู้ใช้
app.get('/api/appointments/:userId', (req, res) => {
  const { userId } = req.params;
  const query = `SELECT * FROM appointment WHERE user_id = ?`;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching appointments:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});


// API ดึงนัดหมายที่รอยืนยัน (status = 'pending')
app.get('/api/appointments', (req, res) => {
  const { status } = req.query;

  const query = `
    SELECT * FROM appointment WHERE status = ?
  `;
  
  db.query(query, [status], (err, results) => {
    if (err) {
      console.error('Error fetching appointments:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.json(results);
  });
});

// ดึงการจองให้หมอ
app.get('/api/doctor/appointments-with-assessment', (req, res) => {
  const doctorId = req.query.doctor_id;

  // Query to fetch unconfirmed appointments along with the latest assessment score where request = 'yes'
  const query = `
      SELECT user.name, user.phone, user.IDcard, appointment.appointment_id,
             appointment.date, appointment.time, appointment.problem,
             (SELECT score FROM assessment 
              WHERE assessment.user_id = appointment.user_id 
                AND request = 'yes' 
              ORDER BY created_at DESC LIMIT 1) AS latest_assessment_score
      FROM appointment
      JOIN user ON appointment.user_id = user.user_id
      WHERE appointment.status = 'pending' AND appointment.doctor_id = ?  -- ตรวจสอบ doctor_id
  `;

  db.query(query, [doctorId], (err, results) => {
      if (err) {
          return res.status(500).json({ message: 'Database error', error: err });
      }

      results.forEach(result => {
          if (!result.latest_assessment_score) {
              result.latest_assessment_score = 'ไม่ระบุ';
          }
      });

      res.status(200).json(results);
  });
});

// ดึงไปตารางงานให้หมอ
app.get('/api/doctor/schedule', (req, res) => {
  const doctorId = req.query.doctor_id;

  // Query to fetch confirmed appointments for the logged-in doctor
  const query = `
      SELECT user.user_id, user.name, user.phone, user.IDcard, appointment.appointment_id,
             appointment.date, appointment.time, appointment.problem,
             (SELECT score FROM assessment 
              WHERE assessment.user_id = appointment.user_id 
                AND request = 'yes' 
              ORDER BY created_at DESC LIMIT 1) AS latest_assessment_score
      FROM appointment
      JOIN user ON appointment.user_id = user.user_id
      WHERE appointment.status = 'confirmed' AND appointment.doctor_id = ?
  `;

  db.query(query, [doctorId], (err, results) => {
      if (err) {
          return res.status(500).json({ message: 'Database error', error: err });
      }

      res.status(200).json(results); // ส่งข้อมูลทั้งหมด รวมถึง user_id กลับไปยัง frontend
  });
});



// ค้นหาผู้ใช้ของหมอ
app.get('/api/doctor/search', (req, res) => {
  const { searchTerm, doctor_id } = req.query;

  const query = `
      SELECT user.user_id, user.name, user.phone, user.IDcard, appointment.appointment_id,
             appointment.date, appointment.time, appointment.problem,
             (SELECT score FROM assessment 
              WHERE assessment.user_id = appointment.user_id 
                AND request = 'yes' 
              ORDER BY created_at DESC LIMIT 1) AS latest_assessment_score
      FROM appointment
      JOIN user ON appointment.user_id = user.user_id
      WHERE appointment.doctor_id = ?
      AND appointment.status IN ('confirmed', 'canceled')  -- Check for confirmed or canceled status
      AND (user.name LIKE ? OR user.phone LIKE ? OR user.IDcard LIKE ?)
  `;

  const searchValue = `%${searchTerm}%`; // Use LIKE for partial matches
  db.query(query, [doctor_id, searchValue, searchValue, searchValue], (error, results) => {
      if (error) {
          console.error('Error searching appointments:', error);
          res.status(500).json({ error: 'Failed to search appointments' });
      } else {
          res.json(results);
      }
  });
});


// ส่งเมลหลังการยืนยัน, ยกเลิก หรือแก้ไขการนัดหมาย
// ยืนยันการนัดหมายพร้อมตรวจสอบวันและเวลา และส่งอีเมลหลังการยืนยัน
app.put('/api/appointment/:appointmentId/confirm', (req, res) => {
  const { appointmentId } = req.params;
  const { doctor_id } = req.body;

  // ดึงข้อมูลวันที่และเวลาของการนัดหมายที่ต้องการยืนยัน
  const getAppointmentQuery = `SELECT date, time FROM appointment WHERE appointment_id = ?`;

  db.query(getAppointmentQuery, [appointmentId], (err, results) => {
      if (err) {
          console.error('Error fetching appointment:', err);
          return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการนัดหมาย' });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: 'ไม่พบการนัดหมายที่ต้องการ' });
      }

      const { date, time } = results[0];

      // ตรวจสอบว่ามีการนัดหมายที่ถูกยืนยันในวันและเวลาเดียวกันหรือไม่
      const checkQuery = `SELECT * FROM appointment WHERE doctor_id = ? AND date = ? AND time = ? AND status = 'confirmed'`;

      db.query(checkQuery, [doctor_id, date, time], (err, existingAppointments) => {
          if (err) {
              console.error('Error checking for existing appointments:', err);
              return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบการนัดหมาย' });
          }

          if (existingAppointments.length > 0) {
              // พบการนัดหมายที่ซ้ำกัน
              return res.status(400).json({ message: 'ไม่สามารถยืนยันการนัดหมายได้: คุณมีการนัดหมายที่ถูกยืนยันในวันและเวลานี้แล้ว' });
          }

          // ไม่มีการนัดหมายที่ซ้ำกัน สามารถยืนยันได้
          const updateQuery = `UPDATE appointment SET status = 'confirmed' WHERE appointment_id = ?`;

          db.query(updateQuery, [appointmentId], (err, updateResult) => {
              if (err) {
                  console.error('Error updating appointment:', err);
                  return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตการนัดหมาย' });
              }

              if (updateResult.affectedRows === 0) {
                  return res.status(404).json({ message: 'ไม่พบการนัดหมายที่ต้องการ' });
              }

              // ดึงข้อมูลอีเมล, วันที่, เวลา, สถานะ
              const fetchAppointmentQuery = `
                  SELECT u.email, a.date, a.time 
                  FROM user u
                  JOIN appointment a ON u.user_id = a.user_id
                  WHERE a.appointment_id = ?
              `;

              db.query(fetchAppointmentQuery, [appointmentId], (err, appointmentDetails) => {
                  if (err || appointmentDetails.length === 0) {
                      console.error('Error fetching appointment details:', err);
                      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการนัดหมาย' });
                  }

                  const { email, date, time } = appointmentDetails[0];
                  sendStatusEmail(email, date, time, 'confirmed');  // ส่งอีเมลยืนยัน

                  res.status(200).json({ message: 'Appointment confirmed and email sent successfully' });
              });
          });
      });
  });
});

//เช็คหน้าschedule
app.get('/api/appointment/check/:appointmentId', (req, res) => {
  const { appointmentId } = req.params;
  const { doctor_id, date, time } = req.query;

  const checkQuery = `
    SELECT * FROM appointment 
    WHERE doctor_id = ? 
      AND date = ? 
      AND time = ? 
      AND status = 'confirmed' 
      AND appointment_id != ?;
  `;
  
  db.query(checkQuery, [doctor_id, date, time, appointmentId], (err, appointments) => {
    if (err) {
      console.error('Error checking for existing appointments:', err);
      return res.status(500).json({ message: 'Error checking for existing appointments' });
    }
    if (appointments.length > 0) {
      res.json({ isAvailable: false });
    } else {
      res.json({ isAvailable: true });
    }
  });
});

//เช็คหน้าDoctorDashboard
app.get('/api/appointment/checks/:appointmentId', (req, res) => {
  const { appointmentId } = req.params;
  const { doctor_id } = req.query;

  const getAppointmentQuery = `SELECT date, time FROM appointment WHERE appointment_id = ?`;
  db.query(getAppointmentQuery, [appointmentId], (err, results) => {
      if (err) {
          console.error('Error fetching appointment details:', err);
          return res.status(500).send('Error fetching appointment details');
      }
      if (results.length > 0) {
          const { date, time } = results[0];
          const checkQuery = `SELECT * FROM appointment WHERE doctor_id = ? AND date = ? AND time = ? AND status = 'confirmed'`;
          db.query(checkQuery, [doctor_id, date, time], (err, appointments) => {
              if (err) {
                  console.error('Error checking for existing appointments:', err);
                  return res.status(500).json({ message: 'Error checking for existing appointments' });
              }
              if (appointments.length > 0) {
                  res.json({ isAvailable: false });
              } else {
                  res.json({ isAvailable: true });
              }
          });
      } else {
          res.status(404).send('Appointment not found');
      }
  });
});

//หมอแก้ไข
app.put('/api/appointment/:appointmentId', (req, res) => {
  const { appointmentId } = req.params;
  const { doctor_id, date, time } = req.body;

  const checkConflictQuery = `
    SELECT * FROM appointment 
    WHERE doctor_id = ? 
      AND date = ? 
      AND time = ? 
      AND appointment_id != ? 
      AND status = 'confirmed';
  `;

  db.query(checkConflictQuery, [doctor_id, date, time, appointmentId], (err, conflicts) => {
    if (err) {
      console.error('Error checking for conflicts:', err);
      return res.status(500).json({ message: 'Database error during conflict check', error: err });
    }

    if (conflicts.length > 0) {
      return res.status(409).json({ message: 'Conflict detected: Another appointment exists at the same date and time.' });
    } else {
      // Update only doctor_id, date, and time without modifying 'problem'
      const updateQuery = `
        UPDATE appointment
        SET doctor_id = ?, date = ?, time = ?
        WHERE appointment_id = ?;
      `;

      db.query(updateQuery, [doctor_id, date, time, appointmentId], (updateErr, updateResult) => {
        if (updateErr) {
          console.error('Error updating appointment:', updateErr);
          return res.status(500).json({ message: 'Database error during update', error: updateErr });
        }

        if (updateResult.affectedRows === 0) {
          return res.status(404).json({ message: 'No appointment found or no update needed' });
        }

        // Fetch the updated appointment's problem field to ensure it has not been modified
        const fetchProblemQuery = `SELECT problem FROM appointment WHERE appointment_id = ?`;
        db.query(fetchProblemQuery, [appointmentId], (fetchErr, fetchResult) => {
          if (fetchErr) {
            console.error('Error fetching problem field:', fetchErr);
            return res.status(500).json({ message: 'Error fetching problem field', error: fetchErr });
          }

          if (fetchResult.length === 0) {
            return res.status(404).json({ message: 'No appointment found after update' });
          }

          const problem = fetchResult[0].problem;
          res.status(200).json({ message: 'Appointment updated successfully', problem });
        });
      });
    }
  });
});



//หมอยกเลิก
app.put('/api/appointment/:appointmentId/cancel', (req, res) => {
  const { appointmentId } = req.params;

  // เปลี่ยนสถานะของการนัดหมายเป็น 'canceled'
  const cancelQuery = `
      UPDATE appointment
      SET status = 'canceled'
      WHERE appointment_id = ?
  `;

  db.query(cancelQuery, [appointmentId], (err, result) => {
      if (err) {
          return res.status(500).json({ message: 'Database error', error: err });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Appointment not found or not updated' });
      }

      // ดึง user_id, date และ time จากตาราง appointment หลังจากยกเลิกเสร็จสิ้น
      const userQuery = `SELECT user_id, date, time FROM appointment WHERE appointment_id = ?`;

      db.query(userQuery, [appointmentId], (err, userResult) => {
          if (err || userResult.length === 0) {
              return res.status(500).json({ message: 'Error retrieving user_id' });
          }

          const { user_id, date, time } = userResult[0];
          console.log('Retrieved user_id:', user_id); // ตรวจสอบการดึง user_id
          
          // ส่งข้อมูลกลับไปยัง frontend
          res.status(200).json({ message: 'Appointment canceled successfully', user_id, date, time });
      });
  });
});


//ของแชทหมด
//เรียกดู
// เรียกดูข้อความแชท
app.get('/api/chat/:userId/:doctorId', (req, res) => {
  const { userId, doctorId } = req.params;

  const chatQuery = `
    SELECT message, sender_role, sent_at, is_read
    FROM chat
    WHERE user_id = ? AND doctor_id = ?
    ORDER BY sent_at ASC
  `;

  db.query(chatQuery, [userId, doctorId], (err, results) => {
    if (err) {
      console.error('Error fetching chat messages:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }
    // ลบเงื่อนไขที่ตรวจสอบ results.length === 0
    // ส่งกลับผลลัพธ์เสมอ ไม่ว่าจะเป็นอาร์เรย์ว่างหรือไม่
    res.status(200).json(results);
  });
});

// ส่งข้อความแชทใหม่
app.post('/api/chat', (req, res) => {
  const { user_id, doctor_id, message, sender_role } = req.body;

  if (!user_id || !doctor_id || !message || !sender_role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const insertMessageQuery = `
    INSERT INTO chat (user_id, doctor_id, message, sender_role, sent_at, is_read)
    VALUES (?, ?, ?, ?, NOW(), 0)  -- Set is_read to 0 by default for new messages
  `;

  db.query(insertMessageQuery, [user_id, doctor_id, message, sender_role], (err, result) => {
    if (err) {
      console.error('Error sending message:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.status(201).json({ message: 'Message sent successfully' });
  });
});

// ทำเครื่องหมายข้อความว่าอ่านแล้ว
app.put('/api/chat/mark-as-read/:userId/:doctorId', (req, res) => {
  const { userId, doctorId } = req.params;
  const { recipient_role } = req.body; // รับค่า recipient_role จาก body

  let markAsReadQuery = '';
  let params = [];

  if (recipient_role === 'user') {
    // เมื่อผู้ใช้เปิดแชท มาร์คข้อความที่ถูกส่งจากแพทย์
    markAsReadQuery = `
      UPDATE chat
      SET is_read = 1
      WHERE user_id = ? AND doctor_id = ? AND sender_role = 'doctor' AND is_read = 0
    `;
    params = [userId, doctorId];
  } else if (recipient_role === 'doctor') {
    // เมื่อแพทย์เปิดแชท มาร์คข้อความที่ถูกส่งจากผู้ใช้
    markAsReadQuery = `
      UPDATE chat
      SET is_read = 1
      WHERE user_id = ? AND doctor_id = ? AND sender_role = 'user' AND is_read = 0
    `;
    params = [userId, doctorId];
  } else {
    return res.status(400).json({ message: 'Invalid recipient_role' });
  }

  db.query(markAsReadQuery, params, (err, results) => {
    if (err) {
      console.error('Error marking messages as read:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.status(200).json({ message: 'Messages marked as read' });
  });
});



//********************* *//
const nodemailer = require('nodemailer');

app.post('/sendemail', (req, res) => {
    const { user_id, appointment_id } = req.body;  // รับ user_id และ appointment_id จาก request

    // Query เพื่อดึงข้อมูลนัดหมายจาก user_id และ appointment_id
    const query = `
      SELECT u.email, a.date, a.time, a.status 
      FROM user u
      JOIN appointment a ON u.user_id = a.user_id
      WHERE u.user_id = ? AND a.appointment_id = ?`;

    db.query(query, [user_id, appointment_id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Appointment not found for the user' });
        }

        const { email, date, time, status } = result[0];  // ดึง email, date, time, status จากผลลัพธ์ query

        // ฟอร์แมตวันที่ที่ต้องการ
        const formattedDate = formatDate(date);  // ฟอร์แมตวันที่โดยใช้ฟังก์ชัน

        // สร้าง nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'Youremail@gmail.com',
                pass: 'Yourpassword'  // ตรวจสอบให้แน่ใจว่าเป็น App-specific password
            }
        });

        // ตั้งค่า mailOptions สำหรับการส่งอีเมล
        const mailOptions = {
            from: 'Youremail@gmail.com',
            to: email,
            subject: 'Appointment Status Update',
            html: `<p>Your appointment at <b>${formattedDate}</b> <b>${time}</b> has been <b>${status}</b>.</p>` // เนื้อหาอีเมลพร้อมวันที่ที่ฟอร์แมตแล้ว
        };

        // ส่งอีเมล
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(400).json({ message: 'Error sending email', error });
            } else {
                console.log('Email sent:', info.response);
                return res.status(200).json({ message: 'Email sent successfully', info });
            }
        });
    });
});

// ฟังก์ชันสำหรับฟอร์แมตวันที่
const formatDate = (dateString) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options); 
};

//************************************************************************* */
//ของแอดมินหมด
//ดึงค่าเป้าหมาย
app.get('/api/targets', (req, res) => {
  db.query('SELECT * FROM target_values WHERE id = 1', (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]);
  });
});

//อัปเดตค่าเป้าหมาย
app.post('/api/targets', (req, res) => {
  const { target_user_count, target_booking_count } = req.body;
  db.query(
    'UPDATE target_values SET target_user_count = ?, target_booking_count = ? WHERE id = 1',
    [target_user_count, target_booking_count],
    (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    }
  );
});

app.get('/api/bookings/latest', (req, res) => { 
  // ดึงข้อมูลจำนวนการจองตามสถานะ
  db.query(`
    SELECT 
      COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending,
      COUNT(CASE WHEN status = 'confirmed' THEN 1 END) AS confirmed,
      COUNT(CASE WHEN status = 'canceled' THEN 1 END) AS canceled
    FROM appointment
  `, (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: err.message });
    }

    // ส่งข้อมูลจองตามสถานะกลับ
    const statusCounts = result[0];
    res.json({
      pending: statusCounts.pending || 0,
      confirmed: statusCounts.confirmed || 0,
      canceled: statusCounts.canceled || 0
    });
  });
});


app.get('/api/users/count', async (req, res) => {
  try {
    const result = await new Promise((resolve, reject) => {
      db.query('SELECT COUNT(user_id) AS count FROM user', (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });
    
    console.log('Query Result:', result); // ล็อกผลลัพธ์ที่ได้รับ
    
    if (result && result.length > 0) {
      res.json({ count: result[0].count });
    } else {
      res.status(404).json({ error: 'No data found' });
    }
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Database query error' });
  }
});

// GET all tests
app.get('/api/tests', (req, res) => {
  db.query('SELECT * FROM questions ORDER BY no', (error, results) => {
    if (error) {
      console.error('Error fetching tests:', error);
      res.status(500).json({ error: 'Error fetching tests' });
      return;
    }
    res.json(results);
  });
});

// POST a new test
app.post('/api/tests', (req, res) => {
  const { no, question_text } = req.body;
  
  // ตรวจสอบว่าหมายเลขคำถามซ้ำหรือไม่
  const checkQuery = 'SELECT * FROM questions WHERE no = ?';
  db.query(checkQuery, [no], (checkError, checkResults) => {
    if (checkError) {
      console.error('Error checking for duplicate no:', checkError);
      res.status(500).json({ error: 'Error checking for duplicate no' });
      return;
    }
    if (checkResults.length > 0) {
      res.status(400).json({ error: 'หมายเลขคำถามนี้มีอยู่แล้วในระบบ' });
      return;
    }

    const query = 'INSERT INTO questions (no, question_text) VALUES (?, ?)';
    db.query(query, [no, question_text], (error, results) => {
      if (error) {
        console.error('Error adding test:', error);
        res.status(500).json({ error: 'Error adding test' });
        return;
      }
      res.json({ question_id: results.insertId, no, question_text });
    });
  });
});


// PUT to update a test
app.put('/api/tests/:id', (req, res) => {
  const { id } = req.params;
  const { no, question_text } = req.body;

  // ตรวจสอบว่าหมายเลขคำถามซ้ำหรือไม่ (ยกเว้นคำถามที่กำลังแก้ไข)
  const checkQuery = 'SELECT * FROM questions WHERE no = ? AND question_id != ?';
  db.query(checkQuery, [no, id], (checkError, checkResults) => {
    if (checkError) {
      console.error('Error checking for duplicate no:', checkError);
      res.status(500).json({ error: 'Error checking for duplicate no' });
      return;
    }
    if (checkResults.length > 0) {
      res.status(400).json({ error: 'หมายเลขคำถามนี้มีอยู่แล้วในระบบ' });
      return;
    }

    const query = 'UPDATE questions SET no = ?, question_text = ? WHERE question_id = ?';
    db.query(query, [no, question_text, id], (error, results) => {
      if (error) {
        console.error('Error updating test:', error);
        res.status(500).json({ error: 'Error updating test' });
        return;
      }
      res.json({ question_id: id, no, question_text });
    });
  });
});


// DELETE a test
app.delete('/api/tests/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM questions WHERE question_id = ?';
  db.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error deleting test:', error);
      res.status(500).json({ error: 'Error deleting test' });
      return;
    }
    res.json({ id });
  });
});

// API สำหรับดึงผู้ใช้
app.get('/api/users', (req, res) => {
  const search = req.query.search;
  
  let query = `SELECT user.user_id, user.username, user.name, user.phone, user.email, user.IDcard, user.address, user.gender, user.specialty, login.role 
               FROM user 
               JOIN login ON user.user_id = login.user_id`;
  let queryParams = [];

  if (search) {
      query += ` WHERE user.username LIKE ? 
                 OR user.name LIKE ? 
                 OR user.phone LIKE ? 
                 OR user.IDcard LIKE ? 
                 OR user.email LIKE ?`;
      const searchParam = `%${search}%`;
      queryParams = [searchParam, searchParam, searchParam, searchParam, searchParam];
  }

  db.query(query, queryParams, (err, result) => {
      if (err) {
          console.error('Error fetching users:', err);
          res.status(500).send('Error fetching users');
      } else {
          res.json(result);
      }
  });
});


// API สำหรับเพิ่มผู้ใช้ใหม่
app.post('/admin/add-user', (req, res) => {
  const { username, password, name, email, phone, IDcard, gender, address, specialty, role } = req.body;

  // ตรวจสอบว่า Phone เป็นตัวเลข 10 หลัก
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: 'Phone ต้องเป็นตัวเลข 10 หลัก' });
  }

  // ตรวจสอบว่า ID Card เป็นตัวเลข 13 หลัก
  if (!/^\d{13}$/.test(IDcard)) {
    return res.status(400).json({ message: 'ID Card ต้องเป็นตัวเลข 13 หลัก' });
  }

  // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบหรือไม่
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Username, password, and role are required' });
  }

  // ตรวจสอบว่ามีข้อมูลซ้ำหรือไม่
  const checkQuery = `SELECT * FROM user WHERE username = ? OR name = ? OR email = ? OR IDcard = ?`;
  db.query(checkQuery, [username, name, email, IDcard], (err, results) => {
    if (err) {
      console.error('Error checking for duplicates:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length > 0) {
      // มีข้อมูลซ้ำ
      const duplicates = [];
      results.forEach(user => {
        if (user.username === username && !duplicates.includes('Username')) {
          duplicates.push('Username');
        }
        if (user.name === name && !duplicates.includes('Name')) {
          duplicates.push('Name');
        }
        if (user.email === email && !duplicates.includes('Email')) {
          duplicates.push('Email');
        }
        if (user.IDcard === IDcard && !duplicates.includes('ID Card')) {
          duplicates.push('ID Card');
        }
      });
      return res.status(400).json({ message: `${duplicates.join(', ')} ซ้ำ` });
    }

    // ถ้าไม่มีข้อมูลซ้ำ ให้ดำเนินการเพิ่มผู้ใช้
    const userQuery = `INSERT INTO user (username, password, name, email, phone, IDcard, gender, address, specialty) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(userQuery, [username, password, name, email, phone, IDcard, gender, address, specialty], (err, userResult) => {
      if (err) {
        console.error('Error inserting into user table:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      // ดึง user_id ที่เพิ่งถูกเพิ่มมาใช้
      const userId = userResult.insertId;
      
      // เพิ่มข้อมูลลงในตาราง 'login' พร้อม role
      const loginQuery = 'INSERT INTO login (user_id, role) VALUES (?, ?)';
      db.query(loginQuery, [userId, role], (err, loginResult) => {
        if (err) {
          console.error('Error inserting into login table:', err);
          return res.status(500).json({ message: 'Database error' });
        }

        res.status(201).json({ message: 'เพิ่มผู้ใช้สำเร็จ' });
      });
    });
  });
});

// API สำหรับแก้ไขผู้ใช้
app.put('/admin/edit-user/:user_id', (req, res) => {
  const { user_id } = req.params;
  const { username, password, name, email, phone, IDcard, gender, address, specialty, role } = req.body;

  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: 'Phone ต้องเป็นตัวเลข 10 หลัก' });
  }
  // ตรวจสอบว่า ID Card เป็นตัวเลข 13 หลัก
  if (!/^\d{13}$/.test(IDcard)) {
    return res.status(400).json({ message: 'ID Card ต้องเป็นตัวเลข 13 หลัก' });
  }

  // ตรวจสอบว่ามีข้อมูลซ้ำหรือไม่ (ยกเว้นตัวเอง)
  const checkQuery = `SELECT * FROM user WHERE (username = ? OR name = ? OR email = ? OR IDcard = ?) AND user_id != ?`;
  db.query(checkQuery, [username, name, email, IDcard, user_id], (err, results) => {
    if (err) {
      console.error('Error checking for duplicates:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length > 0) {
      // มีข้อมูลซ้ำ
      const duplicates = [];
      results.forEach(user => {
        if (user.username === username && !duplicates.includes('Username')) {
          duplicates.push('Username');
        }
        if (user.name === name && !duplicates.includes('Name')) {
          duplicates.push('Name');
        }
        if (user.email === email && !duplicates.includes('Email')) {
          duplicates.push('Email');
        }
        if (user.IDcard === IDcard && !duplicates.includes('ID Card')) {
          duplicates.push('ID Card');
        }
      });
      return res.status(400).json({ message: `${duplicates.join(', ')} ซ้ำ` });
    }

    // ถ้าไม่มีข้อมูลซ้ำ ให้ดำเนินการแก้ไขผู้ใช้
    let updateUserQuery = `UPDATE user SET username = ?, name = ?, email = ?, phone = ?, IDcard = ?, gender = ?, address = ?, specialty = ? WHERE user_id = ?`;
    let queryParams = [username, name, email, phone, IDcard, gender, address, specialty, user_id];

    // ถ้ามีการเปลี่ยนแปลงรหัสผ่าน
    if (password) {
      updateUserQuery = `UPDATE user SET username = ?, password = ?, name = ?, email = ?, phone = ?, IDcard = ?, gender = ?, address = ?, specialty = ? WHERE user_id = ?`;
      queryParams = [username, password, name, email, phone, IDcard, gender, address, specialty, user_id];
    }

    // ดำเนินการอัปเดตข้อมูลผู้ใช้
    db.query(updateUserQuery, queryParams, (err, result) => {
      if (err) {
        console.error('Error updating the user table:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      // อัปเดตข้อมูล role ในตาราง login
      const updateLoginQuery = `UPDATE login SET role = ? WHERE user_id = ?`;
      db.query(updateLoginQuery, [role, user_id], (err, result) => {
        if (err) {
          console.error('Error updating the login table:', err);
          return res.status(500).json({ message: 'Database error' });
        }

        res.status(200).json({ message: 'แก้ไขผู้ใช้สำเร็จ' });
      });
    });
  });
});


// API to delete a user
app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;

  // First delete from the `login` table to avoid foreign key constraints
  const deleteLoginQuery = `DELETE FROM login WHERE user_id = ?`;
  db.query(deleteLoginQuery, [userId], (err) => {
      if (err) {
          console.error('Error deleting login information:', err);
          res.status(500).send('Error deleting login information');
      } else {
          // Then delete from the `user` table
          const deleteUserQuery = `DELETE FROM user WHERE user_id = ?`;
          db.query(deleteUserQuery, [userId], (err) => {
              if (err) {
                  console.error('Error deleting user:', err);
                  res.status(500).send('Error deleting user');
              } else {
                  res.status(200).send('User deleted successfully');
              }
          });
      }
  });
});


// เริ่มเซิร์ฟเวอร์
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
