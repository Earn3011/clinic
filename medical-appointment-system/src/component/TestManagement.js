import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/TestManagement.css';
import HeaderAD from './HeaderAD';

function TestManagement() {
  const [tests, setTests] = useState([]);
  const [editingTest, setEditingTest] = useState(null);
  const [newTest, setNewTest] = useState({ no: '', question_text: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/tests');
        setTests(response.data);
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const handleAddTest = async () => {
    if (newTest.no === '' || newTest.question_text.trim() === '') {
      alert('กรุณากรอกหมายเลขคำถามที่มากกว่า 0 และคำถาม');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/tests', newTest);
      const updatedTests = [...tests, response.data].sort((a, b) => a.no - b.no);
      setTests(updatedTests);
      setNewTest({ no: '', question_text: '' });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert(error.response.data.error);
      } else {
        console.error('Error adding test:', error);
      }
    }
  };

  const handleEditTest = async () => {
    if (editingTest.no === '' || editingTest.question_text.trim() === '') {
      alert('กรุณากรอกหมายเลขคำถามที่มากกว่า 0 และคำถาม');
      return;
    }

    try {
      if (!editingTest || !editingTest.question_id) {
        console.error('Editing test has no question_id');
        return;
      }

      const response = await axios.put(`http://localhost:3001/api/tests/${editingTest.question_id}`, editingTest);
      const updatedTests = tests
        .map((test) => (test.question_id === editingTest.question_id ? response.data : test))
        .sort((a, b) => a.no - b.no);
      setTests(updatedTests);
      setEditingTest(null);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert(error.response.data.error);
      } else {
        console.error('Error editing test:', error);
      }
    }
  };

  const handleDeleteTest = async (id) => {
    if (window.confirm('คุณแน่ใจหรือว่าต้องการลบคำถามนี้?')) {
      try {
        await axios.delete(`http://localhost:3001/api/tests/${id}`);
        const updatedTests = tests.filter((test) => test.question_id !== id).sort((a, b) => a.no - b.no);
        setTests(updatedTests);
      } catch (error) {
        console.error('Error deleting test:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingTest(null);
  };

  return (
    <div>
      <HeaderAD />
      <div className="test-management">
        <h1>จัดการแบบทดสอบ</h1>

        <div className="form-container">
          <h2>เพิ่มแบบทดสอบใหม่</h2>
          <div>
            <input
              type="number"
              value={newTest.no}
              min="1"
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 1 || e.target.value === '') {
                  setNewTest({ ...newTest, no: e.target.value });
                }
              }}
              placeholder="หมายเลขคำถาม"
              className="input-field"
            />
          </div>

          <div>
            <input
              type="text"
              value={newTest.question_text}
              onChange={(e) => setNewTest({ ...newTest, question_text: e.target.value })}
              placeholder="คำถาม"
              className="input-field"
            />
          </div>
          <div className="button-container">
            <button className="add-question-button" onClick={handleAddTest}>
              เพิ่มคำถาม
            </button>
          </div>
        </div>

        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : tests.length === 0 ? (
          <p>ไม่มีแบบทดสอบในระบบ</p>
        ) : (
          <div className="test-list">
            {tests.map((test) => (
              <div key={test.question_id}>
                <div className="test-item">
                  <div className="question-text">
                    {test.no}. {test.question_text}
                  </div>
                  <div className="actions">
                    <button
                      className="edit"
                      onClick={() => {
                        setEditingTest({ ...test });
                      }}
                    >
                      แก้ไข
                    </button>
                    <button className="delete" onClick={() => handleDeleteTest(test.question_id)}>
                      ลบ
                    </button>
                  </div>
                </div>
                {editingTest && editingTest.question_id === test.question_id && (
                  <div className="form-container">
                    <h2>แก้ไขคำถาม</h2>
                    <input
                      type="number"
                      value={editingTest.no}
                      min="1"
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 1 || e.target.value === '') {
                          setEditingTest({ ...editingTest, no: e.target.value });
                        }
                      }}
                      className="input-field"
                    />
                    <input
                      type="text"
                      value={editingTest.question_text}
                      onChange={(e) => setEditingTest({ ...editingTest, question_text: e.target.value })}
                      className="input-field"
                    />
                    <div className="button-container">
                      <button className="add-question-button" onClick={handleEditTest}>
                        อัปเดตคำถาม
                      </button>
                      <button className="cancel-button" onClick={handleCancelEdit}>
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TestManagement;
