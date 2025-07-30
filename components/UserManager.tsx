export class UserManager {
  private static readonly USERS_KEY = 'registeredUsers';
  private static readonly CURRENT_USER_KEY = 'currentUser';

  // Kayıtlı kullanıcıları getir
  static getRegisteredUsers(): string[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  // Kullanıcı kaydet
  static registerUser(username: string): boolean {
    const users = this.getRegisteredUsers();
    const normalizedUsername = username.toLowerCase().trim();
    
    // Kullanıcı zaten kayıtlı mı kontrol et
    const userExists = users.some(user => user.toLowerCase() === normalizedUsername);
    
    if (userExists) {
      return false; // Kullanıcı zaten mevcut
    }
    
    users.push(username.trim());
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    this.setCurrentUser(username.trim());
    return true;
  }

  // Mevcut kullanıcıyı ayarla
  static setCurrentUser(username: string): void {
    localStorage.setItem(this.CURRENT_USER_KEY, username);
  }

  // Mevcut kullanıcıyı getir
  static getCurrentUser(): string | null {
    return localStorage.getItem(this.CURRENT_USER_KEY);
  }

  // Kullanıcı çıkışı
  static logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  // Kullanıcı adı mevcut mu kontrol et
  static isUsernameTaken(username: string): boolean {
    const users = this.getRegisteredUsers();
    const normalizedUsername = username.toLowerCase().trim();
    return users.some(user => user.toLowerCase() === normalizedUsername);
  }

  // Tüm kullanıcıları sil (geliştirme için)
  static clearAllUsers(): void {
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  // Kullanıcı kayıtlı mı kontrol et
  static isUserRegistered(username: string): boolean {
    const users = this.getRegisteredUsers();
    const normalizedUsername = username.toLowerCase().trim();
    return users.some(user => user.toLowerCase() === normalizedUsername);
  }
}