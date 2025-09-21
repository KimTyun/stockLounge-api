module.exports = {
   '/reward': {
      get: {
         summary: '리워드 아이템 목록 조회',
         description: '사용 가능한 리워드 아이템 전체 리스트를 반환합니다.',
         tags: ['Reward'],
         responses: {
            200: {
               description: '조회 성공',
               content: {
                  'application/json': {
                     schema: {
                        type: 'object',
                        properties: {
                           success: { type: 'boolean', example: true },
                           data: {
                              type: 'array',
                              items: {
                                 type: 'object',
                                 properties: {
                                    id: { type: 'integer', example: 1 },
                                    name: { type: 'string', example: '스타벅스 쿠폰' },
                                    point: { type: 'integer', example: 5000 },
                                    stock: { type: 'integer', example: 10 },
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
   },
   '/reward/coin': {
      put: {
         summary: '포인트 → 코인 교환',
         description: '로그인한 사용자가 보유 포인트를 소모하여 코인을 교환합니다. (1코인 = 1000포인트)',
         tags: ['Reward'],
         requestBody: {
            required: true,
            content: {
               'application/json': {
                  schema: {
                     type: 'object',
                     properties: {
                        count: { type: 'integer', example: 3, description: '교환할 코인 개수' },
                     },
                  },
               },
            },
         },
         responses: {
            200: { description: '교환 성공' },
            400: { description: '포인트 부족' },
         },
      },
   },
   '/reward/reward': {
      put: {
         summary: '리워드 아이템 교환',
         description: '로그인한 사용자가 보유 포인트로 리워드 아이템을 교환합니다.',
         tags: ['Reward'],
         requestBody: {
            required: true,
            content: {
               'application/json': {
                  schema: {
                     type: 'object',
                     properties: {
                        rewardId: { type: 'integer', example: 1, description: '교환할 리워드 아이템 ID' },
                     },
                  },
               },
            },
         },
         responses: {
            200: { description: '교환 성공' },
            400: { description: '포인트 부족 또는 재고 없음' },
            404: { description: '리워드 아이템 없음' },
         },
      },
   },
}
