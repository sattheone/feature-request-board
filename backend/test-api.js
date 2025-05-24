const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api';

async function testAPI() {
  try {
    // 1. Create admin user
    const adminResponse = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin'
      })
    });
    const admin = await adminResponse.json();
    console.log('Created admin user:', admin);

    // 2. Create feedback
    const feedbackResponse = await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Add dark mode',
        description: 'Please add a dark mode option to the application',
        category: 'feature',
        userId: admin.id
      })
    });
    const feedback = await feedbackResponse.json();
    console.log('Created feedback:', feedback);

    // 3. Add comment
    const commentResponse = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'This would be a great addition!',
        userId: admin.id,
        feedbackId: feedback.id
      })
    });
    const comment = await commentResponse.json();
    console.log('Created comment:', comment);

    // 4. Add changelog
    const changelogResponse = await fetch(`${API_URL}/changelogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Dark mode implementation started',
        content: 'We have started working on the dark mode feature',
        feedbackId: feedback.id
      })
    });
    const changelog = await changelogResponse.json();
    console.log('Created changelog:', changelog);

    // 5. Get all feedback with relations
    const allFeedbackResponse = await fetch(`${API_URL}/feedback`);
    const allFeedback = await allFeedbackResponse.json();
    console.log('All feedback:', JSON.stringify(allFeedback, null, 2));

  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI(); 