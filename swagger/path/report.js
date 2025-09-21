module.exports = {
   '/report/board/{id}': {
      post: {
         summary: '게시글 신고',
         description: '특정 게시글을 신고합니다.',
         tags: ['Report'],
         parameters: [
            {
               name: 'id',
               in: 'path',
               required: true,
               description: '신고할 게시글 ID',
               schema: { type: 'integer', example: 123 },
            },
         ],
         requestBody: {
            required: true,
            content: {
               'application/json': {
                  schema: {
                     type: 'object',
                     properties: {
                        user_id: { type: 'integer', example: 1, description: '신고하는 사용자 ID' },
                        reason: { type: 'string', example: '욕설 및 비방', description: '신고 사유' },
                     },
                  },
               },
            },
         },
         responses: {
            200: { description: '신고 접수 성공' },
            404: { description: '게시글을 찾을 수 없음' },
         },
      },
   },
   '/report/comment/{id}': {
      post: {
         summary: '댓글 신고',
         description: '특정 댓글을 신고합니다.',
         tags: ['Report'],
         parameters: [
            {
               name: 'id',
               in: 'path',
               required: true,
               description: '신고할 댓글 ID',
               schema: { type: 'integer', example: 456 },
            },
         ],
         requestBody: {
            required: true,
            content: {
               'application/json': {
                  schema: {
                     type: 'object',
                     properties: {
                        user_id: { type: 'integer', example: 1, description: '신고하는 사용자 ID' },
                        reason: { type: 'string', example: '스팸/광고', description: '신고 사유' },
                     },
                  },
               },
            },
         },
         responses: {
            200: { description: '신고 접수 성공' },
            404: { description: '댓글을 찾을 수 없음' },
         },
      },
   },
}
