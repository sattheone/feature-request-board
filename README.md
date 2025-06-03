# Feature Request Board

A web application for managing and tracking feature requests, built with React, Node.js, and Supabase.

## Features

- User authentication (signup/login)
- Create and manage boards
- Submit and track feature requests
- Comment on feature requests
- Upvote feature requests
- Admin dashboard for request management

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Express
- Database: Supabase (PostgreSQL)
- Authentication: JWT

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Environment Variables

Create `.env` files in both frontend and backend directories:

Frontend (.env):
```
REACT_APP_API_URL=your_backend_url
```

Backend (.env):
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
PORT=3000
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/feature-request-board.git
cd feature-request-board
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Start the development servers:

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

## Deployment

The application is deployed on:
- Frontend: Netlify
- Backend: Vercel
- Database: Supabase

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
