import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 컴포넌트들 불러오기
import App from './App.jsx'
import PromptList from './pages/PromptList.jsx' 
import PromptDetail from './pages/PromptDetail.jsx' 
import PromptCreate from './pages/PromptCreate.jsx'
import SignUp from './pages/SignUp.jsx';
import Login from './pages/Login.jsx';
import MyPage from './pages/MyPage.jsx';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<PromptList />} /> 
          <Route path="prompt/create" element={<PromptCreate />} />
          <Route path="prompt/:id" element={<PromptDetail />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="login" element={<Login />} />
          <Route path="mypage" element={<MyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)