module.exports = {
   '/auth/status': {
      get: {
         summary: '로그인 상태 확인',
         description: '현재 사용자의 로그인 상태를 확인합니다.',
         tags: ['Auth'],
         responses: {
            200: {
               description: '로그인 상태 반환',
               content: {
                  'application/json': {
                     schema: {
                        type: 'object',
                        properties: {
                           success: { type: 'boolean', example: true },
                           isLoggedIn: { type: 'boolean', example: true },
                           data: {
                              type: 'object',
                              example: {
                                 email: 'test@example.com',
                                 name: '홍길동',
                                 is_ban: false,
                              },
                           },
                        },
                     },
                  },
               },
            },
         },
      },
   },
   '/auth/logout': {
      post: {
         summary: '로그아웃',
         description: '현재 로그인된 사용자를 로그아웃합니다.',
         tags: ['Auth'],
         responses: {
            200: { description: '로그아웃 성공' },
         },
      },
   },
   '/auth/google': {
      get: {
         summary: '구글 로그인',
         description: '구글 계정을 통해 로그인합니다.',
         tags: ['Auth'],
         responses: {
            302: { description: '구글 인증 페이지로 리다이렉트' },
         },
      },
   },
   '/auth/google/callback': {
      get: {
         summary: '구글 로그인 콜백',
         description: '구글 로그인 인증 후 호출되는 콜백 엔드포인트입니다.',
         tags: ['Auth'],
         responses: {
            200: { description: '로그인 성공 (프론트엔드로 메시지 전달)' },
            302: { description: '로그인 실패 시 /login 리다이렉트' },
         },
      },
   },
   '/auth/kakao': {
      get: {
         summary: '카카오 로그인',
         description: '카카오 계정을 통해 로그인합니다.',
         tags: ['Auth'],
         responses: {
            302: { description: '카카오 인증 페이지로 리다이렉트' },
         },
      },
   },
   '/auth/kakao/callback': {
      get: {
         summary: '카카오 로그인 콜백',
         description: '카카오 로그인 인증 후 호출되는 콜백 엔드포인트입니다.',
         tags: ['Auth'],
         responses: {
            200: { description: '로그인 성공 (프론트엔드로 메시지 전달)' },
            302: { description: '로그인 실패 시 /login 리다이렉트' },
         },
      },
   },
}
