import React from 'react';
import { useNavigate } from 'react-router-dom';
import Headeruser from './Headeruser'; // นำเข้า Headeruser
import '../css/AssessmentUI.css'; // นำเข้าไฟล์ CSS

function AssessmentUI() {
    const navigate = useNavigate(); // ใช้ useNavigate เพื่อจัดการการนำทาง

    const handleStart = () => {
        navigate('/assessment'); // เมื่อกดปุ่มให้ไปที่ /assessment
    };

    return (
        <div><Headeruser />
            <div className="assessment-container">
                <div className="content-section">
                    <div className="text-section">
                        <h1>แบบทดสอบโรคซึมเศร้า</h1>
                        <p>
                            วันนี้เรามีแบบทดสอบที่ออกแบบมาเพื่อช่วยให้เราสามารถเข้าใจความรู้สึกและอาการของคุณได้ดีขึ้น
                            แบบทดสอบนี้จะช่วยให้เราเห็นภาพรวมของสิ่งที่คุณกำลังประสบอยู่
                            และสามารถออกแบบแผนการดูแลหรือการรักษาที่เหมาะสมกับคุณได้อย่างมีประสิทธิภาพมากขึ้น
                        </p>
                        <button className="start-btn" onClick={handleStart}>
                            คลิ๊กที่นี่ <span className="arrow">→</span>
                        </button>
                    </div>
                    <div className="image-section">
                        <img src="/images/c6.jpg" alt="Laptop" className="assessment-image" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AssessmentUI;
