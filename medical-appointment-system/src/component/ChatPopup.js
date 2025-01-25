import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import styles from '../css/chatPopup.module.css';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';

function ChatPopup({ userId, doctorId, recipientName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const userRole = localStorage.getItem('role'); // รับบทบาทของผู้ใช้ ('doctor' หรือ 'user')
  const messagesEndRef = useRef(null); // ใช้สำหรับการเลื่อนอัตโนมัติ
  const messagesWindowRef = useRef(null); // ใช้สำหรับการตรวจสอบการเลื่อน
  const [isAtBottom, setIsAtBottom] = useState(true); // สถานะว่าผู้ใช้อยู่ที่ด้านล่างของหน้าจอแชทหรือไม่

  // ฟังก์ชันเลื่อนลงไปยังข้อความล่าสุด
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ฟังก์ชันจัดการการเลื่อนของผู้ใช้
  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = messagesWindowRef.current;
    const isBottom = scrollTop + clientHeight >= scrollHeight - 5; // ใช้ -5 เพื่อเผื่อความคลาดเคลื่อน
    setIsAtBottom(isBottom);
  };

  // ดึงข้อความแชท
  const fetchMessages = useCallback(() => {
    axios.get(`http://localhost:3001/api/chat/${userId}/${doctorId}`)
      .then(response => {
        setMessages(response.data);
        // ไม่ต้องเลื่อนลงที่นี่
      })
      .catch(error => {
        console.error('Error fetching messages:', error);
        // คุณสามารถจัดการกับข้อผิดพลาดเพิ่มเติมได้ที่นี่
      });
  }, [userId, doctorId]);

  // ดึงข้อความเมื่อคอมโพเนนต์ถูกโหลด
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ส่งข้อความใหม่
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      axios.post('http://localhost:3001/api/chat', {
        user_id: userId,
        doctor_id: doctorId,
        message: newMessage,
        sender_role: userRole,
      })
      .then(() => {
        setMessages([...messages, { message: newMessage, sender_role: userRole }]);
        setNewMessage(''); // ล้างช่องกรอกข้อความ
        scrollToBottom(); // เลื่อนลงหลังจากส่งข้อความ
      })
      .catch(error => {
        console.error('Error sending message:', error);
      });
    }
  };

  // อัปเดตข้อความใหม่ทุก ๆ 3 วินาที
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000); // ดึงข้อมูลทุก ๆ 3 วินาที
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // ทำเครื่องหมายข้อความว่าอ่านแล้วเมื่อเปิดแชท
  useEffect(() => {
    axios.put(`http://localhost:3001/api/chat/mark-as-read/${userId}/${doctorId}`, {
      recipient_role: userRole, // ส่ง recipient_role
    })
    .then(() => {
      console.log('Messages marked as read.');
    })
    .catch(error => console.error('Error marking messages as read:', error));
  }, [userId, doctorId, userRole]);

  // เลื่อนลงเมื่อเปิดแชทครั้งแรก
  useEffect(() => {
    scrollToBottom();
  }, []);

  // เลื่อนลงเมื่อมีข้อความใหม่และผู้ใช้อยู่ที่ด้านล่างของหน้าจอแชท
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

  return (
    <div className={styles.chatPopup}>
      <div className={styles.chatHeader}>
        <span>แชทกับ {recipientName}</span>
        <button onClick={onClose} className={styles.closeButton}>
          <FaTimes />
        </button>
      </div>
      <div
        className={styles.messagesWindow}
        onScroll={handleScroll}
        ref={messagesWindowRef}
      >
        {messages.length === 0 ? (
          <p className={styles.noMessages}>ยังไม่มีข้อความ</p>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={msg.sender_role === userRole ? styles.userMessage : styles.doctorMessage}
            >
              {msg.message}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className={styles.chatForm}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className={styles.chatInput}
          placeholder="พิมพ์ข้อความของคุณ..."
        />
        <button type="submit" className={styles.sendButton}>
          ส่งข้อความ <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}

export default ChatPopup;
