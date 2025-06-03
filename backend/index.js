require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    console.log('Signup attempt for:', { email, name });

    // Validate input
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();

    if (checkError) {
      console.error('Error checking existing user:', checkError);
    }

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Create user
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert([
        {
          email,
          name,
          password: hashedPassword,
          role: 'user'
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      throw createError;
    }

    console.log('User created successfully:', { id: user.id, email: user.email });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data (excluding password) and token
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Signup error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    res.status(500).json({ 
      error: 'Failed to create user',
      details: error.message 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data (excluding password) and token
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Board endpoints
app.get('/api/boards', async (req, res) => {
  try {
    const { data: boards, error } = await supabase
      .from('boards')
      .select(`
        *,
        requests (*)
      `);

    if (error) throw error;
    res.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

app.post('/api/boards', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    console.log('Creating board with:', { name, description, userId: req.user.id });
    
    if (!name) {
      return res.status(400).json({ error: 'Board name is required' });
    }

    const { data: board, error } = await supabase
      .from('boards')
      .insert([
        {
          name,
          description,
          created_by: req.user.id
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating board:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    console.log('Board created successfully:', board);
    res.json(board);
  } catch (error) {
    console.error('Board creation error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    res.status(500).json({ 
      error: 'Failed to create board',
      details: error.message 
    });
  }
});

// Feature Request endpoints
app.get('/api/requests', async (req, res) => {
  try {
    const { boardId, status, category } = req.query;
    let query = supabase
      .from('feature_requests')
      .select(`
        *,
        user:users (*),
        comments (
          *,
          user:users (*)
        ),
        changelogs (*),
        upvotes (*)
      `)
      .order('created_at', { ascending: false });

    if (boardId) query = query.eq('board_id', boardId);
    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);

    const { data: requests, error } = await query;

    if (error) throw error;
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch feature requests' });
  }
});

app.post('/api/requests', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, boardId } = req.body;
    
    if (!title || !boardId) {
      return res.status(400).json({ error: 'Title and board ID are required' });
    }

    const { data: request, error } = await supabase
      .from('feature_requests')
      .insert([
        {
          title,
          description,
          category,
          board_id: boardId,
          user_id: req.user.id,
          status: 'open'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.json(request);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create feature request' });
  }
});

app.patch('/api/requests/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, title, description, category } = req.body;

    // Check if request exists and user has permission
    const { data: existingRequest, error: fetchError } = await supabase
      .from('feature_requests')
      .select('*, user:users(*)')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!existingRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (req.user.role !== 'admin' && existingRequest.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data: updatedRequest, error: updateError } = await supabase
      .from('feature_requests')
      .update({
        status,
        title,
        description,
        category
      })
      .eq('id', id)
      .select(`
        *,
        user:users (*),
        comments (
          *,
          user:users (*)
        ),
        changelogs (*),
        upvotes (*)
      `)
      .single();

    if (updateError) throw updateError;
    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Failed to update feature request' });
  }
});

// Comment endpoints
app.post('/api/requests/:requestId/comments', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert([
        {
          text,
          request_id: requestId,
          user_id: req.user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Upvote endpoints
app.post('/api/requests/:requestId/upvotes', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;

    // Check if user already upvoted
    const { data: existingUpvote } = await supabase
      .from('upvotes')
      .select()
      .eq('request_id', requestId)
      .eq('user_id', req.user.id)
      .single();

    if (existingUpvote) {
      return res.status(400).json({ error: 'You have already upvoted this request' });
    }

    const { data: upvote, error } = await supabase
      .from('upvotes')
      .insert([
        {
          request_id: requestId,
          user_id: req.user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.json(upvote);
  } catch (error) {
    console.error('Error creating upvote:', error);
    res.status(500).json({ error: 'Failed to create upvote' });
  }
});

app.delete('/api/requests/:requestId/upvotes', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;

    const { error } = await supabase
      .from('upvotes')
      .delete()
      .eq('request_id', requestId)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Upvote removed successfully' });
  } catch (error) {
    console.error('Error removing upvote:', error);
    res.status(500).json({ error: 'Failed to remove upvote' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 