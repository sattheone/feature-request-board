const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

// Initialize Prisma with error handling
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Test database connection
async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
    return false;
  }
}

// Initialize server
const app = express();
console.log('Express app initialized');

app.use(cors());
app.use(express.json());
console.log('Middleware configured');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Enhanced logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
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

// Board endpoints with enhanced error handling
app.get('/api/boards', async (req, res) => {
  try {
    console.log('Fetching boards...');
    const boards = await prisma.board.findMany({
      include: { requests: true },
    });
    console.log(`Found ${boards.length} boards`);
    res.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

app.post('/api/boards', async (req, res) => {
  try {
    const { name, description } = req.body;
    console.log('Creating board:', { name, description });
    
    if (!name) {
      return res.status(400).json({ error: 'Board name is required' });
    }

    const board = await prisma.board.create({
      data: { name, description },
    });
    console.log('Board created successfully:', board);
    res.json(board);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
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

async function initializeDatabase() {
  try {
    // Create tables
    await prisma.exec(`
      CREATE TABLE IF NOT EXISTS boards (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        picture TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS requests (
        id TEXT PRIMARY KEY,
        board_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'open',
        priority TEXT DEFAULT 'medium',
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (board_id) REFERENCES boards(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        request_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES requests(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS upvotes (
        id TEXT PRIMARY KEY,
        request_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES requests(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(request_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS changelogs (
        id TEXT PRIMARY KEY,
        request_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES requests(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Start server function with retry logic
async function startServer() {
  let retries = 5;
  
  while (retries > 0) {
    try {
      const connected = await testConnection();
      if (!connected) {
        throw new Error('Database connection failed');
      }

      const server = app.listen(PORT, () => {
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

      // Handle server errors
      server.on('error', (error) => {
        console.error('Server error:', error);
        if (error.code === 'EADDRINUSE') {
          console.log('Port is in use, retrying...');
          retries--;
          setTimeout(startServer, 1000);
        }
      });

      return;
    } catch (error) {
      console.error(`Failed to start server (${retries} retries left):`, error);
      retries--;
      if (retries > 0) {
        console.log('Retrying in 1 second...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  console.error('Failed to start server after all retries');
  process.exit(1);
}

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  // Don't exit the process
});

// Start the server
startServer(); 