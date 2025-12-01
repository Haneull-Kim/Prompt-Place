import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PromptCreate() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // 1. 페이지 접근 시 로그인 상태 확인
  useEffect(() => {
    if (!user) {
      alert("로그인이 필요한 서비스입니다.");
      navigate('/login');
    }
  }, [user, navigate]);

  // 2. 'author'의 기본값을 로그인한 사용자 이름으로 설정
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    author: user ? user.name : '', // 로그인 사용자 이름으로 초기화
    tag: '기타',
    llm: 'ChatGPT',
    price: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('http://localhost:3001/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '등록 실패');

      alert('프롬프트가 성공적으로 등록되었습니다!');
      setFormData({
        title: '', description: '', content: '', 
        author: user ? user.name : '', // 초기화 시에도 이름 유지
        tag: '기타', price: 0
      });
      navigate('/'); // 등록 후 홈으로 이동
    })
    .catch((error) => {
      console.error('에러:', error);
      alert('등록 중 오류가 발생했습니다.');
    });
  };

  // 로그인하지 않은 사용자가 URL로 직접 접근했을 때 렌더링을 방지
  if (!user) {
    return null;
  }

  return (
    <div style={pageStyle}>
      <div style={formContainerStyle}>
        <h2 style={{ color: "white", textAlign: "center", marginBottom: "30px" }}>✨ 프롬프트 등록</h2>
        <form onSubmit={handleSubmit}>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>제목:</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="프롬프트 제목 (예: 이더리움 개발자 챗봇)" 
              style={inputStyle}
              required 
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>작성자:</label>
            <input 
              type="text" 
              name="author"
              value={formData.author}
              style={{...inputStyle, backgroundColor: "#444", color: "#aaa", cursor: "not-allowed"}}
              readOnly 
              disabled 
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>한줄 설명:</label>
            <input 
              type="text" 
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="리스트에서 보여질 짧은 설명" 
              style={inputStyle}
              required 
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>내용 (프롬프트):</label>
            <textarea 
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="실제 프롬프트 내용을 입력하세요" 
              style={textareaStyle}
              required 
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: "25px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>카테고리:</label>
              <select 
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="AI 글쓰기">AI 글쓰기</option>
                <option value="요약">요약</option>
                <option value="코드 생성">코드 생성</option> 
                <option value="기타">기타</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={labelStyle}>LLM 종류:</label>
              <select name="llm" value={formData.llm} onChange={handleChange} style={inputStyle}>
                <option value="ChatGPT">ChatGPT</option>
                <option value="Gemini">Gemini</option>
                <option value="Claude">Claude</option>
                <option value="Llama">Llama</option>
                <option value="Mistral">Mistral</option>
              </select>
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label style={labelStyle}>가격 (원):</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} style={inputStyle} min="0" />
            </div>
          </div>

          <button type="submit" style={submitBtnStyle}>
            등록하기
          </button>
        </form>
      </div>
    </div>
  );
}

// --- 스타일 객체 ---
const pageStyle = { display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 0", backgroundColor: "#191919" };
const formContainerStyle = { width: "600px", padding: "30px 40px", backgroundColor: "#252525", borderRadius: "12px", border: "1px solid #333", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" };
const labelStyle = { display: "block", marginBottom: "8px", color: "#aaa", fontSize: "14px" };
const inputStyle = { width: "100%", padding: "12px", backgroundColor: "#2a2a2a", border: "1px solid #444", borderRadius: "6px", color: "white", outline: "none", boxSizing: "border-box" };
const textareaStyle = { ...inputStyle, height: "140px", resize: "vertical" };
const submitBtnStyle = { width: "100%", padding: "12px", backgroundColor: "#10a37f", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "16px", fontWeight: "bold", transition: "opacity 0.2s" };