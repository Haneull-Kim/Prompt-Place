import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function PromptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [prompt, setPrompt] = useState(null);
  const [isPurchased, setIsPurchased] = useState(false);
  
  const [posts, setPosts] = useState([]);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [newComments, setNewComments] = useState({});

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // 1. 프롬프트 정보
    fetch(`http://localhost:3001/api/prompts/${id}`)
      .then((res) => res.json())
      .then((data) => setPrompt(data));

    // 2. 이슈 목록
    fetch(`http://localhost:3001/api/prompts/${id}/posts`)
      .then((res) => res.json())
      .then((data) => setPosts(data));

    // 3. 구매 여부
    if (user) {
      fetch(`http://localhost:3001/api/purchases/check?userId=${user.id}&promptId=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.isPurchased) setIsPurchased(true);
        });
    }
  }, [id, user]);

  const handlePurchase = () => {
    if (!user) {
      alert("로그인이 필요한 서비스입니다.");
      navigate('/login');
      return;
    }
    if (confirm("정말 구매하시겠습니까?")) {
      fetch('http://localhost:3001/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, promptId: id }),
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("구매 완료!");
          setIsPurchased(true);
        }
      });
    }
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!user) return alert("로그인 후 작성 가능합니다.");

    fetch('http://localhost:3001/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        promptId: id,
        title: newPost.title,
        content: newPost.content
      }),
    })
    .then(res => res.json())
    .then(savedPost => {
      setPosts([savedPost, ...posts]);
      setNewPost({ title: "", content: "" });
      setShowNewPostForm(false);
    });
  };
  
  const handleCommentSubmit = (e, postId) => {
    e.preventDefault();
    if (!user) return alert("로그인 후 작성 가능합니다.");
    
    const content = newComments[postId];
    if (!content || !content.trim()) return alert("내용을 입력하세요.");

    fetch('http://localhost:3001/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        postId: postId,
        content: content
      }),
    })
    .then(res => res.json())
    .then(savedComment => {
      setPosts(currentPosts => 
        currentPosts.map(post => 
          post.id === postId 
            ? { ...post, comments: [...post.comments, savedComment] }
            : post
        )
      );
      setNewComments(prev => ({ ...prev, [postId]: "" }));
    });
  };
  
  const handleCommentChange = (postId, value) => {
    setNewComments(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  if (!prompt) return <div style={{ color: "white", padding: "40px", textAlign: "center" }}>로딩 중...</div>;

  // 1. '작성자'인지 확인하는 변수
  const isAuthor = user && prompt && user.name === prompt.author;
  // 2. '구매했거나' 또는 '작성자'인지 확인하는 변수
  const canViewContent = isPurchased || isAuthor;

  return (
    <div style={pageStyle}>
      {/* 1. 프롬프트 상단 정보 */}
      <div style={headerStyle}>
        <span style={tagStyle}>{prompt.tag}</span>
        <h1 style={{ margin: "15px 0", fontSize: "32px", color: "white" }}>{prompt.title}</h1>
        <p style={metaStyle}>작성자: {prompt.author} | 가격: {prompt.price === 0 ? "Free" : `${prompt.price.toLocaleString()}원`}</p>
        {isAuthor ? (
          // 1. 내가 작성자
          <button disabled style={{...disabledBtnStyle, backgroundColor: "#555"}}>
            📝 내 프롬프트 (작성자)
          </button>
        ) : isPurchased ? (
          // 2. 내가 구매함
          <button disabled style={disabledBtnStyle}>✅ 구매 완료</button>
        ) : prompt.author === "탈퇴한 사용자" ? (
          // 3. 작성자가 탈퇴함 (구매X)
          <button disabled style={{...disabledBtnStyle, backgroundColor: "#e74c3c"}}>
            🚫 판매가 중지된 프롬프트입니다
          </button>
        ) : (
          // 4. 구매 가능한 상태
          <button onClick={handlePurchase} style={purchaseBtnStyle}>구매하고 프롬프트 확인하기</button>
        )}
      </div>

      <div style={contentBoxStyle}>
        <h3 style={{ color: "white", borderBottom: "1px solid #333", paddingBottom: "10px" }}>
          프롬프트 내용
        </h3>
        <div style={{ 
          ...contentBlockStyle,
          filter: canViewContent ? "none" : "blur(5px)", 
          userSelect: canViewContent ? "auto" : "none",
        }}>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit", color: "#ccc" }}>
            {prompt.content}
          </pre>
        </div>
        {!canViewContent && <p style={lockStyle}>🔒 구매 후 확인 가능</p>}
      </div>

      
      {/* 2. 커뮤니티(이슈) 섹션 */}
      <div style={reviewSectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ color: "white", fontSize: "20px", margin: 0 }}>🗣️ 커뮤니티 ({posts.length})</h3>
          <button onClick={() => user ? setShowNewPostForm(!showNewPostForm) : alert("로그인 후 이용해주세요.")} style={submitBtnStyle}>
            {showNewPostForm ? "닫기" : "새 이슈 등록"}
          </button>
        </div>

        {/* --- '새 이슈 폼' --- */}
        {showNewPostForm && (
          <form 
            onSubmit={handlePostSubmit} 
            style={{ ...formStyle, backgroundColor: "#2c2c2c", padding: "20px" }}
          >
            <input 
              type="text" 
              placeholder="이슈 제목 (예: Gemini에서 작동하지 않습니다)" 
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              style={{ ...inputStyle, width: "100%", boxSizing: "border-box", marginBottom: "10px" }}
              required
            />
            <textarea 
              placeholder="자세한 내용을 입력하세요 (버그 리포트, 활용법 공유 등)" 
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              style={{ ...inputStyle, height: "100px", width: "100%", boxSizing: "border-box", marginBottom: "10px" }}
              required
            />
            <button 
              type="submit" 
              style={{...submitBtnStyle, display: "block", margin: "10px auto 0" }} 
            >
              등록
            </button>
          </form>
        )}

        {/* 이슈 목록 표시 */}
        <div style={{ marginTop: showNewPostForm ? "30px" : "20px" }}>
          {posts.map((post) => (
            <div key={post.id} style={{ ...formStyle, padding: "0" }}>
              {/* 이슈 헤더 */}
              <div style={{ backgroundColor: "#333", padding: "15px 20px", borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}>
                <h4 style={{ color: "white", margin: 0 }}>{post.title}</h4>
                <span style={{ fontSize: "12px", color: "#aaa" }}>
                  by {post.user?.name}
                  {" | "}{new Date(post.createdAt).toLocaleString()}
                </span>
              </div>
              
              {/* 이슈 본문 */}
              <pre style={commentContentStyle}>
                {post.content}
              </pre>

              {/* 이슈에 달린 댓글들 */}
              <div style={{ padding: "0 20px" }}>
                {post.comments.map(comment => (
                  <div key={comment.id} style={{ borderTop: "1px solid #444", padding: "15px 0" }}>
                    <strong style={{ color: "white", fontSize: "14px" }}>{comment.user?.name}</strong>
                    <span style={{ fontSize: "12px", color: "#aaa" }}>
                      {" | "}{new Date(comment.createdAt).toLocaleString()}
                    </span>
                    <pre style={commentContentStyle}>
                      {comment.content}
                    </pre>
                  </div>
                ))}
              </div>
              
              {/* --- '댓글 폼' --- */}
              <form 
                onSubmit={(e) => handleCommentSubmit(e, post.id)} 
                style={{ 
                  padding: "20px", 
                  borderTop: "1px solid #444", 
                  display: "flex", 
                  gap: "10px", 
                  alignItems: "flex-start"
                }}
              >
                <textarea 
                  placeholder="댓글을 남겨주세요..." 
                  value={newComments[post.id] || ""}
                  onChange={(e) => handleCommentChange(post.id, e.target.value)}
                  style={{ 
                    ...inputStyle, 
                    flex: 1, 
                    height: "40px",           
                    resize: "none",           // 크기 조절 비활성화
                    boxSizing: "border-box" 
                  }}
                  required
                />
                <button 
                  type="submit" 
                  style={{
                    ...submitBtnStyle, 
                    fontSize: "13px", 
                    padding: "8px 15px", 
                    height: "40px",           
                    boxSizing: "border-box"  
                  }}
                >
                  댓글 등록
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 스타일 객체 ---
const pageStyle = { padding: "40px", maxWidth: "800px", margin: "0 auto", color: "#ffffff" };
const headerStyle = { borderBottom: "1px solid #333", paddingBottom: "20px", marginBottom: "20px", textAlign: "center" };
const tagStyle = { backgroundColor: "#2a2a2a", color: "#10a37f", padding: "5px 12px", borderRadius: "15px", fontSize: "12px", fontWeight: "bold" };
const metaStyle = { color: "#aaa", fontSize: "14px" };
const purchaseBtnStyle = { padding: "12px 25px", backgroundColor: "#10a37f", color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer", fontWeight: "bold", transition: "opacity 0.2s" };
const disabledBtnStyle = { ...purchaseBtnStyle, backgroundColor: "#555", color: "#999", cursor: "not-allowed" };
const contentBoxStyle = { backgroundColor: "#252525", padding: "20px", borderRadius: "8px", marginBottom: "40px" };
const contentBlockStyle = { backgroundColor: "#1e1e1e", padding: "20px", minHeight: "150px", borderRadius: "6px", transition: "filter 0.3s" };
const lockStyle = { textAlign: "center", color: "#e74c3c", fontWeight: "bold", marginTop: "15px" };
const reviewSectionStyle = { marginTop: "40px", borderTop: "1px solid #333", paddingTop: "20px" };
const formStyle = { marginBottom: "20px", border: "1px solid #444", borderRadius: "8px", backgroundColor: "#252525", overflow: "hidden" };
const inputStyle = { backgroundColor: "#2a2a2a", color: "white", border: "1px solid #444", padding: "10px", borderRadius: "6px", outline: "none" };
const submitBtnStyle = { padding: "10px 20px", backgroundColor: "#10a37f", color: "white", border: "none", cursor: "pointer", borderRadius: "6px", fontWeight: "bold" };
const commentContentStyle = { margin: "10px 0", color: "#ccc", whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "14px", padding: "0 20px" };