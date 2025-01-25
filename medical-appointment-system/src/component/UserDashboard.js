import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/App.css';
import Headeruser from './Headeruser'; // นำเข้า Headeruser

function UserDashboard() {
  const navigate = useNavigate();

  const handleReadMore = () => {
    navigate('/depression-info');
  };

  return (
    <div>
      <Headeruser /> {/* เรียกใช้ Headeruser */}
      <div className="user-dashboard">
        <div className="left-section">
          <img
            className="content-image"
            src="/images/c5.jpg"
            alt="Depression"
          />
          <div className="text-content">
            <h2>โรคซึมเศร้า (Depression)</h2>
            <h2>ภาวะซึมเศร้าไม่ใช่ความรู้สึกไม่สบายกายหรือไม่สบายใจที่สามารถสลัดออกไปได้ง่าย ๆ ผู้ป่วยที่มีภาวะซึมเศร้าควรได้รับการรักษาอย่างต่อเนื่อง</h2>
            <p>โรคซึมเศร้า คืออะไร?</p>
            <p>

              โรคซึมเศร้า เป็นอาการผิดปกติของอารมณ์ ซึ่งส่งผลกระทบต่อผู้ป่วยทั้งด้านความคิด ความรู้สึก และพฤติกรรม โรคซึมเศร้าเป็นภาวะอารมณ์เศร้าหมองที่เกิดขึ้นอย่างต่อเนื่อง ความรู้สึกเฉยชา ไม่สนใจสิ่งต่าง ๆ ส่งผลต่อความสามารถในการทำงานในแต่ละวัน ซึ่งก่อให้เกิดอาการทางจิตได้มากมาย การดำเนินชีวิตตามปกติอาจทำได้อย่างยากลำบากหรือรู้สึกว่าชีวิตไม่มีค่า
            </p>
            <button className="read-more-btn" onClick={handleReadMore}>อ่านเพิ่มเติม</button>
          </div>
        </div>
        <div className="right-section">
          <div className="recent-post">
            <h4>How to ดูแลตัวเองป้องกันโรคซึมเศร้า</h4>

            <div className="post-item">
              <img
                className="post-image"
                src="/images/c2.jpg"
                alt="Post 1"
              />
              <div className="post-text">
                <p>1.สังเกตหมั่นสำรวจอารมณ์ของตนเองเพื่อเป็นการสังเกตว่าสิ่งใดช่วยทำให้อารมณ์เศร้าหมองหรือสดชื่นแจ่มใสและพยายามรักษาจิตใจให้สดชื่นแจ่มใสอยู่เสมอ</p>
              </div>
            </div>

            <div className="post-item">
              <img
                className="post-image"
                src="/images/c3.jpg"
                alt="Post 2"
              />
              <div className="post-text">
                <p>2.ไม่กระตุ้นไม่นำตนเองไปอยู่ในสถานการณ์ที่กระตุ้นให้เกิดความซึมเศร้ารวมถึงการใช้สารเสพติด</p>
              </div>
            </div>

            <div className="post-item">
              <img
                className="post-image"
                src="/images/c4.jpg"
                alt="Post 3"
              />
              <div className="post-text">
                <p>3.ทำกิจกรรม เลือกกิจกรรมส่งเสริมสุขภาพจิต เช่น การออกกำลังกาย กิจกรรมสันทนาการ พบปะเพื่อนฝูง เข้าสังคม</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default UserDashboard;
