const express = require("express");
const multer = require("multer");
const path = require("path");
const { Board, Comment, Category } = require("../models");
const { Sequelize } = require("sequelize");
const fs = require("fs");
require("dotenv").config();
const router = express.Router();

// 댓글 등록
router.post("/:id/comment", async (req, res, next) => {
  try {
    const boardId = req.params.id;
    const { content, user_id, parent_id } = req.body;

    // 게시글이 존재하는지 확인
    const board = await Board.findByPk(boardId);
    if (!board) {
      const error = new Error("게시글을 찾을 수 없습니다.");
      error.status = 404;
      return next(error);
    }

    // 댓글 생성
    const comment = await Comment.create({
      content,
      user_id,
      board_id: boardId,
      parent_id: parent_id || null,
    });

    res.status(201).json({
      success: true,
      message: "댓글이 등록되었습니다.",
      data: comment,
    });
  } catch (error) {
    next(error);
  }
});

// 댓글 목록 조회
router.get("/:id/comments", async (req, res, next) => {
  try {
    const boardId = req.params.id;

    // 게시글이 존재하는지 확인
    const board = await Board.findByPk(boardId);
    if (!board) {
      const error = new Error("게시글을 찾을 수 없습니다.");
      error.status = 404;
      return next(error);
    }

    // 댓글 목록 조회
    const comments = await Comment.findAll({
      where: { board_id: boardId },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
});

// 댓글 삭제
router.delete("/:boardId/comment/:commentId", async (req, res, next) => {
  try {
    const { boardId, commentId } = req.params;

    // 댓글이 존재하는지 확인
    const comment = await Comment.findOne({
      where: {
        id: commentId,
        board_id: boardId,
      },
    });

    if (!comment) {
      const error = new Error("댓글을 찾을 수 없습니다.");
      error.status = 404;
      return next(error);
    }

    // 댓글 삭제
    await comment.destroy();

    res.json({
      success: true,
      message: "댓글이 삭제되었습니다.",
    });
  } catch (error) {
    next(error);
  }
});

// uploads 폴더가 없을 경우 새로 생성
try {
  fs.readdirSync("uploads"); //해당 폴더가 있는지 확인
} catch (error) {
  console.log("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads"); //폴더 생성
}

// 이미지 업로드를 위한 multer 설정
const upload = multer({
  // 저장할 위치와 파일명 지정
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/"); // uploads폴더에 저장
    },
    filename(req, file, cb) {
      const decodedFileName = decodeURIComponent(file.originalname); //파일명 디코딩(한글 파일명 깨짐 방지)
      const ext = path.extname(decodedFileName); //확장자 추출
      const basename = path.basename(decodedFileName, ext); //확장자 제거한 파일명 추출

      // 파일명 설정: 기존이름 + 업로드 날짜시간 + 확장자
      cb(null, basename + Date.now() + ext);
    },
  }),
  // 파일의 크기 제한
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB로 제한
    fieldSize: 2 * 1024 * 1024, // 2MB text field 제한
  },
});

// 게시판 리스트 조회
router.get("/", async (req, res, next) => {
  try {
    const boards = await Board.findAll({
      attributes: [
        "id",
        "user_id",
        "title",
        "content",
        "category",
        "like_count",
        "report_count",
        "board_img",
        "view_count",
        "created_at",
        "updated_at",
      ],
      where: {
        deleted_at: null,
      },
      order: [["created_at", "DESC"]],
    });

    // 각 게시글의 댓글 수를 별도로 조회
    const boardsWithComments = await Promise.all(
      boards.map(async (board) => {
        const commentCount = await Comment.count({
          where: { board_id: board.id },
        });
        const boardJson = board.toJSON();
        return {
          ...boardJson,
          comment_count: commentCount,
        };
      })
    );

    res.json({
      success: true,
      data: boardsWithComments,
    });
  } catch (error) {
    next(error);
  }
});

// 게시글 등록
router.post("/write", upload.single("file"), async (req, res, next) => {
  try {
    const { title, content, category } = req.body;

    // 카테고리 가져오기 또는 생성
    const [categoryRecord, created] = await Category.findOrCreate({
      where: { category },
      defaults: { category },
    });

    const newBoard = await Board.create({
      title,
      content,
      category: categoryRecord.id,
      // 이미지 파일이 있으면 파일명 저장
      board_img: req.file ? req.file.filename : null,
    });

    res.status(201).json({
      success: true,
      message: "게시글 등록 성공!",
      data: newBoard,
      // 새로 생성되는지 여부 확인
      findCategory: created,
    });
  } catch (error) {
    next(error);
  }
});

// 특정 게시글 가져오기
router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;

    const board = await Board.findOne({
      where: { id },
    });

    if (!board) {
      const error = new Error("해당 게시글을 찾을 수 없습니다.");
      error.status = 404;
      return next(error);
    }

    res.json({
      success: true,
      message: "게시글 조회 성공",
      data: board,
    });
  } catch (error) {
    next(error);
  }
});

// 게시글 삭제
router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;

    // 게시글이 존재하는지 확인
    const board = await Board.findByPk(id);
    if (!board) {
      const error = new Error("게시글을 찾을 수 없습니다.");
      error.status = 404;
      return next(error);
    }

    // 게시글 삭제
    await board.destroy();

    res.json({
      success: true,
      message: "게시글이 삭제되었습니다.",
    });
  } catch (error) {
    next(error);
  }
});

// 게시글 수정
router.put("/:id", upload.single("file"), async (req, res, next) => {
  try {
    const id = req.params.id;
    const { title, content, category } = req.body;

    // 게시글이 존재하는지 확인
    const board = await Board.findByPk(id);
    if (!board) {
      const error = new Error("게시글을 찾을 수 없습니다.");
      error.status = 404;
      return next(error);
    }

    const updateData = {
      title,
      content,
      category,
    };

    // 파일이 있으면 기존 파일 삭제 후 새 파일 저장
    if (req.file) {
      if (board.board_img) {
        const oldPath = path.join(__dirname, "..", "uploads", board.board_img);
        fs.unlink(oldPath, (err) => {
          if (err) {
            console.error("기존 이미지 삭제 실패:", err);
          } else {
            console.log("기존 이미지 삭제 성공:", board.board_img);
          }
        });
      }

      updateData.board_img = req.file.filename;
    }

    // DB 업데이트
    await board.update(updateData);

    res.json({
      success: true,
      message: "게시글이 수정되었습니다.",
      data: board,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
