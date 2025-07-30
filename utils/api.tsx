import { projectId, publicAnonKey } from './supabase/info';

export class MultiplicationGameAPI {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-dde4baf5`;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    };
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Kullanıcı kaydı
  async register(username: string, password: string) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  // Kullanıcı girişi
  async login(username: string, password: string) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  // Kullanıcı adı kontrol
  async checkUsername(username: string) {
    return this.makeRequest(`/auth/check-username/${encodeURIComponent(username)}`);
  }

  // Skor kaydet
  async saveScore(score: number, table: number, totalTime: number, accessToken: string) {
    return this.makeRequest('/scores/save', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ score, table, totalTime })
    });
  }

  // Skorları getir (kategori bazlı)
  async getScores(category: 'all' | 'easy' | 'medium' | 'hard' = 'all') {
    return this.makeRequest(`/scores/${category}`);
  }

  // Kullanıcının skorlarını getir
  async getUserScores(userId: string, accessToken: string) {
    return this.makeRequest(`/scores/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }

  // Test bağlantı
  async testConnection() {
    return this.makeRequest('/test');
  }
}

export const gameAPI = new MultiplicationGameAPI();