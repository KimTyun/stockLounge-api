module.exports = {
   '/user/me': {
      get: {
         summary: '내 정보 가져오기',
         description: '로그인한 사용자의 정보를 반환합니다.',
         tags: ['User'],
         responses: {
            200: {
               description: '내 정보 조회 성공',
               content: {
                  'application/json': {
                     schema: {
                        type: 'object',
                        properties: {
                           success: { type: 'boolean', example: true },
                           data: {
                              type: 'object',
                              example: {
                                 id: 1,
                                 email: 'test@example.com',
                                 name: '홍길동',
                                 age: 25,
                              },
                           },
                        },
                     },
                  },
               },
            },
            404: { description: '회원 없음' },
         },
      },
      put: {
         summary: '내 정보 수정하기',
         description: '로그인한 사용자의 이름, 비밀번호, 나이를 수정합니다.',
         tags: ['User'],
         requestBody: {
            required: true,
            content: {
               'application/json': {
                  schema: {
                     type: 'object',
                     properties: {
                        name: { type: 'string', example: '홍길동' },
                        pw: { type: 'string', example: 'newPassword123' },
                        age: { type: 'integer', example: 30 },
                     },
                  },
               },
            },
         },
         responses: {
            200: { description: '수정 성공' },
         },
      },
   },
   '/user/me/profile-img': {
      put: {
         summary: '프로필 사진 수정하기',
         description: '로그인한 사용자의 프로필 사진을 업로드 및 변경합니다.',
         tags: ['User'],
         requestBody: {
            required: true,
            content: {
               'multipart/form-data': {
                  schema: {
                     type: 'object',
                     properties: {
                        file: {
                           type: 'string',
                           format: 'binary',
                           description: '업로드할 이미지 파일',
                        },
                     },
                  },
               },
            },
         },
         responses: {
            200: { description: '프로필 사진 수정 성공' },
            400: { description: '이미지 파일 없음' },
         },
      },
   },
   '/user/me/posts': {
      get: {
         summary: '내 작성글 목록 가져오기',
         description: '로그인한 사용자가 작성한 게시글 목록을 반환합니다.',
         tags: ['User'],
         parameters: [
            { name: 'limit', in: 'query', required: true, schema: { type: 'integer', example: 10 } },
            { name: 'page', in: 'query', required: true, schema: { type: 'integer', example: 1 } },
         ],
         responses: {
            200: {
               description: '조회 성공',
            },
            400: { description: '필수 query 누락' },
         },
      },
   },
   '/user/me/comments': {
      get: {
         summary: '내 작성 댓글 목록 가져오기',
         description: '로그인한 사용자가 작성한 댓글 목록을 반환합니다.',
         tags: ['User'],
         parameters: [
            { name: 'limit', in: 'query', required: true, schema: { type: 'integer', example: 10 } },
            { name: 'page', in: 'query', required: true, schema: { type: 'integer', example: 1 } },
         ],
         responses: {
            200: { description: '조회 성공' },
            400: { description: '필수 query 누락' },
         },
      },
   },
   '/user/me/reward': {
      get: {
         summary: '내 포인트 기록 가져오기',
         description: '로그인한 사용자의 포인트/코인 획득, 사용 기록을 반환합니다.',
         tags: ['User'],
         parameters: [
            { name: 'limit', in: 'query', required: true, schema: { type: 'integer', example: 10 } },
            { name: 'page', in: 'query', required: true, schema: { type: 'integer', example: 1 } },
         ],
         responses: {
            200: {
               description: '조회 성공',
            },
            400: { description: '필수 query 누락' },
         },
      },
   },
   '/user': {
      get: {
         summary: '유저 리스트 가져오기',
         description: '관리자가 모든 유저 목록을 조회합니다.',
         tags: ['Admin'],
         parameters: [
            { name: 'limit', in: 'query', required: true, schema: { type: 'integer', example: 10 } },
            { name: 'page', in: 'query', required: true, schema: { type: 'integer', example: 1 } },
         ],
         responses: {
            200: { description: '조회 성공' },
            400: { description: '필수 query 누락' },
         },
      },
   },
   '/user/{id}': {
      get: {
         summary: '특정 유저 정보 가져오기',
         description: '관리자가 특정 유저의 정보를 조회합니다.',
         tags: ['Admin'],
         parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
         responses: {
            200: { description: '조회 성공' },
            404: { description: '회원 없음' },
         },
      },
   },
}
