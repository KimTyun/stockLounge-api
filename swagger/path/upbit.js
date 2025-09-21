module.exports = {
   '/upbit/list': {
      get: {
         summary: '거래 상위 코인 리스트 조회',
         description: 'Upbit API에서 KRW 마켓 기준 거래 상위 N개의 코인을 조회합니다.',
         tags: ['Upbit'],
         parameters: [
            {
               name: 'n',
               in: 'query',
               required: false,
               description: '조회할 코인 개수 (기본값 15)',
               schema: { type: 'integer', example: 10 },
            },
         ],
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
                                    market: { type: 'string', example: 'KRW-BTC' },
                                    trade_price: { type: 'number', example: 37000000 },
                                    signed_change_rate: { type: 'number', example: -0.0123 },
                                    acc_trade_price_24h: { type: 'number', example: 1234567890 },
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
   '/upbit/markets': {
      get: {
         summary: '마켓 목록 조회',
         description: 'Upbit API에서 모든 마켓 목록을 조회합니다.',
         tags: ['Upbit'],
         responses: {
            200: {
               description: '조회 성공',
               content: {
                  'application/json': {
                     schema: {
                        type: 'array',
                        items: {
                           type: 'object',
                           properties: {
                              market: { type: 'string', example: 'KRW-BTC' },
                              korean_name: { type: 'string', example: '비트코인' },
                              english_name: { type: 'string', example: 'Bitcoin' },
                           },
                        },
                     },
                  },
               },
            },
         },
      },
   },
   '/upbit/candles': {
      get: {
         summary: '캔들(차트) 데이터 조회',
         description: 'Upbit API에서 특정 마켓의 캔들 데이터를 조회합니다.',
         tags: ['Upbit'],
         parameters: [
            {
               name: 'time',
               in: 'query',
               required: false,
               description: '캔들 종류 (minutes, days, weeks, months). 기본값 days',
               schema: { type: 'string', example: 'days' },
            },
            {
               name: 'market',
               in: 'query',
               required: true,
               description: '조회할 마켓 (예: KRW-BTC)',
               schema: { type: 'string', example: 'KRW-BTC' },
            },
            {
               name: 'count',
               in: 'query',
               required: true,
               description: '가져올 캔들 데이터 개수',
               schema: { type: 'integer', example: 10 },
            },
         ],
         responses: {
            200: {
               description: '조회 성공',
               content: {
                  'application/json': {
                     schema: {
                        type: 'array',
                        items: {
                           type: 'object',
                           properties: {
                              market: { type: 'string', example: 'KRW-BTC' },
                              candle_date_time_utc: { type: 'string', example: '2025-09-21T00:00:00' },
                              candle_date_time_kst: { type: 'string', example: '2025-09-21T09:00:00' },
                              opening_price: { type: 'number', example: 36500000 },
                              high_price: { type: 'number', example: 37200000 },
                              low_price: { type: 'number', example: 36000000 },
                              trade_price: { type: 'number', example: 37000000 },
                              candle_acc_trade_volume: { type: 'number', example: 1234.567 },
                           },
                        },
                     },
                  },
               },
            },
         },
      },
   },
}
