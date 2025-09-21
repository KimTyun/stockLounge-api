module.exports = {
   '/board/{id}/comment': {
      post: {
         summary: '댓글 등록',
         description: '특정 게시글에 댓글을 작성합니다.',
         tags: ['Board'],
         parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
         requestBody: {
            required: true,
            content: {
               'application/json': {
                  schema: {
                     type: 'object',
                     properties: {
                        content: { type: 'string', example: '좋은 글이네요!' },
                        user_id: { type: 'integer', example: 5 },
                     },
                  },
               },
            },
         },
         responses: {
            201: { description: '댓글 등록 성공' },
            404: { description: '게시글 없음' },
         },
      },
   },
   '/board/{id}/comments': {
      get: {
         summary: '댓글 목록 조회',
         description: '특정 게시글의 댓글 목록을 조회합니다.',
         tags: ['Board'],
         parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
         responses: {
            200: { description: '조회 성공' },
            404: { description: '게시글 없음' },
         },
      },
   },
   '/board/{boardId}/comment/{commentId}': {
      delete: {
         summary: '댓글 삭제',
         description: '특정 댓글을 삭제합니다.',
         tags: ['Board'],
         parameters: [
            { name: 'boardId', in: 'path', required: true, schema: { type: 'integer', example: 1 } },
            { name: 'commentId', in: 'path', required: true, schema: { type: 'integer', example: 10 } },
         ],
         responses: {
            200: { description: '댓글 삭제 성공' },
            404: { description: '댓글 없음' },
         },
      },
   },
   '/board': {
      get: {
         summary: '게시글 리스트 조회',
         description: '게시글 목록을 최신순으로 조회합니다. 카테고리별 조회도 가능합니다.',
         tags: ['Board'],
         parameters: [
            {
               name: 'category',
               in: 'query',
               required: false,
               description: '카테고리명 (예: free, bitcoin, ethereum)',
               schema: { type: 'string', example: 'free' },
            },
         ],
         responses: {
            200: { description: '조회 성공' },
         },
      },
   },
   '/board/write': {
      post: {
         summary: '게시글 등록',
         description: '새로운 게시글을 작성합니다. 이미지 파일 업로드 가능.',
         tags: ['Board'],
         requestBody: {
            required: true,
            content: {
               'multipart/form-data': {
                  schema: {
                     type: 'object',
                     properties: {
                        title: { type: 'string', example: '비트코인 분석' },
                        content: { type: 'string', example: '오늘은 상승장이 예상됩니다.' },
                        category: { type: 'string', example: 'bitcoin' },
                        user_id: { type: 'integer', example: 1 },
                        file: { type: 'string', format: 'binary' },
                     },
                  },
               },
            },
         },
         responses: {
            201: { description: '게시글 등록 성공' },
         },
      },
   },
   '/board/{id}': {
      get: {
         summary: '특정 게시글 조회',
         description: '게시글 상세 내용을 조회합니다.',
         tags: ['Board'],
         parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
         responses: {
            200: { description: '조회 성공' },
            404: { description: '게시글 없음' },
         },
      },
      delete: {
         summary: '게시글 삭제',
         description: '특정 게시글을 삭제합니다.',
         tags: ['Board'],
         parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
         responses: {
            200: { description: '삭제 성공' },
            404: { description: '게시글 없음' },
         },
      },
      put: {
         summary: '게시글 수정',
         description: '특정 게시글을 수정합니다. 이미지 교체 가능.',
         tags: ['Board'],
         parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
         requestBody: {
            required: true,
            content: {
               'multipart/form-data': {
                  schema: {
                     type: 'object',
                     properties: {
                        title: { type: 'string', example: '수정된 제목' },
                        content: { type: 'string', example: '수정된 내용' },
                        category: { type: 'string', example: 'news' },
                        file: { type: 'string', format: 'binary' },
                     },
                  },
               },
            },
         },
         responses: {
            200: { description: '수정 성공' },
            404: { description: '게시글 없음' },
         },
      },
   },
   '/board/{id}/like': {
      post: {
         summary: '게시글 좋아요/취소',
         description: '특정 게시글에 좋아요를 누르거나 취소합니다.',
         tags: ['Board'],
         parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
         requestBody: {
            required: true,
            content: {
               'application/json': {
                  schema: {
                     type: 'object',
                     properties: {
                        user_id: { type: 'integer', example: 2 },
                     },
                  },
               },
            },
         },
         responses: {
            200: { description: '좋아요 상태 변경 성공' },
            404: { description: '게시글 없음' },
         },
      },
   },
   '/board/comment/{commentId}/like': {
      post: {
         summary: '댓글 좋아요/취소',
         description: '특정 댓글에 좋아요를 누르거나 취소합니다.',
         tags: ['Board'],
         parameters: [{ name: 'commentId', in: 'path', required: true, schema: { type: 'integer', example: 10 } }],
         requestBody: {
            required: true,
            content: {
               'application/json': {
                  schema: {
                     type: 'object',
                     properties: {
                        user_id: { type: 'integer', example: 2 },
                     },
                  },
               },
            },
         },
         responses: {
            200: { description: '좋아요 상태 변경 성공' },
            404: { description: '댓글 없음' },
         },
      },
   },
}
