import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '로그인 실패');

      localStorage.setItem('user', JSON.stringify(data));
      
      alert(`반가워요, ${data.name}님!`);
      navigate('/');
      window.location.reload();
    })
    .catch((err) => {
      alert(err.message);
    });
  };

  return (
    <div style={pageStyle}>
      <div style={formContainerStyle}>
        <h2 style={{ color: "white", textAlign: "center", marginBottom: "30px" }}>🔑 로그인</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>이메일</label>
            <input name="email" type="email" onChange={handleChange} style={inputStyle} required />
          </div>
          <div style={{ marginBottom: "25px" }}>
            <label style={labelStyle}>비밀번호</label>
            <input name="password" type="password" onChange={handleChange} style={inputStyle} required />
          </div>
          <button type="submit" style={submitBtnStyle}>
            로그인
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
  minHeight: "calc(100vh - 100px)", // 헤더 높이 제외
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
  boxSizing: "border-box" // padding이 width를 넘지 않게
};

const submitBtnStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#1f7bb9ff", // 로그인 버튼 파란색
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
  transition: "opacity 0.2s"
};