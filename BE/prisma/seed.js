const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 메인 함수
async function main() {
  console.log(' seeding...');

  // 1. 기존 데이터 지우기
  await prisma.promptComment.deleteMany();
  await prisma.promptPost.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.prompt.deleteMany();
  await prisma.user.deleteMany();

  console.log('  🧹 기존 데이터 삭제 완료');

  // 2. 샘플 사용자 3명 생성
  const user1 = await prisma.user.create({
    data: {
      email: 'haneul@test.com',
      password: '1234',
      name: '김하늘',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'brian@test.com',
      password: '1234',
      name: 'BrianDev',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'alice@test.com',
      password: '1234',
      name: 'AliceCreative',
    },
  });

  console.log('  👤 사용자 3명 생성 완료');

  // 3. 샘플 프롬프트 4개 생성
  const p1 = await prisma.prompt.create({
    data: {
      title: 'React 전문가처럼 코드 리뷰하기',
      description: '이 프롬프트를 사용하면 React 코드의 베스트 프랙티스를 제안하고, 성능 문제를 짚어주며, 훅(Hook) 사용법을 교정해 줍니다.',
      content: 'You are a Senior React Developer with 10 years of experience... (이하 생략)',
      author: user2.name, // BrianDev가 작성
      tag: '코드 생성',
      llm: 'ChatGPT',
      price: 1000,
    },
  });

  const p2 = await prisma.prompt.create({
    data: {
      title: '블로그 마케팅 카피 5가지 생성',
      description: '제품명과 특징만 입력하면, 사용자의 시선을 사로잡는 매력적인 블로그 포스팅용 제목과 도입부 카피 5가지를 생성합니다.',
      content: 'You are a professional copywriter specialized in digital marketing... (이하 생략)',
      author: user3.name, // AliceCreative가 작성
      tag: 'AI 글쓰기',
      llm: 'Claude',
      price: 500,
    },
  });

  const p3 = await prisma.prompt.create({
    data: {
      title: '복잡한 SQL 쿼리 최적화 도우미',
      description: '현재 실행 중인 SQL 쿼리를 입력하면, 인덱스 사용, 조인(Join) 방식 변경 등 성능을 최적화할 수 있는 방안을 제시합니다.',
      content: 'Act as a DBA (Database Administrator)... (이하 생략)',
      author: user2.name, // BrianDev가 작성
      tag: '코드 생성',
      llm: 'Gemini',
      price: 0, // 무료
    },
  });

  const p4 = await prisma.prompt.create({
    data: {
      title: '긴 영문 기사 핵심 요약 (Gemini용)',
      description: 'Gemini에 최적화된 이 프롬프트는 5000자 이상의 긴 영문 기사를 받아서, 핵심 내용만 3줄로 요약해 줍니다.',
      content: 'Please summarize the following article in three bullet points... (이하 생략)',
      author: user1.name, // 김하늘이 작성
      tag: '요약',
      llm: 'Gemini',
      price: 300,
    },
  });

  console.log('  🚀 프롬프트 4개 생성 완료');

  // 4. 샘플 구매내역 생성
  await prisma.purchase.create({
    data: {
      userId: user1.id,
      promptId: p1.id,
    },
  });

  console.log('  🛒 구매내역 1건 생성 완료');

  // 5. 샘플 이슈 1개 생성
  const post1 = await prisma.promptPost.create({
    data: {
      title: 'Gemini에서도 잘 작동하게 수정 가능할까요?',
      content: '프롬프트 정말 잘 쓰고 있습니다!\n그런데 이 프롬프트를 Gemini에서 사용하니 ChatGPT만큼 성능이 안 나오네요.\n혹시 Gemini용으로도 수정 가능하실까요?',
      userId: user1.id,
      promptId: p1.id,
    },
  });

  console.log('  ✍️ 이슈 1건 생성 완료');

  // 6. 샘플 댓글 1개 생성
  await prisma.promptComment.create({
    data: {
      content: '좋은 피드백 감사합니다! Gemini의 특성을 고려해서 프롬프트 내용을 조금 수정해 봤습니다. 업데이트된 내용 확인해보시겠어요?',
      userId: user2.id,
      postId: post1.id,
    },
  });

  console.log('  💬 댓글 1건 생성 완료');
  console.log('✨ Seed 작업 완료!');
}

// 스크립트 실행
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });