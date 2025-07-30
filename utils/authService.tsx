import { projectId, publicAnonKey } from './supabase/info';

export interface User {
  id: string;
  username: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  access_token?: string;
  error?: string;
}

export interface ScoreData {
  score: number;
  table: number;
  totalTime: number;
}

export interface GameScore {
  id: string;
  user_id: string;
  username: string;
  score: number;
  table: number;
  total_time: number;
  date: string;
}

export class AuthService {
  private static accessToken: string | null = null;
  private static currentUser: User | null = null;

  // Kullanıcı kaydı
  static async signup(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dde4baf5/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Kayıt başarısız' };
      }

      // Otomatik giriş yap
      return await this.signin(username, password);

    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Bağlantı hatası' };
    }
  }

  // Kullanıcı girişi
  static async signin(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dde4baf5/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Giriş başarısız' };
      }

      // Token ve kullanıcı bilgilerini sakla
      this.accessToken = data.access_token;
      this.currentUser = data.user;
      
      // Local storage'a kaydet
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('current_user', JSON.stringify(data.user));

      return { success: true, user: data.user, access_token: data.access_token };

    } catch (error) {
      console.error('Signin error:', error);
      return { success: false, error: 'Bağlantı hatası' };
    }
  }

  // Çıkış
  static async logout(): Promise<void> {
    this.accessToken = null;
    this.currentUser = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
  }

  // Mevcut kullanıcıyı al
  static getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;
    
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        return this.currentUser;
      } catch {
        return null;
      }
    }
    
    return null;
  }

  // Access token'ı al
  static getAccessToken(): string | null {
    if (this.accessToken) return this.accessToken;
    
    const savedToken = localStorage.getItem('access_token');
    if (savedToken) {
      this.accessToken = savedToken;
      return savedToken;
    }
    
    return null;
  }

  // Oturum kontrolü
  static async checkSession(): Promise<boolean> {
    try {
      const token = this.getAccessToken();
      if (!token) return false;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dde4baf5/check-session`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.valid && data.user) {
        this.currentUser = data.user;
        localStorage.setItem('current_user', JSON.stringify(data.user));
        return true;
      } else {
        // Geçersiz oturum, temizle
        await this.logout();
        return false;
      }

    } catch (error) {
      console.error('Session check error:', error);
      await this.logout();
      return false;
    }
  }

  // Skor kaydetme
  static async saveScore(scoreData: ScoreData): Promise<boolean> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        console.error('Token bulunamadı');
        return false;
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dde4baf5/save-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scoreData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Score save error:', data.error);
        return false;
      }

      return data.success;

    } catch (error) {
      console.error('Save score error:', error);
      return false;
    }
  }

  // Skorları getirme
  static async getScores(difficulty: string = 'all'): Promise<GameScore[]> {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dde4baf5/scores?difficulty=${difficulty}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Get scores error:', data.error);
        return [];
      }

      return data.scores || [];

    } catch (error) {
      console.error('Get scores error:', error);
      return [];
    }
  }

  // Kullanıcı giriş yapıp yapmadığını kontrol et
  static isLoggedIn(): boolean {
    return this.getCurrentUser() !== null && this.getAccessToken() !== null;
  }

  // Hesap silme
  static async deleteAccount(): Promise<AuthResponse> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        return { success: false, error: 'Oturum bulunamadı' };
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dde4baf5/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Hesap silinirken hata oluştu' };
      }

      // Oturumu temizle
      await this.logout();

      return { success: true };

    } catch (error) {
      console.error('Delete account error:', error);
      return { success: false, error: 'Bağlantı hatası' };
    }
  }
}