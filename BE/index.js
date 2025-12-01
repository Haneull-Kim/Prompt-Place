const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// 새 프롬프트 등록
app.post('/api/prompts', async (req, res) => {
  try {
    const { title, description, content, author, tag, llm, price } = req.body;
    
    const newPrompt = await prisma.prompt.create({
      data: {
        title,
        description,
        content,
        author,
        tag,
        llm,
        price: parseInt(price) || 0,
      },
    });
    
    console.log('데이터 저장 성공:', newPrompt);
    res.json(newPrompt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '프롬프트 등록 중 오류가 발생했습니다.' });
  }
});

// 전체 프롬프트 목록 조회
app.get('/api/prompts', async (req, res) => {
  try {
    // 쿼리 파라미터(search, llm) 받기
    const { search, llm } = req.query;

    // Prisma에 전달할 where 조건 객체
    const where = {};

    // 1. 검색어(search)가 있으면
    if (search) {
      where.title = {
        contains: search,
      };
    }

    // 2. LLM 필터(llm)가 있으면 (그리고 'All Prompts'가 아니면)
    if (llm && llm !== 'All Prompts') {
      where.llm = llm;
    }

    const prompts = await prisma.prompt.findMany({
      where: where, // 동적으로 생성된 where 조건 적용
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: '목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 상세 정보 조회
app.get('/api/prompts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prompt = await prisma.prompt.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!prompt) {
      return res.status(404).json({ error: '프롬프트를 찾을 수 없습니다.' });
    }

    res.json(prompt);
  } catch (error) {
    res.status(500).json({ error: '상세 정보를 불러오는 중 오류가 발생했습니다.' });
  }
});

// 회원가입 
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 이미 있는 이메일인지 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: '이미 가입된 이메일입니다.' });
    }

    // 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        email,
        password,
        name,
      },
    });

    console.log('회원가입 성공:', newUser);
    res.json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '회원가입 중 오류가 발생했습니다.' });
  }
});

// 로그인
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 이메일로 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 사용자가 없거나 비밀번호가 틀리면 에러
    if (!user || user.password !== password) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    console.log('로그인 성공:', user);
    // 로그인 성공 시 사용자 정보 반환
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다.' });
  }
});

// 프롬프트 구매하기
app.post('/api/purchases', async (req, res) => {
  try {
    const { userId, promptId } = req.body;

    // --- 1. 구매하려는 프롬프트 정보를 가져옴 ---
    const promptToPurchase = await prisma.prompt.findUnique({
      where: { id: Number(promptId) },
    });

    if (!promptToPurchase) {
      return res.status(404).json({ message: '존재하지 않는 프롬프트입니다.' });
    }

    // --- 2. 작성자가 "탈퇴한 사용자"인지 확인 ---
    if (promptToPurchase.author === "탈퇴한 사용자") {
      return res.status(403).json({ message: '탈퇴한 사용자의 프롬프트는 구매할 수 없습니다.' });
    }

    // 3. 이미 구매했는지 확인
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: Number(userId),
        promptId: Number(promptId),
      },
    });

    if (existingPurchase) {
      return res.status(400).json({ message: '이미 구매한 프롬프트입니다.' });
    }

    // 4. 구매 기록 생성
    const purchase = await prisma.purchase.create({
      data: {
        userId: Number(userId),
        promptId: Number(promptId),
      },
    });

    res.json({ success: true, purchase });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '구매 처리 중 오류가 발생했습니다.' });
  }
});

// 구매 여부 확인 
app.get('/api/purchases/check', async (req, res) => {
  try {
    const { userId, promptId } = req.query;

    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: Number(userId),
        promptId: Number(promptId),
      },
    });

    // 구매 내역이 있으면 true, 없으면 false 반환
    res.json({ isPurchased: !!purchase }); 
  } catch (error) {
    res.status(500).json({ error: '확인 중 오류가 발생했습니다.' });
  }
});

