const express = require('express');

const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { createArticle, getArticleSummary, updateArticle, getListArticles, getArticleById, getArticleRevisions, getRevisionDetail } = require('../controllers/articleController');

router.use(authMiddleware);

router.post('/create', createArticle);
router.get('/get-summary/:id', getArticleSummary);
router.get('/detail/:id', getArticleById);
router.get('/revision/:id', getRevisionDetail);
router.get('/list', getListArticles);
router.put('/update/:id', updateArticle);
router.get('/history/:id', getArticleRevisions);

module.exports = router;    