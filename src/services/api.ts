const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Auth
  setToken(token: string) {
    localStorage.setItem('token', token);
  },

  async login(email: string, name: string): Promise<ApiResponse<{ user: any; token: string }>> {
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return { data };
    } catch (error) {
      return { error: 'Failed to login' };
    }
  },

  // Boards
  async getBoards(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_URL}/boards`);
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: 'Failed to fetch boards' };
    }
  },

  // Feature Requests
  async getRequests(boardId?: string, status?: string, category?: string): Promise<ApiResponse<any[]>> {
    try {
      const params = new URLSearchParams();
      if (boardId) params.append('boardId', boardId);
      if (status) params.append('status', status);
      if (category) params.append('category', category);

      const response = await fetch(`${API_URL}/requests?${params}`);
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: 'Failed to fetch requests' };
    }
  },

  async createRequest(request: {
    title: string;
    description: string;
    category: string;
    boardId: string;
  }): Promise<ApiResponse<any>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      };

      const response = await fetch(`${API_URL}/requests`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: 'Failed to create request' };
    }
  },

  async updateRequest(
    id: string,
    updates: {
      status?: string;
      title?: string;
      description?: string;
      category?: string;
    }
  ): Promise<ApiResponse<any>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      };

      const response = await fetch(`${API_URL}/requests/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: 'Failed to update request' };
    }
  },

  // Comments
  async createComment(comment: { text: string; requestId: string }): Promise<ApiResponse<any>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      };

      const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(comment),
      });
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: 'Failed to create comment' };
    }
  },

  // Upvotes
  async toggleUpvote(requestId: string): Promise<ApiResponse<any>> {
    try {
      const headers: Record<string, string> = getAuthHeader();
      const response = await fetch(`${API_URL}/requests/${requestId}/upvote`, {
        method: 'POST',
        headers,
      });
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: 'Failed to toggle upvote' };
    }
  },

  // Changelogs
  async createChangelog(changelog: {
    title: string;
    content: string;
    requestId: string;
  }): Promise<ApiResponse<any>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      };

      const response = await fetch(`${API_URL}/changelogs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(changelog),
      });
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: 'Failed to create changelog' };
    }
  },
}; 