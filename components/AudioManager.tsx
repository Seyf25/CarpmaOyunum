export class AudioManager {
  private audioContext: AudioContext | null = null;
  private isSoundMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private musicVolume: number = 0.3; // 0.0 - 1.0 arası
  private backgroundMusicInterval: number | null = null;
  private backgroundMusicAudio: HTMLAudioElement | null = null;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Ayarları localStorage'dan yükle
      const savedSoundMute = localStorage.getItem('soundMuted');
      const savedMusicMute = localStorage.getItem('musicMuted');
      const savedMusicVolume = localStorage.getItem('musicVolume');
      
      this.isSoundMuted = savedSoundMute === 'true';
      this.isMusicMuted = savedMusicMute === 'true';
      this.musicVolume = savedMusicVolume ? parseFloat(savedMusicVolume) : 0.3;
    } catch (error) {
      console.warn('Web Audio API desteklenmiyor');
    }
  }

  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.audioContext || this.isSoundMuted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playCorrectAnswer() {
    // Başarı melodisi - yukarı çıkan notallar
    const melody = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, C (oktav)
    melody.forEach((freq, index) => {
      setTimeout(() => this.createTone(freq, 0.3, 'sine', 0.4), index * 100);
    });
  }

  playWrongAnswer() {
    // Hata sesi - alçak ve kısa
    this.createTone(220, 0.6, 'square', 0.3);
    setTimeout(() => this.createTone(196, 0.3, 'square', 0.2), 200);
  }

  playTimeWarning() {
    // Süre uyarısı - tekrarlayan bip
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this.createTone(880, 0.15, 'square', 0.4), i * 200);
    }
  }

  playGameStart() {
    // Oyun başlangıç fanfarı
    const fanfare = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    fanfare.forEach((freq, index) => {
      setTimeout(() => this.createTone(freq, 0.25, 'triangle', 0.3), index * 150);
    });
  }

  playGameOver() {
    // Oyun bitti - alçalan melodisi
    const gameOverMelody = [523.25, 493.88, 440, 392, 349.23];
    gameOverMelody.forEach((freq, index) => {
      setTimeout(() => this.createTone(freq, 0.4, 'sine', 0.3), index * 200);
    });
  }

  playPerfectScore() {
    // Mükemmel skor - zafer fanfarı
    const victoryMelody = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5];
    victoryMelody.forEach((freq, index) => {
      setTimeout(() => this.createTone(freq, 0.3, 'triangle', 0.4), index * 120);
    });
  }

  playClick() {
    // UI tıklama sesi
    this.createTone(800, 0.1, 'square', 0.2);
  }

  playLevelSelect() {
    // Seviye seçim sesi
    this.createTone(659.25, 0.2, 'sine', 0.3);
  }

  startBackgroundMusic() {
    if (this.backgroundMusicAudio || this.isMusicMuted) return;

    try {
      // Yeni MP3 müzik dosyasını yükle
      this.backgroundMusicAudio = new Audio('https://devapostapp.com/carpim_tablosu_oyunu/2_d_track.mp3');
      this.backgroundMusicAudio.loop = true;
      this.backgroundMusicAudio.volume = this.musicVolume;
      this.backgroundMusicAudio.play().catch(error => {
        console.warn('Müzik çalamadı:', error);
        // Fallback: eski synthesizer müzik
        this.startFallbackMusic();
      });
    } catch (error) {
      console.warn('MP3 müzik yüklenemedi, fallback müzik kullanılıyor:', error);
      this.startFallbackMusic();
    }
  }

  private startFallbackMusic() {
    if (this.backgroundMusicInterval || this.isMusicMuted) return;

    // Fallback: Çarpım tablosu temalı neşeli melodi
    const multiplicationMelody = [
      523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5, // C major scale
      1046.5, 987.77, 880, 783.99, 698.46, 659.25, 587.33, 523.25  // Reverse
    ];
    
    let currentNote = 0;

    const playNextNote = () => {
      if (this.isMusicMuted) return;
      
      if (!this.audioContext) return;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(multiplicationMelody[currentNote], this.audioContext.currentTime);
      oscillator.type = 'triangle';

      gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.8);
      
      currentNote = (currentNote + 1) % multiplicationMelody.length;
    };

    this.backgroundMusicInterval = window.setInterval(playNextNote, 1500);
    playNextNote(); // İlk notayı hemen çal
  }

  stopBackgroundMusic() {
    // MP3 müziği durdur
    if (this.backgroundMusicAudio) {
      this.backgroundMusicAudio.pause();
      this.backgroundMusicAudio.currentTime = 0;
      this.backgroundMusicAudio = null;
    }
    
    // Fallback müziği durdur
    if (this.backgroundMusicInterval) {
      clearInterval(this.backgroundMusicInterval);
      this.backgroundMusicInterval = null;
    }
  }

  toggleSound() {
    this.isSoundMuted = !this.isSoundMuted;
    localStorage.setItem('soundMuted', this.isSoundMuted.toString());
    return this.isSoundMuted;
  }

  toggleMusic() {
    this.isMusicMuted = !this.isMusicMuted;
    localStorage.setItem('musicMuted', this.isMusicMuted.toString());
    
    if (this.isMusicMuted) {
      this.stopBackgroundMusic();
    } else if (!this.backgroundMusicAudio && !this.backgroundMusicInterval) {
      this.startBackgroundMusic();
    }
    
    return this.isMusicMuted;
  }

  getSoundMuteStatus() {
    return this.isSoundMuted;
  }

  getMusicMuteStatus() {
    return this.isMusicMuted;
  }

  // Müzik ses seviyesi kontrolü
  setMusicVolume(volume: number) {
    // Volume 0.0 - 1.0 arasında olmalı
    this.musicVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('musicVolume', this.musicVolume.toString());
    
    // Mevcut müziğin ses seviyesini güncelle
    if (this.backgroundMusicAudio) {
      this.backgroundMusicAudio.volume = this.musicVolume;
    }
  }

  getMusicVolume() {
    return this.musicVolume;
  }

  // Müzik seviyesini artır/azalt (0.1 step)
  adjustMusicVolume(increment: number) {
    const newVolume = this.musicVolume + increment;
    this.setMusicVolume(newVolume);
    return this.musicVolume;
  }

  // Eski uyumluluk için
  toggleMute() {
    return this.toggleSound();
  }

  getMuteStatus() {
    return this.isSoundMuted;
  }

  // App.tsx uyumluluğu için alias methodlar
  playCorrect() {
    this.playCorrectAnswer();
  }

  playIncorrect() {
    this.playWrongAnswer();
  }
}

// Global instance
export const audioManager = new AudioManager();