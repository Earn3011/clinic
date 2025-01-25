import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import Headeruser from './Headeruser'; // นำเข้า Headeruser
import styles from '../css/Assessment.module.css';

function Assessment() {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [resultMessage, setResultMessage] = useState(''); // สถานะสำหรับเก็บข้อความแสดงผลลัพธ์
  const [history, setHistory] = useState([]); // สถานะสำหรับเก็บประวัติคะแนน
  const [page, setPage] = useState(1); // สถานะสำหรับหน้าปัจจุบัน
  const itemsPerPage = 10; // จำนวนรายการต่อหน้า

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/questions`);
        setQuestions(response.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    const fetchAssessmentHistory = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const response = await axios.get(`http://localhost:3001/api/assessments/${userId}`);
        const historyData = response.data.map(entry => ({
          ...entry,
          result: getResultText(entry.score), // คำนวณผลลัพธ์จากคะแนนที่ได้
          request: entry.request // เพิ่มการรับค่า request
        }));
        setHistory(historyData);
      } catch (error) {
        console.error('Error fetching assessment history:', error);
      }
    };

    fetchQuestions();
    fetchAssessmentHistory();
  }, []);

  const handleChange = (index, value) => {
    setResponses(prev => ({
      ...prev,
      [index]: parseInt(value, 10)
    }));
  };

  const getResultText = (score) => {
    if (score >= 0 && score <= 4) {
      return 'ไม่มีอาการซึมเศร้า';
    } else if (score >= 5 && score <= 8) {
      return 'อาการซึมเศร้าระดับเล็กน้อย';
    } else if (score >= 9 && score <= 14) {
      return 'อาการซึมเศร้าระดับปานกลาง';
    } else if (score >= 15 && score <= 19) {
      return 'อาการซึมเศร้าระดับรุนแรงค่อนข้างมาก';
    } else if (score >= 20 && score <= 27) {
      return 'อาการซึมเศร้าระดับรุนแรงมาก';
    }
  };

  const calculateScore = () => {
    const score = Object.values(responses).reduce((acc, curr) => acc + curr, 0);
    setTotalScore(score);
    return score;
  };

  const getResultMessage = (score) => {
    if (score >= 0 && score <= 4) {
      return (
        `<p>ระดับคะแนนของคุณอยู่ในช่วง 0 - 4</p>` +
        `<p>ระดับคะแนน: ${score}</p>` +
        `<p>ผลการทดสอบ: ท่านไม่มีอาการซึมเศร้าหรือมีก็เพียงเล็กน้อย</p>`
      );
    } else if (score >= 5 && score <= 8) {
      return (
        `<p>ระดับคะแนนของคุณอยู่ในช่วง 5 - 8</p>` +
        `<p>ระดับคะแนน: ${score}</p>` +
        `<p>ผลการทดสอบ: ท่านมีอาการซึมเศร้าระดับเล็กน้อย</p>`
      );
    } else if (score >= 9 && score <= 14) {
      return (
        `<p>ระดับคะแนนของคุณอยู่ในช่วง 9 - 14</p>` +
        `<p>ระดับคะแนน: ${score}</p>` +
        `<p>ผลการทดสอบ: ท่านมีอาการซึมเศร้าระดับปานกลาง</p>`
      );
    } else if (score >= 15 && score <= 19) {
      return (
        `<p>ระดับคะแนนของคุณอยู่ในช่วง 15 - 19</p>` +
        `<p>ระดับคะแนน: ${score}</p>` +
        `<p>ผลการทดสอบ: ท่านมีอาการซึมเศร้าระดับรุนแรงค่อนข้างมาก</p>`
      );
    } else if (score >= 20 && score <= 27) {
      return (
        `<p>ระดับคะแนนของคุณอยู่ในช่วง 20 - 27</p>` +
        `<p>ระดับคะแนน: ${score}</p>` +
        `<p>ผลการทดสอบ: ท่านมีอาการซึมเศร้าระดับรุนแรงมาก</p>`
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const score = calculateScore();
    const result = getResultText(score); // คำนวณผลลัพธ์
    const userId = localStorage.getItem('userId');

    if (!userId || score === null || score === undefined) {
      alert('Missing required fields');
      return;
    }

    // แสดงการแจ้งเตือนให้เลือก Yes หรือ No
    const request = window.confirm('อนุญาตให้เปิดเผยต่อหมอหรือไม่?') ? 'yes' : 'no';

    try {
      await axios.post('http://localhost:3001/assessment', {
        user_id: userId,
        score: score,
        request: request
      });

      // ตั้งค่าข้อความผลลัพธ์หลังจากบันทึกข้อมูลสำเร็จ
      setResultMessage(getResultMessage(score));

      // อัปเดตประวัติคะแนน โดยเพิ่มข้อมูลใหม่ที่จุดเริ่มต้นของ array
      setHistory(prev => [{ created_at: new Date().toISOString(), score, result, request }, ...prev]);

      alert('Assessment submitted successfully');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment');
    }
  };

  // คำนวณรายการที่จะแสดงต่อหน้า
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedHistory = history.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="wrapper">
      <Headeruser />
      <div className={styles.assessmentContainer}>
        <header className={styles.header}>
          <h1>แบบประเมิน</h1>
          <h2>โปรดใส่คะแนนให้ตรงกับคำตอบของท่านใน 2 สัปดาห์ที่ผ่านมา</h2>
          <h3>(เกณฑ์ให้คะแนน : ไม่เลย = 0, มีบางวันหรือไม่บ่อย = 1, มีค่อนข้างบ่อย = 2, มีเกือบทุกวัน = 3)</h3>
        </header>
        <main>
          <form onSubmit={handleSubmit} className={styles.assessmentForm}>
            {questions.map((question, index) => (
              <div key={index} className={styles.questionWrapper}>
                <label className={styles.questionText}>{question.no}. {question.question_text}</label>
                <div className={styles.sliderWrapper}>
                  <input
                    className={styles.slider}
                    type="range"
                    min="0"
                    max="3"
                    step="1"
                    value={responses[index] || 0}
                    onChange={(e) => handleChange(index, e.target.value)}
                  />
                </div>
                <div className={styles.rangeLabels}>
                  <span>0</span><span>1</span><span>2</span><span>3</span>
                </div>
              </div>
            ))}
            <div className={styles.scoreBox}>
              <button type="submit" className={styles.submitButton}>ส่ง</button>
              <h3>คะแนนรวม: {totalScore}</h3>
              {resultMessage && (
                <div
                  className={styles.resultMessage}
                  dangerouslySetInnerHTML={{ __html: resultMessage }}
                />
              )}
            </div>
            {/* แสดงประวัติการประเมินอยู่ในฟอร์ม */}
            <div className={styles.historyContainer}>
              {paginatedHistory.length > 0 ? (
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th>วันที่ทำแบบประเมิน</th><th>คะแนน</th><th>ผลลัพธ์</th><th>คำอนุญาต</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHistory.map((entry, index) => (
                      <tr key={index}>
                        <td>{new Date(entry.created_at).toLocaleDateString('th-TH')}</td>
                        <td>{entry.score}</td>
                        <td>{entry.result}</td>
                        <td>{entry.request}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={styles.historyMessage}>กรุณาทำแบบประเมินก่อน</p>
              )}
            </div>
            {/* ปุ่มเปลี่ยนหน้า */}
            <div className={styles.pagination}>
              <button
                onClick={(e) => {
                  e.preventDefault(); // ป้องกันไม่ให้ฟอร์มถูกส่ง
                  setPage(page - 1);
                }}
                disabled={page === 1}
              >
                Back
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault(); // ป้องกันไม่ให้ฟอร์มถูกส่ง
                  setPage(page + 1);
                }}
                disabled={startIndex + itemsPerPage >= history.length}
              >
                Next
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default Assessment;
