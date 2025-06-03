const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api';

async function testAPI() {
  try {
    // 1. Test Authentication
    console.log('\n1. Testing Authentication...');
    
    // Signup
    const signupResponse = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
        password: 'testpassword123'
      })
    });
    const signupData = await signupResponse.json();
    console.log('Signup response:', signupData);

    // Login
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
      })
    });
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    const token = loginData.token;

    // 2. Test Boards
    console.log('\n2. Testing Boards...');
    
    // Create board
    const boardResponse = await fetch(`${API_URL}/boards`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Board',
        description: 'A board for testing'
      })
    });
    const board = await boardResponse.json();
    console.log('Created board:', board);

    // Get all boards
    const boardsResponse = await fetch(`${API_URL}/boards`);
    const boards = await boardsResponse.json();
    console.log('All boards:', boards);

    // 3. Test Feature Requests
    console.log('\n3. Testing Feature Requests...');
    
    // Create feature request
    const requestResponse = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Add dark mode',
        description: 'Please add a dark mode option to the application',
        category: 'feature',
        boardId: board.id
      })
    });
    const request = await requestResponse.json();
    console.log('Created feature request:', request);

    // Get all feature requests
    const requestsResponse = await fetch(`${API_URL}/requests`);
    const requests = await requestsResponse.json();
    console.log('All feature requests:', requests);

    // Update feature request
    const updateResponse = await fetch(`${API_URL}/requests/${request.id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status: 'in_progress',
        title: 'Add dark mode (Updated)'
      })
    });
    const updatedRequest = await updateResponse.json();
    console.log('Updated feature request:', updatedRequest);

  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI(); 