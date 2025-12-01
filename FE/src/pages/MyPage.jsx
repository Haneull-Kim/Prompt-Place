import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function MyPage() {
  const navigate = useNavigate();
  // userData로 상태를 통합 관리
  const [userData, setUserData] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");

  const localUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!localUser) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return;
    }

    // API 호출
    fetch(`http://localhost:3001/api/users/${localUser.id}/mypage`)
      .then((res) => res.json())
      .then((data) => {
        setUserData(data); // 받아온 모든 데이터를 userData에 저장
        setNewName(data.name);
      })
      .catch((err) => console.error("정보 로드 실패:", err));
  }, []);

const handleUpdate = () => {
    fetch(`http://localhost:3001/api/users/${localUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    })
    .then(res => res.json())
    .then(updatedUser => {
      alert("이름이 성공적으로 변경되었습니다.");
      // 로컬 스토리지 정보도 업데이트
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUserData(updatedUser); // 상태 업데이트
      setIsEditing(false); // 수정 모드 닫기
      window.location.reload(); // 헤더 이름 갱신을 위해 새로고침
    })
    .catch(err => alert("수정 실패: " + err.message));
  };

  const handleDelete = () => {
    if (window.confirm("정말 계정을 삭제하시겠습니까? 모든 구매 내역과 활동이 영구적으로 삭제됩니다.")) {
      fetch(`http://localhost:3001/api/users/${localUser.id}`, {
        method: 'DELETE',
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(data.message);
          localStorage.removeItem('user'); // 로그아웃 처리
          navigate('/'); // 홈으로 이동
          window.location.reload();
        } else {
          throw new Error(data.error);
        }
      })
      .catch(err => alert("탈퇴 실패: " + err.message));
    }
  };


  // 로딩 중일 때
  if (!userData) return <div style={{ padding: "20px", color: "white", textAlign: "center" }}>로딩 중...</div>;

  return (
    <div style={pageStyle}>
      {/* 1. 사용자 정보 */}
      <div style={sectionStyle}>
        <h2 style={{ color: "white", margin: 0 }}>👤 마이페이지</h2>
        {isEditing ? (
          <div style={{ padding: "20px 0", display: "flex", gap: "10px", alignItems: "center" }}>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} style={inputStyle} />
            <button onClick={handleUpdate} style={saveBtnStyle}>저장</button>
            <button onClick={() => setIsEditing(false)} style={cancelBtnStyle}>취소</button>
          </div>
        ) : (
          <div style={{ padding: "15px 0" }}>
            <p style={nameStyle}>
              반갑습니다, <strong>{userData.name}</strong>님!
              <button onClick={() => setIsEditing(true)} style={editBtnStyle}>수정</button>
            </p>
            <p style={emailStyle}>({userData.email})</p>
          </div>
        )}
      </div>

      {/* 2. 내가 등록한 프롬프트 */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>🚀 내가 등록한 프롬프트 ({userData.myPrompts.length})</h3>
        {userData.myPrompts.length === 0 ? (
          <div style={emptyBoxStyle}>아직 등록한 프롬프트가 없습니다.</div>
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {userData.myPrompts.map((prompt) => (
              <div key={`my-prompt-${prompt.id}`} style={itemStyle}>
                <span style={{...tagStyle}}>{prompt.llm}</span>
                <h4 style={itemTitleStyle}>{prompt.title}</h4>
                <p style={itemDateStyle}>등록일: {new Date(prompt.createdAt).toLocaleDateString()}</p>
                <Link to={`/prompt/${prompt.id}`} style={{ marginLeft: "auto" }}>
                  <button style={viewBtnStyle}>보러가기</button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. 구매한 프롬프트 */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>📦 구매한 프롬프트 ({userData.purchases.length})</h3>
        {userData.purchases.length === 0 ? (
          <div style={emptyBoxStyle}>아직 구매한 프롬프트가 없습니다.</div>
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {userData.purchases.map((item) => (
              <div key={`purchase-${item.id}`} style={itemStyle}>
                <span style={tagStyle}>{item.prompt.tag}</span>
                <h4 style={itemTitleStyle}>{item.prompt.title}</h4>
                <p style={itemDateStyle}>구매일: {new Date(item.createdAt).toLocaleDateString()}</p>
                <Link to={`/prompt/${item.prompt.id}`} style={{ marginLeft: "auto" }}>
                  <button style={viewBtnStyle}>다시 보기</button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. 내 활동 */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>💬 내 활동 ({userData.activities.length})</h3>
        {userData.activities.length === 0 ? (
          <div style={emptyBoxStyle}>아직 활동 내역이 없습니다.</div>
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {userData.activities.map((activity) => {
              // 이슈/댓글에 따라 부모 프롬프트 정보를 찾는 로직
              let promptId, promptTitle;
              if (activity.type === '이슈') {
                promptId = activity.prompt.id;
                promptTitle = activity.prompt.title;
              } else if (activity.type === '댓글' && activity.post && activity.post.prompt) {
                promptId = activity.post.prompt.id;
                promptTitle = activity.post.prompt.title;
              }

              return (
                <div key={`${activity.type}-${activity.id}`} style={itemStyle}>
                  <span style={{
                    ...tagStyle
                  }}>
                    {activity.type}
                  </span>
                  
                  {activity.type === '이슈' ? (
                    <h4 style={itemTitleStyle}>{activity.title}</h4>
                  ) : (
                    <p style={{...itemTitleStyle, color: "#ccc", fontStyle: "italic"}}>
                      "{activity.content}"
                    </p>
                  )}
                  
                  <p style={itemDateStyle}>작성일: {new Date(activity.createdAt).toLocaleDateString()}</p>
                  
                  {/* 부모 프롬프트 정보 및 링크 */}
                  {promptId && (
                    <>
                      <p style={{...itemDateStyle, fontStyle: "italic", marginLeft: "10px", textOverflow: "ellipsis", overflow: "hidden", flexShrink: 1}}>
                        (on "{promptTitle}")
                      </p>
                      <Link to={`/prompt/${promptId}`} style={{ marginLeft: "auto" }}>
                        <button style={viewBtnStyle}>보러가기</button>
                      </Link>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. 계정 관리 */}
      <div style={{ ...sectionStyle, marginTop: "20px" }}>
        <h3 style={sectionTitleStyle}>계정 관리</h3>
        <button onClick={handleDelete} style={deleteBtnStyle}>
          회원 탈퇴 (계정 삭제)
        </button>
        <p style={{ color: "#aaa", fontSize: "12px", marginTop: "10px" }}>
          계정 삭제 시 모든 활동 내역이 영구적으로 삭제되며 복구할 수 없습니다.
        </p>
      </div>
    </div>
  );
}

// --- 스타일 객체 ---
const pageStyle = { maxWidth: "800px", margin: "0 auto", padding: "40px 20px" };
const sectionStyle = { padding: "20px 0", borderBottom: "1px solid #333" };
const sectionTitleStyle = { color: "white", margin: "0 0 20px 0", fontSize: "20px" };
const nameStyle = { fontSize: "20px", color: "white", margin: 0 };
const emailStyle = { fontSize: "14px", color: "#aaa", margin: "5px 0 0 0" };
const editBtnStyle = { marginLeft: "10px", background: "none", border: "1px solid #555", color: "#aaa", cursor: "pointer", borderRadius: "4px", padding: "3px 8px" };
const inputStyle = { flex: 1, padding: "10px", backgroundColor: "#2a2a2a", border: "1px solid #444", borderRadius: "6px", color: "white", outline: "none" };
const saveBtnStyle = { padding: "10px 15px", backgroundColor: "#10a37f", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const cancelBtnStyle = { ...saveBtnStyle, backgroundColor: "#555" };
const deleteBtnStyle = { padding: "10px 15px", backgroundColor: "#e74c3c", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const emptyBoxStyle = { padding: "20px", backgroundColor: "#252525", borderRadius: "8px", textAlign: "center", color: "#aaa" };
const itemStyle = { border: "1px solid #333", backgroundColor: "#252525", borderRadius: "8px", padding: "20px", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" };
const tagStyle = { fontSize: "12px", backgroundColor: "#2a2a2a", color: "#10a37f", padding: "3px 8px", borderRadius: "4px", fontWeight: "bold", whiteSpace: "nowrap" };
const itemTitleStyle = { margin: 0, fontSize: "16px", color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: "100px", flexShrink: 2 };
const itemDateStyle = { margin: 0, color: "#aaa", fontSize: "14px", whiteSpace: "nowrap" };
const viewBtnStyle = { padding: "8px 15px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", whiteSpace: "nowrap" };