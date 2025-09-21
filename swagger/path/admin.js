module.exports = {
   '/admin/user-status': {
      get: {
         summary: '관리자 권한 확인',
         description: '현재 로그인된 관리자의 권한 정보를 조회합니다.',
         tags: ['admin'],
         responses: {
            200: { description: '관리자 권한 정보 조회 성공' },
         },
      },
   },
   '/admin/dashboard-data': {
      get: {
         summary: '대시보드 데이터 조회',
         description: '총 회원수, 게시글 수 등 관리자용 대시보드 데이터를 조회합니다.',
         tags: ['admin'],
         responses: {
            200: { description: '대시보드 데이터 반환 성공' },
         },
      },
   },
   '/admin/users': {
      get: {
         summary: '사용자 목록 조회',
         description: '관리자가 전체 사용자 목록을 조회합니다.',
         tags: ['admin'],
         responses: {
            200: { description: '사용자 목록 반환 성공' },
         },
      },
   },
   '/admin/user/{id}': {
      get: {
         summary: '특정 사용자 조회',
         description: 'ID로 특정 사용자 정보를 조회합니다.',
         tags: ['admin'],
         parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
         responses: {
            200: { description: '사용자 상세 정보 반환 성공' },
         },
      },
      put: {
         summary: '사용자 제재',
         description: '특정 사용자의 제재 상태를 변경합니다.',
         tags: ['admin'],
         parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
         requestBody: {
            required: true,
            content: {
               'application/json': {
                  schema: {
                     type: 'object',
                     properties: {
                        is_ban: { type: 'boolean', example: true },
                        reason: { type: 'string', example: '관리자 권한에 의한 계정 정지' },
                     },
                  },
               },
            },
         },
         responses: {
            200: { description: '사용자의 제재 상태 변경 성공' },
         },
      },
      delete: {
         summary: '사용자 삭제',
         description: '특정 사용자를 삭제합니다.',
         tags: ['admin'],
         parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
         responses: {
            200: { description: '사용자 삭제 성공' },
         },
      },
   },
   '/admin/boards/{id}': {
      delete: {
         summary: '게시글 삭제',
         description: '특정 게시글을 삭제합니다.',
         tags: ['admin'],
         parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
         responses: {
            200: { description: '게시글 삭제 성공' },
         },
      },
   },
   '/admin/ban-words': {
      get: {
         summary: '금지어 목록 조회',
         description: '금지어 목록을 조회합니다.',
         tags: ['admin'],
         responses: {
            200: { description: '금지어 목록 반환 성공' },
         },
      },
      post: {
         summary: '금지어 추가',
         description: '새로운 금지어를 추가합니다.',
         tags: ['admin'],
         requestBody: {
            required: true,
            content: {
               'application/json': {
                  schema: { type: 'object', properties: { pattern: { type: 'string', example: '금지단어' } } },
               },
            },
         },
         responses: {
            201: { description: '금지어 추가 성공' },
         },
      },
   },
   '/admin/ban-words/{id}': {
      delete: {
         summary: '금지어 삭제',
         description: '특정 금지어를 삭제합니다.',
         tags: ['admin'],
         parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
         responses: {
            200: { description: '금지어 삭제 성공' },
         },
      },
   },
   '/admin/settings': {
      get: {
         summary: '설정값 조회',
         description: '관리자가 시스템 설정값을 조회합니다.',
         tags: ['admin'],
         responses: {
            200: { description: '설정값 반환 성공' },
         },
      },
      put: {
         summary: '설정값 수정',
         description: '관리자가 시스템 설정값을 수정합니다.',
         tags: ['admin'],
         requestBody: {
            required: true,
            content: {
               'application/json': {
                  schema: {
                     type: 'object',
                     properties: {
                        key: { type: 'string', example: 'siteTitle' },
                        value: { type: 'string', example: 'My Service' },
                     },
                  },
               },
            },
         },
         responses: {
            200: { description: '설정값 수정 성공' },
         },
      },
   },
   '/admin/products': {
      get: {
         summary: '상품 목록 조회',
         description: '등록된 모든 상품 목록을 조회합니다.',
         tags: ['admin'],
         responses: {
            200: { description: '상품 목록 반환 성공' },
         },
      },
      post: {
         summary: '상품 등록',
         description: '새로운 상품을 등록합니다.',
         tags: ['admin'],
         requestBody: {
            required: true,
            content: {
               'application/json': {
                  schema: {
                     type: 'object',
                     properties: {
                        name: { type: 'string', example: '예시 상품' },
                        price: { type: 'integer', example: 10000 },
                        stock: { type: 'integer', example: 50 },
                     },
                  },
               },
            },
         },
         responses: {
            201: { description: '상품 등록 성공' },
         },
      },
   },
   '/admin/products/{id}': {
      put: {
         summary: '상품 수정',
         description: '특정 상품 정보를 수정합니다.',
         tags: ['admin'],
         parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
         requestBody: {
            required: true,
            content: {
               'application/json': {
                  schema: {
                     type: 'object',
                     properties: {
                        name: { type: 'string', example: '수정된 상품명' },
                        price: { type: 'integer', example: 12000 },
                        stock: { type: 'integer', example: 30 },
                     },
                  },
               },
            },
         },
         responses: {
            200: { description: '상품 수정 성공' },
         },
      },
      delete: {
         summary: '상품 삭제',
         description: '특정 상품을 삭제합니다.',
         tags: ['admin'],
         parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
         responses: {
            200: { description: '상품 삭제 성공' },
         },
      },
   },
   '/admin/product-lists': {
      get: {
         summary: '상품 리스트 조회',
         description: '전체 상품 리스트를 조회합니다.',
         tags: ['admin'],
         responses: {
            200: { description: '상품 리스트 반환 성공' },
         },
      },
   },
   '/admin/boards': {
      get: {
         summary: '게시글 목록 조회',
         description: '전체 게시글 목록을 조회합니다.',
         tags: ['admin'],
         responses: {
            200: { description: '게시글 목록 반환 성공' },
         },
      },
   },
   '/admin/statistics': {
      get: {
         summary: '통계 데이터 조회',
         description: '회원 수, 게시글 수 등 서비스 통계 데이터를 조회합니다.',
         tags: ['admin'],
         responses: {
            200: { description: '통계 데이터 반환 성공' },
         },
      },
   },
}