// 마이페이지 정보 조회
app.get('/api/users/:id/mypage', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = Number(id);

    // 1. 유저 기본 정보와 "구매 내역" 가져오기
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        purchases: {
          include: { prompt: true },
          orderBy: { createdAt: 'desc' }
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 2. "내가 등록한 프롬프트" 가져오기
    const myPrompts = await prisma.prompt.findMany({
      where: { author: user.name },
      orderBy: { createdAt: 'desc' }
    });

    // 3. "내가 작성한 이슈" 가져오기
    const myPosts = await prisma.promptPost.findMany({
      where: { userId: userId },
      include: {
        prompt: { select: { id: true, title: true } } // 부모 프롬프트 정보
      },
      orderBy: { createdAt: 'desc' }
    });

    // 4. "내가 작성한 댓글" 가져오기
    const myComments = await prisma.promptComment.findMany({
      where: { userId: userId },
      include: {
        post: { // 댓글의 부모 이슈
          include: {
            prompt: { select: { id: true, title: true } } // 이슈의 부모 프롬프트
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 5. 이슈와 댓글을 하나의 "활동" 배열로 합치고 정렬
    const formattedPosts = myPosts.map(post => ({
      ...post,
      type: '이슈' // 태그 구분을 위한 'type' 필드 추가
    }));
    const formattedComments = myComments.map(comment => ({
      ...comment,
      type: '댓글'
    }));

    const activities = [...formattedPosts, ...formattedComments]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // 최신순 정렬

    
    const { password, ...userInfo } = user;
    
    // 6. 모든 데이터를 한 번에 반환
    res.json({
      ...userInfo,   
      myPrompts,     
      activities     
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '마이페이지 정보 조회 실패' });
  }
});

// 사용자 이름 수정
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name: newName } = req.body; 
    const userId = Number(id);

    // 현재 사용자의 "옛날 이름" 조회
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    const oldName = currentUser.name;

    // 트랜잭션(Transaction)을 사용해 여러 작업을 동시에 처리
    // - 1: User 테이블의 이름 변경
    // - 2: Prompt 테이블의 author 필드를 '옛날 이름' -> '새 이름'으로 변경
    const [updatedUser, updatePrompts] = await prisma.$transaction([
      // 1: 사용자 이름 업데이트
      prisma.user.update({
        where: { id: userId },
        data: { name: newName },
      }),
      // 2: 해당 사용자가 작성한 모든 프롬프트의 author 필드 업데이트
      prisma.prompt.updateMany({
        where: { author: oldName }, // 옛날 이름으로 작성된 프롬프트를
        data: { author: newName },  // 새 이름으로 변경
      })
    ]);

    // 4. 비밀번호를 제외한 사용자 정보 반환
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '정보 수정에 실패했습니다.' });
  }
});

// 회원 탈퇴 (Soft Delete - "탈퇴한 사용자"로 변경)
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = Number(id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    await prisma.$transaction([
      // 사용자가 등록한 프롬프트의 'author'를 "탈퇴한 사용자"로 변경
      prisma.prompt.updateMany({
        where: { author: user.name },
        data: { author: "탈퇴한 사용자" },
      }),

      // 사용자(User) 테이블의 정보를 "탈퇴한 사용자"로 변경
      prisma.user.update({
        where: { id: userId },
        data: {
          name: "탈퇴한 사용자",
          email: `deleted-${userId}-${Date.now()}@deleted.com`, // 절대 중복되지 않는 값
          password: `DELETED_${Date.now()}`, // 로그인을 못하도록 임의의 값으로 변경
        },
      }),

      // 구매 내역 삭제
      prisma.purchase.deleteMany({
        where: { userId: userId }
      })
    ]);

    res.json({ success: true, message: '회원 탈퇴가 완료되었습니다.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '회원 탈퇴 중 오류가 발생했습니다.' });
  }
});

// 프롬프트의 모든 이슈/댓글 가져오기
app.get('/api/prompts/:id/posts', async (req, res) => {
  try {
    const { id } = req.params;
    const posts = await prisma.promptPost.findMany({
      where: { promptId: Number(id) },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } }, // 이슈 작성자 이름
        comments: { // 이슈에 달린 댓글들 포함
          orderBy: { createdAt: 'asc' }, // 댓글은 오래된순
          include: {
            user: { select: { name: true } } // 댓글 작성자 이름
          }
        }
      }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: '이슈 목록을 불러오는 데 실패했습니다.' });
  }
});

// 새 이슈 등록하기
app.post('/api/posts', async (req, res) => {
  try {
    const { userId, promptId, title, content } = req.body;
    const newPost = await prisma.promptPost.create({
      data: {
        userId: Number(userId),
        promptId: Number(promptId),
        title,
        content
      },
      include: { user: { select: { name: true } }, comments: [] } // 새 이슈 반환
    });
    res.json(newPost);
  } catch (error) {
    res.status(500).json({ error: '이슈 등록에 실패했습니다.' });
  }
});

// 이슈에 댓글 달기
app.post('/api/comments', async (req, res) => {
  try {
    const { userId, postId, content } = req.body;
    const newComment = await prisma.promptComment.create({
      data: {
        userId: Number(userId),
        postId: Number(postId),
        content
      },
      include: { user: { select: { name: true } } } // 새 댓글 반환
    });
    res.json(newComment);
  } catch (error) {
    res.status(500).json({ error: '댓글 등록에 실패했습니다.' });
  }
});

// 서버 시작
app.listen(3001, () => {
  console.log('서버가 3001번 포트에서 실행 중입니다! 🚀');
});