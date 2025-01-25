import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Table, Form, FormControl } from 'react-bootstrap';
import HeaderAD from './HeaderAD';
import '../css/UserManagement.css';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentUser, setCurrentUser] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [role, setRole] = useState('user');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage, users]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/users');
            if (response && response.data) {
                setUsers(response.data);
            } else {
                throw new Error("No user data found");
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setErrorMessage('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
        }
    };

    const handleSearch = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/users?search=${searchQuery}`);
            setUsers(response.data);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error searching users:', error);
            setErrorMessage('เกิดข้อผิดพลาดในการค้นหาข้อมูล');
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        fetchUsers();
        setCurrentPage(1);
    };

    const handleAddUser = () => {
        setCurrentUser({});
        setRole('user');
        setErrorMessage('');
        setShowModal(true);
    };

    const handleEditUser = (user) => {
        setCurrentUser(user);
        setRole(user.role);
        setErrorMessage('');
        setShowModal(true);
    };

    const handleSaveUser = async () => {
        // ตรวจสอบว่า Phone เป็นตัวเลข 10 หลัก
        if (!/^\d{10}$/.test(currentUser.phone)) {
            setErrorMessage('Phone ต้องเป็นตัวเลข 10 หลัก');
            return;
        }
        // ตรวจสอบว่า ID Card เป็นตัวเลข 13 หลัก
        if (!/^\d{13}$/.test(currentUser.IDcard)) {
            setErrorMessage('ID Card ต้องเป็นตัวเลข 13 หลัก');
            return;
        }
        // ตรวจสอบว่า Username เป็นภาษาอังกฤษเท่านั้น
        if (!/^[a-zA-Z0-9]+$/.test(currentUser.username)) {
            setErrorMessage('Username ต้องประกอบด้วยตัวอักษรภาษาอังกฤษหรือตัวเลขเท่านั้น');
            return;
        }
        // ตรวจสอบว่ารหัสผ่านมีความยาวขั้นต่ำ 6 ตัวและไม่เกิน 22 ตัว และเป็นภาษาอังกฤษหรือตัวเลข
        if (currentUser.password && (!/^[a-zA-Z0-9]{6,22}$/.test(currentUser.password))) {
            setErrorMessage('Password ต้องมีความยาวระหว่าง 6 ถึง 22 ตัวอักษร และประกอบด้วยตัวอักษรภาษาอังกฤษหรือตัวเลขเท่านั้น');
            return;
        }

        try {
            const updatedUser = { ...currentUser, role };

            if (!updatedUser.password) {
                delete updatedUser.password;
            }

            if (currentUser.user_id) {
                await axios.put(`http://localhost:3001/admin/edit-user/${currentUser.user_id}`, updatedUser);
            } else {
                await axios.post('http://localhost:3001/admin/add-user', updatedUser);
            }
            setShowModal(false);
            setErrorMessage('');
            fetchUsers();
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                console.error('Error saving user:', error);
                setErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }
        }
    };


    const handleDeleteUser = async (userId) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?')) {
            try {
                await axios.delete(`http://localhost:3001/api/users/${userId}`);
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                setErrorMessage('เกิดข้อผิดพลาดในการลบผู้ใช้');
            }
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedUsers = React.useMemo(() => {
        let sortableUsers = [...users];
        if (sortConfig.key !== null) {
            sortableUsers.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableUsers;
    }, [users, sortConfig]);

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(users.length / usersPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <>
            <HeaderAD />
            <div className="user-management">
                <h1>การจัดการผู้ใช้</h1>
                <div className="filter-container">
                    <FormControl
                        placeholder="ค้นหาที่นี่"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button variant="none" className="search-button" onClick={handleSearch}>ค้นหา</Button>
                    <Button variant="none" className="clear-button" onClick={handleClearSearch}>ล้าง</Button>
                </div>
                <div className="d-flex justify-content-end mb-3">
                    <Button onClick={handleAddUser} className="btn btn-success">+ เพิ่มผู้ใช้</Button>
                </div>
                <Table className="user-table" striped bordered hover responsive>
                    <thead className="table-dark">
                        <tr>
                            <th onClick={() => handleSort('user_id')}>ID {sortConfig.key === 'user_id' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                            <th>Username</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th onClick={() => handleSort('phone')}>Phone {sortConfig.key === 'phone' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                            <th onClick={() => handleSort('IDcard')}>ID Card {sortConfig.key === 'IDcard' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                            <th>Gender</th>
                            <th>Address</th>
                            <th>Specialty</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.length > 0 ? (
                            currentUsers.map(user => (
                                <tr key={user.user_id}>
                                    <td>{user.user_id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone}</td>
                                    <td>{user.IDcard}</td>
                                    <td>{user.gender}</td>
                                    <td>{user.address}</td>
                                    <td>{user.specialty}</td>
                                    <td>{user.role}</td>
                                    <td className="table-actions">
                                        <Button variant="none" className="edit-button" onClick={() => handleEditUser(user)}style={{ marginRight: '10px' }}>แก้ไข</Button>
                                        <Button variant="none" className="delete-button" onClick={() => handleDeleteUser(user.user_id)} >ลบ</Button>
                                    </td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="11" className="text-center">ไม่พบข้อมูล</td>
                            </tr>
                        )}
                    </tbody>
                </Table>

                {users.length > usersPerPage && (
                    <div className="pagination">
                        <Button
                            variant="none"
                            className="page-button"
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            ก่อนหน้า
                        </Button>
                        {[...Array(totalPages)].map((_, index) => (
                            <Button
                                key={index}
                                variant="none"
                                className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                                onClick={() => paginate(index + 1)}
                            >
                                {index + 1}
                            </Button>
                        ))}
                        <Button
                            variant="none"
                            className="page-button"
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            ถัดไป
                        </Button>
                    </div>
                )}

                <Modal show={showModal} onHide={() => { setShowModal(false); setErrorMessage(''); }}>
                    <Modal.Header closeButton>
                        <Modal.Title>{currentUser.user_id ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form className="user-form">
                            {/* Form fields for adding/editing a user */}
                            <Form.Group controlId="username">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={currentUser.username || ''}
                                    onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="password" className="mt-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={currentUser.password || ''}
                                    onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="name" className="mt-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={currentUser.name || ''}
                                    onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="email" className="mt-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={currentUser.email || ''}
                                    onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="phone" className="mt-3">
                                <Form.Label>Phone</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={currentUser.phone || ''}
                                    onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                                />
                                {errorMessage.includes('Phone') && <Form.Text className="text-danger">{errorMessage}</Form.Text>}
                            </Form.Group>
                            <Form.Group controlId="IDcard" className="mt-3">
                                <Form.Label>ID Card</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={currentUser.IDcard || ''}
                                    onChange={(e) => setCurrentUser({ ...currentUser, IDcard: e.target.value })}
                                />
                                {errorMessage.includes('ID Card') && <Form.Text className="text-danger">{errorMessage}</Form.Text>}
                            </Form.Group>
                            <Form.Group controlId="gender" className="mt-3">
                                <Form.Label>Gender</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={currentUser.gender || ''}
                                    onChange={(e) => setCurrentUser({ ...currentUser, gender: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="address" className="mt-3">
                                <Form.Label>Address</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={currentUser.address || ''}
                                    onChange={(e) => setCurrentUser({ ...currentUser, address: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="specialty" className="mt-3">
                                <Form.Label>Specialty</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={currentUser.specialty || ''}
                                    onChange={(e) => setCurrentUser({ ...currentUser, specialty: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="role" className="mt-3">
                                <Form.Label>Role</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="role-select"
                                >
                                    <option value="user">User</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="admin">Admin</option>
                                </Form.Control>
                            </Form.Group>
                        </Form>
                        {errorMessage && <div className="error-message">{errorMessage}</div>}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="none" className="save-button" onClick={handleSaveUser}>บันทึก</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </>
    );
}

export default UserManagement;
