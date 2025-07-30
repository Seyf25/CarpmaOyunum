import { useState, useEffect } from "react";
import { GameScreen } from "./components/GameScreen";
import { MultiplicationTableSelector } from "./components/MultiplicationTableSelector";
import { ScoreBoard } from "./components/ScoreBoard";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Separator } from "./components/ui/separator";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Slider } from "./components/ui/slider";
import { audioManager } from "./components/AudioManager";
import { AuthService } from "./utils/authService";
import { DIFFICULTY_LEVELS } from "./utils/difficultyLevels";

type GameState =
  | "menu"
  | "login"
  | "signup" 
  | "accountManagement"
  | "tableSelection"
  | "playing"
  | "gameOver"
  | "scoreBoard";

interface ValidationErrors {
  username?: string;
  password?: string;
  confirmPassword?: string;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [playerName, setPlayerName] = useState("");
  const [selectedTable, setSelectedTable] = useState(2);
  const [finalScore, setFinalScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Auth form states
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Account management states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Ses durumlarını ve oturumu başlangıçta kontrol et
  useEffect(() => {
    const initializeApp = async () => {
      setIsSoundMuted(audioManager.getSoundMuteStatus());
      setIsMusicMuted(audioManager.getMusicMuteStatus());
      setMusicVolume(audioManager.getMusicVolume());

      // Mevcut oturumu kontrol et
      const isValidSession = await AuthService.checkSession();
      if (isValidSession) {
        const user = AuthService.getCurrentUser();
        if (user) {
          setPlayerName(user.username);
        }
      }

      setIsCheckingSession(false);
    };

    initializeApp();
  }, []);

  const clearAuthForm = () => {
    setAuthUsername("");
    setAuthPassword("");
    setConfirmPassword("");
    setAuthError("");
    setAuthSuccess("");
    setValidationErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowDeleteConfirm(false);
  };

  const validateUsername = (username: string): string | undefined => {
    if (!username.trim()) {
      return "Kullanıcı adı gereklidir";
    }
    if (username.length < 3) {
      return "Kullanıcı adı en az 3 karakter olmalıdır";
    }
    if (username.length > 20) {
      return "Kullanıcı adı en fazla 20 karakter olabilir";
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return "Kullanıcı adı sadece harf, rakam, _ ve - içerebilir";
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return "Şifre gereklidir";
    }
    if (password.length < 4) {
      return "Şifre en az 4 karakter olmalıdır";
    }
    if (password.length > 50) {
      return "Şifre en fazla 50 karakter olabilir";
    }
    return undefined;
  };

  const validateForm = (isSignup: boolean = false) => {
    const errors: ValidationErrors = {};
    
    const usernameError = validateUsername(authUsername);
    if (usernameError) errors.username = usernameError;
    
    const passwordError = validatePassword(authPassword);
    if (passwordError) errors.password = passwordError;
    
    if (isSignup) {
      if (!confirmPassword) {
        errors.confirmPassword = "Şifre doğrulaması gereklidir";
      } else if (authPassword !== confirmPassword) {
        errors.confirmPassword = "Şifreler eşleşmiyor";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const startNewGame = () => {
    audioManager.playClick();

    // Kullanıcı giriş yapmış mı kontrol et
    const user = AuthService.getCurrentUser();
    if (user) {
      setPlayerName(user.username);
      setGameState("tableSelection");
    } else {
      setGameState("login");
    }
  };

  const showSignupScreen = () => {
    audioManager.playClick();
    clearAuthForm();
    setGameState("signup");
  };

  const showLoginScreen = () => {
    audioManager.playClick();
    clearAuthForm();
    setGameState("login");
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const result = await AuthService.signin(authUsername.trim(), authPassword);

      if (result.success && result.user) {
        setPlayerName(result.user.username);
        setAuthSuccess("Giriş başarılı! Oyuna yönlendiriliyorsunuz...");
        
        setTimeout(() => {
          clearAuthForm();
          setGameState("tableSelection");
          audioManager.playGameStart();
        }, 1500);
      } else {
        setAuthError(result.error || "Bilinmeyen hata oluştu");
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
    }

    setAuthLoading(false);
  };

  const handleSignup = async () => {
    if (!validateForm(true)) return;

    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const result = await AuthService.signup(authUsername.trim(), authPassword);

      if (result.success && result.user) {
        setAuthSuccess("Kayıt başarılı! Hoş geldiniz " + result.user.username + "!");
        
        setTimeout(() => {
          setPlayerName(result.user.username);
          clearAuthForm();
          setGameState("tableSelection");
          audioManager.playGameStart();
        }, 2000);
      } else {
        setAuthError(result.error || "Bilinmeyen hata oluştu");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setAuthError("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
    }

    setAuthLoading(false);
  };

  const handleAuthKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (gameState === "login") {
        handleLogin();
      } else if (gameState === "signup") {
        handleSignup();
      }
    }
  };

  const handleTableSelect = (table: number) => {
    setSelectedTable(table);
    setGameState("playing");
  };

  const handleGameEnd = (score: number, totalTime: number) => {
    setFinalScore(score);
    setGameTime(totalTime);
    setGameState("gameOver");
  };

  const backToMenu = () => {
    audioManager.playClick();
    setGameState("menu");
    clearAuthForm();
  };

  const showScoreBoard = () => {
    audioManager.playClick();
    setGameState("scoreBoard");
  };

  const toggleSound = () => {
    const newMuteStatus = audioManager.toggleSound();
    setIsSoundMuted(newMuteStatus);
  };

  const toggleMusic = () => {
    const newMuteStatus = audioManager.toggleMusic();
    setIsMusicMuted(newMuteStatus);
  };

  const handleMusicVolumeChange = (newVolume: number) => {
    audioManager.setMusicVolume(newVolume);
    setMusicVolume(newVolume);
  };

  const logout = async () => {
    await AuthService.logout();
    setPlayerName("");
    audioManager.playClick();
  };

  const showAccountManagement = () => {
    audioManager.playClick();
    setGameState("accountManagement");
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setDeleteLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const result = await AuthService.deleteAccount();

      if (result.success) {
        setAuthSuccess("Hesabınız başarıyla silindi. Ana menüye yönlendiriliyorsunuz...");
        setPlayerName("");
        
        setTimeout(() => {
          setGameState("menu");
          clearAuthForm();
          setShowDeleteConfirm(false);
        }, 2000);
      } else {
        setAuthError(result.error || "Hesap silinirken hata oluştu");
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error("Delete account error:", error);
      setAuthError("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
      setShowDeleteConfirm(false);
    }

    setDeleteLoading(false);
  };

  const getScoreEmoji = (score: number) => {
    if (score === 10) return "🏆";
    if (score >= 8) return "🌟";
    if (score >= 6) return "👍";
    if (score >= 4) return "💪";
    return "📚";
  };

  const getSeyfullahFeedback = (score: number) => {
    if (score === 10) {
      return {
        message: "Seyfullah öğretmen seni tebrik ediyor!",
        detail:
          "Mükemmel bir performans sergiledim! Çarpım tablosu ustası oldun! 🎉",
        color: "from-yellow-50 to-amber-50 border-yellow-300",
      };
    }
    if (score >= 8) {
      return {
        message: "Seyfullah öğretmen çok memnun!",
        detail:
          "Harika bir iş çıkardın! Çok az hata yaptın, tebrikler! 🌟",
        color: "from-green-50 to-emerald-50 border-green-300",
      };
    }
    if (score >= 6) {
      return {
        message: "Seyfullah öğretmen: İyi gidiyorsun!",
        detail:
          "Güzel bir başlangıç! Biraz daha pratik yaparak mükemmel olabilirsin! 👍",
        color: "from-blue-50 to-sky-50 border-blue-300",
      };
    }
    if (score >= 4) {
      return {
        message: "Seyfullah öğretmen: Devam et!",
        detail:
          "Çabaların görülüyor! Daha fazla pratik yaparak gelişebilirsin! 💪",
        color: "from-purple-50 to-indigo-50 border-purple-300",
      };
    }
    return {
      message:
        "Seyfullah öğretmen biraz daha çalışmanı istiyor!",
      detail:
        "Endişelenme! Her büyük matematikçi böyle başladı. Tekrar dene! 📚",
      color: "from-orange-50 to-red-50 border-orange-300",
    };
  };

  // Uygulama başlatılıyor ekranı
  if (isCheckingSession) {
    return (
      <div className="size-full bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-400 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-4 border-white/20 backdrop-blur-sm bg-white/10">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
            <p className="text-white text-xl font-semibold">
              Uygulama başlatılıyor...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Login ekranı
  if (gameState === "login") {
    return (
      <div className="size-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-400 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-4 border-white/20 backdrop-blur-sm bg-white/10">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center">
              🔐 Giriş Yap
            </CardTitle>
            <p className="text-blue-100 text-center">
              Hesabınıza giriş yaparak oyuna devam edin
            </p>
          </CardHeader>
          <CardContent className="p-6 bg-white rounded-b-lg">
            <div className="space-y-4">
              {/* Başarı mesajı */}
              {authSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">
                    ✅ {authSuccess}
                  </AlertDescription>
                </Alert>
              )}

              {/* Hata mesajı */}
              {authError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    ❌ {authError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Kullanıcı Adı</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Kullanıcı adınızı girin"
                  value={authUsername}
                  onChange={(e) => {
                    setAuthUsername(e.target.value);
                    if (validationErrors.username) {
                      setValidationErrors({...validationErrors, username: undefined});
                    }
                  }}
                  onKeyPress={handleAuthKeyPress}
                  disabled={authLoading}
                  className={validationErrors.username ? "border-red-300 focus:border-red-500" : ""}
                />
                {validationErrors.username && (
                  <p className="text-sm text-red-600">⚠️ {validationErrors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Şifrenizi girin"
                    value={authPassword}
                    onChange={(e) => {
                      setAuthPassword(e.target.value);
                      if (validationErrors.password) {
                        setValidationErrors({...validationErrors, password: undefined});
                      }
                    }}
                    onKeyPress={handleAuthKeyPress}
                    disabled={authLoading}
                    className={validationErrors.password ? "border-red-300 focus:border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={authLoading}
                  >
                    {showPassword ? "👁️" : "👁���‍🗨️"}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-red-600">⚠️ {validationErrors.password}</p>
                )}
              </div>

              <Button
                onClick={handleLogin}
                disabled={authLoading || !authUsername.trim() || !authPassword.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 font-semibold"
              >
                {authLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Giriş yapılıyor...</span>
                  </div>
                ) : (
                  "🚀 Giriş Yap"
                )}
              </Button>

              <div className="text-center space-y-2">
                <Separator />
                <p className="text-sm text-gray-600">Henüz hesabınız yok mu?</p>
                <Button
                  variant="outline"
                  onClick={showSignupScreen}
                  disabled={authLoading}
                  className="w-full border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  📝 Yeni Hesap Oluştur
                </Button>
              </div>

              <Button
                onClick={backToMenu}
                variant="outline"
                className="w-full border-2"
                disabled={authLoading}
              >
                ⬅️ Ana Menü
              </Button>

              {/* İpuçları */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-700">
                  <p className="font-semibold mb-1">💡 İpucu</p>
                  <p>Eğer şifrenizi unuttuysanız, yeni bir hesap oluşturabilirsiniz.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Signup ekranı
  if (gameState === "signup") {
    return (
      <div className="size-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-400 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-4 border-white/20 backdrop-blur-sm bg-white/10">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center">
              📝 Kayıt Ol
            </CardTitle>
            <p className="text-emerald-100 text-center">
              Yeni hesap oluşturarak Seyfullah Öğretmen'in sınıfına katılın
            </p>
          </CardHeader>
          <CardContent className="p-6 bg-white rounded-b-lg">
            <div className="space-y-4">
              {/* Başarı mesajı */}
              {authSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">
                    ✅ {authSuccess}
                  </AlertDescription>
                </Alert>
              )}

              {/* Hata mesajı */}
              {authError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    ❌ {authError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="signup-username">Kullanıcı Adı</Label>
                <Input
                  id="signup-username"
                  type="text"
                  placeholder="Benzersiz kullanıcı adı seçin"
                  value={authUsername}
                  onChange={(e) => {
                    setAuthUsername(e.target.value);
                    if (validationErrors.username) {
                      setValidationErrors({...validationErrors, username: undefined});
                    }
                  }}
                  onKeyPress={handleAuthKeyPress}
                  disabled={authLoading}
                  className={validationErrors.username ? "border-red-300 focus:border-red-500" : ""}
                />
                {validationErrors.username && (
                  <p className="text-sm text-red-600">⚠️ {validationErrors.username}</p>
                )}
                <div className="text-xs text-gray-500">
                  3-20 karakter, sadece harf, rakam, _ ve - kullanılabilir
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Şifre</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Güvenli bir şifre oluşturun"
                    value={authPassword}
                    onChange={(e) => {
                      setAuthPassword(e.target.value);
                      if (validationErrors.password) {
                        setValidationErrors({...validationErrors, password: undefined});
                      }
                    }}
                    onKeyPress={handleAuthKeyPress}
                    disabled={authLoading}
                    className={validationErrors.password ? "border-red-300 focus:border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={authLoading}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-red-600">⚠️ {validationErrors.password}</p>
                )}
                <div className="text-xs text-gray-500">
                  En az 4 karakter uzunluğunda olmalıdır
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Şifre Doğrulama</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Şifrenizi tekrar girin"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (validationErrors.confirmPassword) {
                        setValidationErrors({...validationErrors, confirmPassword: undefined});
                      }
                    }}
                    onKeyPress={handleAuthKeyPress}
                    disabled={authLoading}
                    className={validationErrors.confirmPassword ? "border-red-300 focus:border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={authLoading}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-red-600">⚠️ {validationErrors.confirmPassword}</p>
                )}
              </div>

              <Button
                onClick={handleSignup}
                disabled={authLoading || !authUsername.trim() || !authPassword.trim() || !confirmPassword.trim()}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 font-semibold"
              >
                {authLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Hesap oluşturuluyor...</span>
                  </div>
                ) : (
                  "🎉 Hesap Oluştur"
                )}
              </Button>

              <div className="text-center space-y-2">
                <Separator />
                <p className="text-sm text-gray-600">Zaten hesabınız var mı?</p>
                <Button
                  variant="outline"
                  onClick={showLoginScreen}
                  disabled={authLoading}
                  className="w-full border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  🔐 Giriş Yap
                </Button>
              </div>

              <Button
                onClick={backToMenu}
                variant="outline"
                className="w-full border-2"
                disabled={authLoading}
              >
                ⬅️ Ana Menü
              </Button>

              {/* Gizlilik bilgisi */}
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <div className="text-xs text-emerald-700">
                  <p className="font-semibold mb-1">🔒 Gizlilik</p>
                  <p>Bilgileriniz güvenle saklanır. Sadece skor takibi için kullanılır.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Account Management ekranı
  if (gameState === "accountManagement") {
    return (
      <div className="size-full bg-gradient-to-br from-orange-400 via-red-500 to-pink-400 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-4 border-white/20 backdrop-blur-sm bg-white/10">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center">
              ⚙️ Hesap Yönetimi
            </CardTitle>
            <p className="text-orange-100 text-center">
              {playerName} için hesap ayarları
            </p>
          </CardHeader>
          <CardContent className="p-6 bg-white rounded-b-lg">
            <div className="space-y-6">
              {/* Başarı mesajı */}
              {authSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">
                    ✅ {authSuccess}
                  </AlertDescription>
                </Alert>
              )}

              {/* Hata mesajı */}
              {authError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    ❌ {authError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Hesap Bilgileri */}
              <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                <div className="text-center space-y-2">
                  <div className="text-2xl">👤</div>
                  <h3 className="font-semibold text-blue-800">Hesap Bilgileri</h3>
                  <p className="text-blue-700">
                    <strong>Kullanıcı Adı:</strong> {playerName}
                  </p>
                  <div className="text-xs text-blue-600">
                    Skorlarınız güvenle saklanmaktadır
                  </div>
                </div>
              </div>

              {/* Ses Ayarları */}
              <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl">🎵</div>
                    <h3 className="font-semibold text-purple-800">Ses Ayarları</h3>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={toggleSound}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      {isSoundMuted ? "🔇" : "🔊"} Efektler
                    </Button>
                    <Button
                      onClick={toggleMusic}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      {isMusicMuted ? "🎵" : "🎶"} Müzik
                    </Button>
                  </div>

                  {!isMusicMuted && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-purple-700">
                        <span>🎚️ Müzik Seviyesi</span>
                        <span>{Math.round(musicVolume * 100)}%</span>
                      </div>
                      <Slider
                        value={[musicVolume * 100]}
                        onValueChange={(value) => handleMusicVolumeChange(value[0] / 100)}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Tehlikeli İşlemler */}
              <div className="bg-red-50 p-4 rounded-xl border-2 border-red-200">
                <div className="text-center space-y-3">
                  <div className="text-2xl">⚠️</div>
                  <h3 className="font-semibold text-red-800">Tehlikeli Bölge</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Hesabınızı sildiğinizde tüm skorlarınız kalıcı olarak silinir. Bu işlem geri alınamaz.
                  </p>
                  
                  {!showDeleteConfirm ? (
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      🗑️ Hesabımı Sil
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-red-800">
                        Hesabınızı silmek istediğinizden emin misiniz?
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleDeleteAccount}
                          disabled={deleteLoading}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          {deleteLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Siliniyor...</span>
                            </div>
                          ) : (
                            "✅ Evet, Sil"
                          )}
                        </Button>
                        <Button
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={deleteLoading}
                          variant="outline"
                          className="flex-1 border-gray-300"
                        >
                          ❌ İptal
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Geri Dönüş */}
              <Button
                onClick={backToMenu}
                variant="outline"
                className="w-full border-2"
                disabled={deleteLoading}
              >
                ⬅️ Ana Menü
              </Button>

              {/* Güvenlik Notu */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-600 text-center">
                  <p className="font-semibold mb-1">🔒 Güvenlik</p>
                  <p>Hesap işlemleri güvenli şekilde gerçekleştirilir</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === "tableSelection") {
    return (
      <MultiplicationTableSelector
        playerName={playerName}
        onTableSelect={handleTableSelect}
        onBack={backToMenu}
      />
    );
  }

  if (gameState === "playing") {
    return (
      <GameScreen
        playerName={playerName}
        multiplicationTable={selectedTable}
        onGameEnd={handleGameEnd}
        onBackToMenu={backToMenu}
      />
    );
  }

  if (gameState === "scoreBoard") {
    return <ScoreBoard onBack={backToMenu} />;
  }

  return (
    <div className="size-full bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-400 flex items-center justify-center p-4">
      <div className="text-center">
        {gameState === "menu" && (
          <Card className="w-full max-w-lg shadow-2xl border-4 border-white/20 backdrop-blur-sm bg-white/10">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-4xl font-bold">
                🔢 Çarpım Tablosu Macerası
              </CardTitle>
              <p className="text-indigo-100 mt-2">
                Seyfullah Öğretmen'in Matematik Sınıfı
              </p>
            </CardHeader>
            <CardContent className="p-8 bg-white rounded-b-lg">
              <div className="space-y-6">
                {/* Giriş yapan kullanıcı bilgisi */}
                {playerName && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">
                          🔐 Giriş yapıldı
                        </p>
                        <p className="font-semibold text-green-800">
                          Hoş geldin, {playerName}!
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={showAccountManagement}
                          variant="outline"
                          size="sm"
                          className="text-blue-700 border-blue-300 hover:bg-blue-50"
                        >
                          ⚙️ Hesap
                        </Button>
                        <Button
                          onClick={logout}
                          variant="outline"
                          size="sm"
                          className="text-green-700 border-green-300 hover:bg-green-50"
                        >
                          Çıkış
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    🎯 Nasıl Oynanır?
                  </h2>
                  <div className="text-sm text-gray-600 space-y-2 text-left">
                    <p>
                      • 🔐 Güvenli hesap oluşturun (kullanıcı
                      adı + şifre)
                    </p>
                    <p>
                      • 🔢 Çarpım tablosu seviyenizi seçin
                      (2-10)
                    </p>
                    <p>
                      • 🐦 Doğru cevabı taşıyan kuşa tıklayın
                    </p>
                    <p>
                      • ⏰ 10 soruyu süre bitmeden cevaplayın
                    </p>
                    <p>
                      • 🏆 Veritabanında skor tablosunda zirveye
                      çıkın!
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    🏅 Yeni Zorluk Seviyeleri
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          🌱 Kolay
                        </Badge>
                        <span>2, 5, 10 tabloları</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        Başlangıç
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-100 text-yellow-800">
                          ⚡ Orta
                        </Badge>
                        <span>3, 4, 6 tabloları</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        Orta seviye
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800">
                          🔥 Zor
                        </Badge>
                        <span>7, 8, 9 tabloları</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        İleri seviye
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={startNewGame}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 text-lg font-semibold"
                  >
                    🚀 Oyuna Başla
                  </Button>

                  <Button
                    onClick={showScoreBoard}
                    variant="outline"
                    className="w-full py-3 text-lg font-semibold border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    🏆 Skor Tablosu
                  </Button>
                </div>

                <Separator />

                {/* Ses Kontrolleri */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">
                    🎵 Ses Ayarları
                  </h4>
                  
                  {/* Ses Efektleri ve Müzik On/Off */}
                  <div className="flex gap-2">
                    <Button
                      onClick={toggleSound}
                      variant="outline"
                      className="flex-1 text-sm"
                    >
                      {isSoundMuted ? "🔇" : "🔊"} Ses Efektleri
                    </Button>
                    <Button
                      onClick={toggleMusic}
                      variant="outline"
                      className="flex-1 text-sm"
                    >
                      {isMusicMuted ? "🎵" : "🎶"} Müzik
                    </Button>
                  </div>

                  {/* Müzik Ses Seviyesi */}
                  {!isMusicMuted && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>🎚️ Müzik Seviyesi</span>
                        <span>{Math.round(musicVolume * 100)}%</span>
                      </div>
                      <Slider
                        value={[musicVolume * 100]}
                        onValueChange={(value) => handleMusicVolumeChange(value[0] / 100)}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Sessiz</span>
                        <span>En Yüksek</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Veritabanı Bilgisi */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 text-center">
                    <p>
                      💾 <strong>Güvenli Veritabanı</strong>
                    </p>
                    <p>
                      Skorlarınız güvenli şekilde kaydedilir ve
                      korunur
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {gameState === "gameOver" && (
          <Card className="w-full max-w-lg shadow-2xl border-4 border-white/20 backdrop-blur-sm bg-white/10">
            <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="text-3xl font-bold">
                {getScoreEmoji(finalScore)} Oyun Bitti!
              </CardTitle>
              <p className="text-green-100 mt-2">
                {playerName} için sonuçlar
              </p>
            </CardHeader>
            <CardContent className="p-8 bg-white rounded-b-lg">
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="text-lg text-gray-600">
                    Final Skorunuz
                  </div>
                  <div className="text-6xl font-bold text-green-600">
                    {finalScore}/10
                  </div>

                  <div className="space-y-2">
                    <Badge className="text-lg px-4 py-2 bg-blue-100 text-blue-800">
                      {selectedTable} Tablosu
                    </Badge>
                    <div className="text-sm text-gray-600">
                      Toplam Süre: {Math.floor(gameTime / 60)}:
                      {(gameTime % 60)
                        .toString()
                        .padStart(2, "0")}
                    </div>
                    <div className="text-xs text-gray-500">
                      💾 Skor veritabanına kaydedildi
                    </div>
                  </div>

                  {/* Seyfullah Öğretmen Feedback */}
                  <div
                    className={`p-6 rounded-2xl border-2 ${getSeyfullahFeedback(finalScore).color}`}
                  >
                    <div className="text-center space-y-3">
                      <div className="text-4xl">👨‍🏫</div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {
                          getSeyfullahFeedback(finalScore)
                            .message
                        }
                      </h3>
                      <p className="text-sm text-gray-700">
                        {
                          getSeyfullahFeedback(finalScore)
                            .detail
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={startNewGame}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 text-lg font-semibold"
                  >
                    🔄 Tekrar Oyna
                  </Button>

                  <Button
                    onClick={showScoreBoard}
                    variant="outline"
                    className="w-full py-3 text-lg font-semibold border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    🏆 Skor Tablosunu Gör
                  </Button>

                  <Button
                    onClick={backToMenu}
                    variant="outline"
                    className="w-full py-3 text-lg font-semibold border-2"
                  >
                    🏠 Ana Menü
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}