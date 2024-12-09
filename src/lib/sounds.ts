class SoundEffectManager {
    private coinFlip: HTMLAudioElement;
    private win: HTMLAudioElement;
    private lose: HTMLAudioElement;
    private initialized: boolean = false;

    constructor() {
        this.coinFlip = new Audio('/src/effects/coin.mp3');
        this.win = new Audio('/src/effects/win.mp3');
        this.lose = new Audio('/src/effects/lose.mp3');
    }

    init() {
        if (this.initialized) return;
        
        // Preload sounds
        this.coinFlip.load();
        this.win.load();
        this.lose.load();
        
        this.initialized = true;
    }

    async playFlip(enabled: boolean = true) {
        if (!enabled) return;
        try {
            this.coinFlip.currentTime = 0;
            await this.coinFlip.play();
        } catch (error) {
            console.error('Error playing flip sound:', error);
        }
    }

    async playWin(enabled: boolean = true) {
        if (!enabled) return;
        try {
            this.win.currentTime = 0;
            await this.win.play();
        } catch (error) {
            console.error('Error playing win sound:', error);
        }
    }

    async playLose(enabled: boolean = true) {
        if (!enabled) return;
        try {
            this.lose.currentTime = 0;
            await this.lose.play();
        } catch (error) {
            console.error('Error playing lose sound:', error);
        }
    }
}

export const SoundManager = new SoundEffectManager();
