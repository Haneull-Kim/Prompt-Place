import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LLM_LIST = ['All Prompts', 'ChatGPT', 'Gemini', 'Claude', 'Llama', 'Mistral'];

export default function PromptList() {
  const [prompts, setPrompts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // 1. 검색어 상태
  const [selectedLlm, setSelectedLlm] = useState("All Prompts"); // 2. 선택된 LLM 상태
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // 3. 검색어 또는 LLM이 바뀔 때마다 API 다시 호출
  useEffect(() => {
    // URL에 쿼리 파라미터 추가
    const query = new URLSearchParams({
      search: searchTerm,
      llm: selectedLlm
    }).toString();

    fetch(`http://localhost:3001/api/prompts?${query}`)
      .then((res) => res.json())
      .then((data) => setPrompts(data))
      .catch((err) => console.error("데이터 로드 실패:", err));
  }, [searchTerm, selectedLlm]); // 의존성 배열에 추가

  const handleAddPromptClick = () => {
    if (user) navigate('/prompt/create');
    else {
      alert("로그인이 필요한 서비스입니다.");
      navigate('/login');
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 70px)", backgroundColor: "#191919", color: "white" }}>
      
      {/* 왼쪽 사이드바 */}
      <aside style={{ width: "260px", padding: "20px", borderRight: "1px solid #333", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* 4. 검색창에 value와 onChange 연결 */}
        <div style={{ marginBottom: "10px" }}>
          <input 
            type="text" 
            placeholder="Search prompts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // 검색어 상태 업데이트
            style={{ width: "100%", padding: "10px", backgroundColor: "#252525", border: "1px solid #333", borderRadius: "6px", color: "white", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* 5. LLM 리스트 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {LLM_LIST.map(llm => (
            <div 
              key={llm} 
              onClick={() => setSelectedLlm(llm)} // LLM 상태 업데이트
              style={{
                padding: "10px", 
                cursor: "pointer", 
                borderRadius: "6px",
                // 선택된 항목에 하이라이트
                backgroundColor: selectedLlm === llm ? "#2a2a2a" : "transparent",
                color: selectedLlm === llm ? "#10a37f" : "#aaa",
                transition: "0.2s"
              }}
              onMouseOver={(e) => e.target.style.color = "white"}
              onMouseOut={(e) => e.target.style.color = (selectedLlm === llm ? "#10a37f" : "#aaa")}
            >
              {llm}
            </div>
          ))}
        </div>
      </aside>


      {/* 메인 콘텐츠 */}
      <main style={{ flex: 1, padding: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "24px" }}>{selectedLlm} <span style={{ fontSize: "16px", color: "#666" }}>{prompts.length}</span></h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          
          <div onClick={handleAddPromptClick} style={addCardStyle}>
            <span style={{ fontSize: "30px", marginBottom: "10px" }}>⊕</span>
            <span style={{ fontWeight: "bold" }}>Add Your Prompt</span>
          </div>

          {prompts.map((prompt) => (
            <div key={prompt.id} style={cardStyle}
              onMouseOver={(e) => e.currentTarget.style.borderColor = "#666"}
              onMouseOut={(e) => e.currentTarget.style.borderColor = "#333"}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={tagStyle}>{prompt.tag}</span>
                  {/* 6. LLM 이름 표시 */}
                  <span style={llmTagStyle}>{prompt.llm}</span>
                </div>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "18px", color: "white" }}>{prompt.title}</h3>
                <p style={descStyle}>{prompt.description}</p>
              </div>

              <div style={cardFooterStyle}>
                <span style={{ fontWeight: "bold", color: "#fff" }}>
                  {prompt.price === 0 ? "Free" : `${prompt.price.toLocaleString()}원`}
                </span>
                <Link to={`/prompt/${prompt.id}`} style={{ textDecoration: "none" }}>
                   <span style={{ color: "#10a37f", fontSize: "14px" }}>View Details →</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// --- 스타일 객체 ---
const addCardStyle = { height: "100%", minHeight: "200px", border: "none", borderRadius: "12px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "#10a37f", color: "white", cursor: "pointer", transition: "0.3s", opacity: 0.8 };
const cardStyle = { border: "1px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#252525", display: "flex", flexDirection: "column", justifyContent: "space-between", transition: "border-color 0.2s" };
const tagStyle = { fontSize: "12px", color: "#10a37f", fontWeight: "bold" };
const llmTagStyle = { fontSize: "12px", backgroundColor: "#444", color: "#ccc", padding: "2px 6px", borderRadius: "4px" };
const descStyle = { fontSize: "14px", color: "#aaa", height: "60px", overflow: "hidden", lineHeight: "1.5" };
const cardFooterStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", borderTop: "1px solid #333", paddingTop: "15px" };