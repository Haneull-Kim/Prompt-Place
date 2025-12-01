import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import "./App.css";
import logo from './assets/logo.png';

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    alert("로그아웃 되었습니다.");
    navigate("/");
    window.location.reload();
  };

  // --- 스타일 객체 ---
  const navStyle = {
    backgroundColor: "#191919", // 배경색 통일
    padding: "1rem 2rem",
    borderBottom: "1px solid #333", // 경계선
    display: "flex",
    alignItems: "center",
    gap: "15px"
  };

  const linkStyle = {
    textDecoration: "none",
    color: "#aaa", // 기본 링크 색상
    transition: "color 0.2s"
  };

  return (
    <>
      <nav style={navStyle}>
        {/* 로고 이미지 추가 */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <img src={logo} alt="로고" style={{ height: "24px" }} />
        </Link>
        
        {/* 메뉴 링크 */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "15px" }}>
          {user ? (
            <>
              <span style={{ color: "#10a37f", fontWeight: "bold" }}>
                {user.name}님 환영합니다!
              </span>
              <Link to="/prompt/create" style={linkStyle} onMouseOver={(e) => e.target.style.color='white'} onMouseOut={(e) => e.target.style.color='#aaa'}>프롬프트 등록</Link>
              <Link to="/mypage" style={linkStyle} onMouseOver={(e) => e.target.style.color='white'} onMouseOut={(e) => e.target.style.color='#aaa'}>마이페이지</Link>
              <button 
                onClick={handleLogout}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#e74c3c", textDecoration: "underline", padding: 0 }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{...linkStyle, color: "white", fontWeight: "bold"}} onMouseOver={(e) => e.target.style.color='#10a37f'} onMouseOut={(e) => e.target.style.color='white'}>로그인</Link>
              <Link to="/signup" style={{...linkStyle, color: "white", fontWeight: "bold"}} onMouseOver={(e) => e.target.style.color='#10a37f'} onMouseOut={(e) => e.target.style.color='white'}>회원가입</Link>
            </>
          )}
        </div>
      </nav>
      
      <Outlet />
    </>
  );
}

export default App;