interface User {
  id: string;
  username: string;
  accessToken: string;
}

export class AuthManager {
  private static readonly USER_KEY = "currentGameUser";
  private static readonly TOKEN_KEY = "gameAccessToken";

  // Kullanıcıyı kaydet
  static setUser(user: User): void {
    localStorage.setItem(
      this.USER_KEY,
      JSON.stringify({
        id: user.id,
        username: user.username,
      }),
    );
    localStorage.setItem(this.TOKEN_KEY, user.accessToken);
  }

  // Mevcut kullanıcıyı getir
  static getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      const token = localStorage.getItem(this.TOKEN_KEY);

      if (!userStr || !token) return null;

      const userData = JSON.parse(userStr);
      return {
        ...userData,
        accessToken: token,
      };
    } catch {
      return null;
    }
  }

  // Kullanıcı çıkışı
  static logout(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // Token'ı getir
  static getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Kullanıcı giriş yapmış mı
  static isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Kullanıcı ID'sini getir
  static getUserId(): string | null {
    const user = this.getCurrentUser();
    return user?.id || null;
  }

  // Kullanıcı adını getir
  static getUsername(): string | null {
    const user = this.getCurrentUser();
    return user?.username || null;
  }
}