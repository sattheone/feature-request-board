const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('./generated/prisma');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth endpoints
app.post('/api/auth/google', async (req, res) => {
  const { email, name } = req.body;
  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name, role: 'user' },
      });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Board endpoints
app.get('/api/boards', async (req, res) => {
  const boards = await prisma.board.findMany({
    include: { requests: true },
  });
  res.json(boards);
});

app.post('/api/boards', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const { name, description } = req.body;
  const board = await prisma.board.create({
    data: { name, description },
  });
  res.json(board);
});

// Feature Request endpoints
app.get('/api/requests', async (req, res) => {
  const { boardId, status, category } = req.query;
  const where = {};
  if (boardId) where.boardId = boardId;
  if (status) where.status = status;
  if (category) where.category = category;

  const requests = await prisma.featureRequest.findMany({
    where,
    include: {
      user: true,
      comments: { include: { user: true } },
      changelogs: true,
      upvotes: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(requests);
});

app.post('/api/requests', authenticateToken, async (req, res) => {
  const { title, description, category, boardId } = req.body;
  const request = await prisma.featureRequest.create({
    data: {
      title,
      description,
      category,
      boardId,
      userId: req.user.id,
      status: 'open',
    },
    include: {
      user: true,
      comments: true,
      changelogs: true,
      upvotes: true,
    },
  });
  res.json(request);
});

app.patch('/api/requests/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status, title, description, category } = req.body;
  
  const request = await prisma.featureRequest.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  if (req.user.role !== 'admin' && request.userId !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const updated = await prisma.featureRequest.update({
    where: { id },
    data: { status, title, description, category },
    include: {
      user: true,
      comments: { include: { user: true } },
      changelogs: true,
      upvotes: true,
    },
  });
  res.json(updated);
});

// Comment endpoints
app.post('/api/comments', authenticateToken, async (req, res) => {
  const { text, requestId } = req.body;
  const comment = await prisma.comment.create({
    data: {
      text,
      requestId,
      userId: req.user.id,
    },
    include: { user: true },
  });
  res.json(comment);
});

// Upvote endpoints
app.post('/api/requests/:id/upvote', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const upvote = await prisma.upvote.create({
      data: {
        userId: req.user.id,
        requestId: id,
      },
    });
    res.json(upvote);
  } catch (error) {
    if (error.code === 'P2002') {
      // Unique constraint violation - user already upvoted
      await prisma.upvote.delete({
        where: {
          userId_requestId: {
            userId: req.user.id,
            requestId: id,
          },
        },
      });
      res.json({ message: 'Upvote removed' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Changelog endpoints
app.post('/api/changelogs', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const { title, content, requestId } = req.body;
  const changelog = await prisma.changelog.create({
    data: { title, content, requestId },
  });
  res.json(changelog);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- POST /api/auth/google');
  console.log('- GET /api/boards');
  console.log('- POST /api/boards');
  console.log('- GET /api/requests');
  console.log('- POST /api/requests');
  console.log('- PATCH /api/requests/:id');
  console.log('- POST /api/comments');
  console.log('- POST /api/requests/:id/upvote');
  console.log('- POST /api/changelogs');
}); 