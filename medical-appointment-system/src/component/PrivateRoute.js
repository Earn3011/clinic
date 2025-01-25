import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ element: Element, allowedRoles }) {
  const role = localStorage.getItem('role');
  console.log('User Role:', role); // ตรวจสอบค่า role

  if (allowedRoles.includes(role)) {
    return Element;
  } else {
    return <Navigate to="/" />;
  }
}

export default PrivateRoute;

