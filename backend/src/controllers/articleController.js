const { Article, ArticleRevision } = require('../../models');
const axios = require('axios');

const generateSummary = async (content) => {
  const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    contents: [
      {
        parts: [
          {
            text: `
            Summarize the following content concisely while retaining key information. Focus on the main ideas, critical details, and actionable insights. Avoid unnecessary examples or repetitive points. Keep the summary clear, structured, and easy to understand. If the content is technical, ensure accuracy; if it's narrative, capture the essence. 

            ## Content to summarize:
            ${content}`
          }
        ]
      }
    ]
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const summary = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!summary) throw new Error('No summary returned from Gemini');
  return summary;
};

const createArticle = async (req, res) => {
  try {
    const article = await Article.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getArticleSummary = async (req, res) => {
  try {

    const { id } = req.params;

    const whereClause = req.user.role === 'admin'
      ? { id }
      : { id, createdBy: req.user.id };

    const article = await Article.findOne({
      where: whereClause,
      attributes: ['id', 'title', 'content', 'summary', 'createdAt']
    });

    if (!article) return res.status(404).json({ error: 'Article not found' });

    if (!article.summary) {
      const aiSummary = await generateSummary(article.content);
      console.log(aiSummary, "summary");
      await article.update({ summary: aiSummary });
    }

    res.json(article.summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const whereClause = req.user.role === 'admin'
      ? { id }
      : { id, createdBy: req.user.id };

    const article = await Article.findOne({
      where: whereClause,
      attributes: ['id', 'title', 'content', 'summary', 'createdAt']
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found or you are not authorized to view it'
      });
    }

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getRevisionDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await ArticleRevision.findOne({
      where: {
        id: id
      },
      attributes: ['id', 'title', 'content', 'createdAt']
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found or you are not authorized to view it'
      });
    }

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getListArticles = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    const whereClause = req.user.role === 'admin'
      ? {}
      : { createdBy: req.user.id };

    const articles = await Article.findAll({
      attributes: ['id', 'title'],
      where: whereClause,
      limit: parseInt(pageSize),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    const totalCount = await Article.count({
      where: {
        createdBy: req.user.id
      }
    });

    res.json({
      success: true,
      data: articles,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateArticle = async (req, res) => {
  try {

    const { id } = req.params;

    const whereClause = req.user.role === 'admin'
      ? { id }
      : { id, createdBy: req.user.id };

    const article = await Article.findOne({
      where: whereClause,
      attributes: ['id', 'title', 'content', 'summary', 'createdAt']
    });

    if (!article) return res.status(404).json({ error: 'Article not found' });

    await ArticleRevision.create({
      title: article.title,
      content: article.content,
      articleId: article.id,
      summary: ''
    });

    await article.update({ title: req.body.title, content: req.body.content });

    res.json({ message: 'Article updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getArticleRevisions = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const revisions = await ArticleRevision.findAll({
      attributes: ['id', 'createdAt'],
      where: {
        articleId: id
      },
      limit: pageSize,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const totalCount = await ArticleRevision.count({
      where: {
        articleId: id
      }
    });

    res.json({
      success: true,
      data: revisions,
      pagination: {
        page,
        pageSize,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching article revisions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


module.exports = {
  createArticle,
  getArticleSummary,
  updateArticle,
  getListArticles,
  getArticleById,
  getRevisionDetail,
  getArticleRevisions
};