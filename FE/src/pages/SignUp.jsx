import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('http://localhost:3001/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '회원가입 실패');
      
      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      navigate('/login');
    })
    .catch((err) => {
      alert(err.message);
    });
  };

  return (
    <div style={pageStyle}>
      <div style={formContainerStyle}>
        <h2 style={{ color: "white", textAlign: "center", marginBottom: "30px" }}>📝 회원가입</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>이름</label>
            <input name="name" type="text" onChange={handleChange} style={inputStyle} required />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>이메일</label>
            <input name="email" type="email" onChange={handleChange} style={inputStyle} required />
          </div>
          <div style={{ marginBottom: "25px" }}>
            <label style={labelStyle}>비밀번호</label>
            <input name="password" type="password" onChange={handleChange} style={inputStyle} required />
          </div>
          <button type="submit" style={submitBtnStyle}>
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
}

// --- 스타일 객체 ---
const pageStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "calc(100vh - 100px)",
  backgroundColor: "#191919"
};

const formContainerStyle = {
  width: "400px",
  padding: "30px 40px",
  backgroundColor: "#252525",
  borderRadius: "12px",
  border: "1px solid #333",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  color: "#aaa",
  fontSize: "14px"
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#2a2a2a",
  border: "1px solid #444",
  borderRadius: "6px",
  color: "white",
  outline: "none",
  boxSizing: "border-box"
};

const submitBtnStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#10a37f", 
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
  transition: "opacity 0.2s"
};