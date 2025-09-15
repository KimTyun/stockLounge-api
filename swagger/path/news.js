module.exports = {
   '/news': {
      get: {
         summary: '네이버 뉴스 데이터 가져오기.',
         description: '네이버 검색 api에서 뉴스 데이터를 query로 가져옵니다.',
         tags: ['naverAPI'],
         parameters: [
            {
               name: 'query',
               in: 'query',
               required: true,
               description: '검색할 키워드',
               schema: { type: 'string', example: '경제' },
            },
            {
               name: 'length',
               in: 'query',
               required: false,
               description: '가져올 기사 개수 (최대 100)',
               schema: { type: 'integer', example: 10 },
            },
            {
               name: 'start',
               in: 'query',
               required: false,
               description: '검색 시작 위치 (1부터 시작, 최대 1000)',
               schema: { type: 'integer', example: 1 },
            },
         ],
         responses: {
            200: {
               description: '성공적으로 뉴스 데이터를 가져옴',
               content: {
                  'application/json': {
                     schema: {
                        type: 'object',
                        properties: {
                           success: { type: 'boolean', example: true },
                           data: {
                              type: 'object',
                              description: '네이버 뉴스 API 원본 응답 데이터',
                              properties: {
                                 lastBuildDate: { type: 'string', example: 'Mon, 15 Sep 2025 12:00:00 +0900' },
                                 total: { type: 'integer', example: 230 },
                                 start: { type: 'integer', example: 1 },
                                 display: { type: 'integer', example: 10 },
                                 items: {
                                    type: 'array',
                                    items: {
                                       type: 'object',
                                       properties: {
                                          title: { type: 'string', example: '<b>삼성전자</b> 신제품 출시' },
                                          originallink: { type: 'string', example: 'http://news.example.com/article/123' },
                                          link: { type: 'string', example: 'http://naver.me/abcdef' },
                                          description: { type: 'string', example: '삼성전자가 새로운 제품을 공개했다.' },
                                          pubDate: { type: 'string', example: 'Mon, 15 Sep 2025 11:50:00 +0900' },
                                       },
                                    },
                                 },
                              },
                           },
                           query: { type: 'string', example: '경제' },
                           start: { type: 'integer', example: 1 },
                        },
                     },
                  },
               },
            },
            500: {
               description: '서버 내부 오류',
            },
         },
      },
   },
}
