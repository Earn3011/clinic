import React, { useState } from 'react';
import Headeruser from './Headeruser';
import '../css/About.css';

function About() {
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    setCurrentPage((prevPage) => (prevPage + 1) % 2); // Loop back to 0 after page 1
  };

  const handlePrev = () => {
    setCurrentPage((prevPage) => (prevPage - 1 + 2) % 2); // Loop back to 1 after page 0
  };

  return (
    <div className="App">
      <Headeruser />
      <div className="content-container">
        {currentPage === 0 ? (
          <div className="contact-section">
            <h2>ติดต่อเราได้ที่</h2>
            <div className="contact-info">
              <div className="contact-icons">
                <p><i className="fab fa-facebook-messenger"></i> MoodMend</p>
                <p><i className="fab fa-line"></i> MoodMend11</p>
                <p><i className="fas fa-phone"></i> 0224522451</p>
                <p><i className="fas fa-envelope"></i> MoodMend@gmail.com</p>
              </div>
              <div className="profile-info">
                <img src="/images/d1.jpeg" alt="Contact Person" />
                <p>นพ.ธนพล กาญจน์ภิญญา</p>
                <p>ตำแหน่ง: หัวหน้าแผนกโรคซึมเศร้า</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="quote-section">
            <h2><i className="fas fa-quote-left"></i></h2>
            <p>
              เขาเชื่อว่าการฟังและเข้าใจผู้ป่วยเป็นสิ่งสำคัญในการรักษาโรคซึมเศร้า<br />
              และพยายามสร้างสภาพแวดล้อมที่ปลอดภัยและให้ความรู้สึกถึงการสนับสนุน<br />
              เพื่อให้ผู้ป่วยสามารถเผชิญกับความท้าทายได้อย่างมั่นใจ
            </p>
            <div className="profile-info">
              <img src="/images/d1.jpeg" alt="Contact Person" />
              <p>นพ.ธนพล กาญจน์ภิญญา</p>
              <p>ตำแหน่ง: หัวหน้าแผนกโรคซึมเศร้า</p>
            </div>
          </div>
        )}
        <div className="arrow-controls">
          <i className="fas fa-arrow-left" onClick={handlePrev}></i>
          <i className="fas fa-arrow-right" onClick={handleNext}></i>
        </div>
      </div>
    </div>
  );
}

export default About;
