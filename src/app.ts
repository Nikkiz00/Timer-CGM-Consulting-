/**
 * Web Timer Application
 * Logica principale dell'applicazione timer
 */

// Definizione dei tipi
type TimerMode = 'manual' | 'endtime';

class TimerApp {
    // Stato dell'applicazione
    private duration: number = 25 * 60; // Durata totale in secondi
    private remainingTime: number = 25 * 60; // Tempo rimanente in secondi
    private isRunning: boolean = false;
    private timerInterval: number | null = null;
    private mode: TimerMode = 'manual';

    // Elementi DOM - Display
    private minDisplay: HTMLElement;
    private secDisplay: HTMLElement;
    private progressPercent: HTMLElement;
    private progressBar: HTMLElement;

    // Elementi DOM - Controlli
    private durationSlider: HTMLInputElement;
    private durationDisplay: HTMLElement;
    private endTimeInput: HTMLInputElement;
    private startBtn: HTMLButtonElement;
    private resetBtn: HTMLButtonElement;

    // Elementi DOM - Modali
    private resetModal: HTMLElement;
    private endModal: HTMLElement;
    private confirmResetBtn: HTMLElement;
    private closeResetBtn: NodeListOf<HTMLElement>;
    private restartBtn: HTMLElement;
    private closeEndBtn: HTMLElement;

    constructor() {
        // Inizializzazione riferimenti DOM
        this.minDisplay = document.getElementById('minutes')!;
        this.secDisplay = document.getElementById('seconds')!;
        this.progressPercent = document.getElementById('progress-percent')!;
        this.progressBar = document.getElementById('progress-bar')!;

        this.durationSlider = document.getElementById('duration-slider') as HTMLInputElement;
        this.durationDisplay = document.getElementById('duration-display')!;
        this.endTimeInput = document.getElementById('end-time-input') as HTMLInputElement;

        this.startBtn = document.getElementById('start-btn') as HTMLButtonElement;
        this.resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;

        this.resetModal = document.getElementById('reset-modal')!;
        this.endModal = document.getElementById('end-modal')!;

        this.confirmResetBtn = document.getElementById('confirm-reset-btn')!;
        this.closeResetBtn = document.querySelectorAll('.close-modal, .close-modal-btn[data-target="reset-modal"]')!;

        this.restartBtn = document.getElementById('restart-btn')!;
        this.closeEndBtn = document.querySelector('.close-modal-btn[data-target="end-modal"]')!;

        this.init();
    }

    /**
     * Inizializzazione degli Event Listener e dello stato iniziale
     */
    private init(): void {
        // Slider durata manuale
        this.durationSlider.addEventListener('input', () => {
            if (!this.isRunning) {
                this.mode = 'manual';
                const minutes = parseInt(this.durationSlider.value);
                this.setDuration(minutes * 60);
                this.updateDurationDisplay(minutes);
            }
        });

        // Input orario di fine
        this.endTimeInput.addEventListener('change', () => {
            if (!this.isRunning) {
                this.handleEndTimeSelection();
            }
        });

        // Pulsante Start/Pause
        this.startBtn.addEventListener('click', () => {
            this.toggleTimer();
        });

        // Pulsante Reset (apre modale)
        this.resetBtn.addEventListener('click', () => {
            this.resetModal.classList.remove('hidden');
        });

        // Gestione Modale Reset
        this.confirmResetBtn.addEventListener('click', () => {
            this.resetTimer();
            this.resetModal.classList.add('hidden');
        });

        this.closeResetBtn.forEach(btn => {
            btn.addEventListener('click', () => {
                this.resetModal.classList.add('hidden');
            });
        });

        // Gestione Modale Fine Timer
        this.restartBtn.addEventListener('click', () => {
            this.endModal.classList.add('hidden');
            this.resetTimer();
        });

        this.closeEndBtn.addEventListener('click', () => {
            this.endModal.classList.add('hidden');
            // Mantiene lo stato a 00:00 ma toglie il glow se necessario, o resetta parzialmente UI
            document.body.classList.remove('timer-critical');
        });

        // Imposta visualizzazione iniziale
        this.updateDisplay();
    }

    /**
     * Gestisce la selezione dell'orario di fine
     */
    private handleEndTimeSelection(): void {
        const now = new Date();
        const [hours, minutes] = this.endTimeInput.value.split(':').map(Number);

        const targetTime = new Date();
        targetTime.setHours(hours, minutes, 0, 0);

        // Se l'orario è passato, assume che sia per domani (o mostra errore, ma PRD dice "Blocco orari nel passato", qui semplifichiamo adattando al futuro prossimo o ignorando)
        // Per semplicità e robustezza: se è nel passato, non fa nulla o resetta. 
        // Implementazione: Calcola differenza. Se negativa, ignora.

        let diffSeconds = Math.floor((targetTime.getTime() - now.getTime()) / 1000);

        if (diffSeconds <= 0) {
            // Se l'utente seleziona un orario passato, potremmo gestirlo come "domani" o errore.
            // Il PRD dice "Blocco degli orari nel passato". 
            // Qui semplicemente non aggiorniamo se negativo.
            alert("L'orario deve essere nel futuro.");
            this.endTimeInput.value = '';
            return;
        }

        this.mode = 'endtime';
        this.setDuration(diffSeconds);
        // Aggiorna lo slider per riflettere i minuti approssimativi, solo visivamente
        const approxMinutes = Math.ceil(diffSeconds / 60);
        this.durationDisplay.textContent = `${approxMinutes} min`;
    }

    /**
     * Imposta la durata e resetta il tempo rimanente
     */
    private setDuration(seconds: number): void {
        this.duration = seconds;
        this.remainingTime = seconds;
        this.updateDisplay();

        // Rimuove stato critico se presente
        document.body.classList.remove('timer-critical');
    }

    private updateDurationDisplay(minutes: number): void {
        this.durationDisplay.textContent = `${minutes} min`;
    }

    /**
     * Avvia o Mette in Pausa il timer
     */
    private toggleTimer(): void {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    private startTimer(): void {
        if (this.remainingTime <= 0) return;

        this.isRunning = true;
        this.startBtn.innerHTML = '<span class="icon">⏸</span> Pausa';
        this.startBtn.classList.add('active'); // Opzionale per styling

        // Disabilita input durante l'esecuzione
        this.durationSlider.disabled = true;
        this.endTimeInput.disabled = true;

        this.timerInterval = window.setInterval(() => {
            this.tick();
        }, 1000);
    }

    private pauseTimer(): void {
        this.isRunning = false;
        this.startBtn.innerHTML = '<span class="icon">▶</span> Riprendi';

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    private resetTimer(): void {
        this.pauseTimer();
        this.startBtn.innerHTML = '<span class="icon">▶</span> Start Focus';

        // Riabilita input
        this.durationSlider.disabled = false;
        this.endTimeInput.disabled = false;

        // Ripristina durata basata sulla modalità
        if (this.mode === 'manual') {
            const minutes = parseInt(this.durationSlider.value);
            this.setDuration(minutes * 60);
        } else {
            // Se era in modalità endtime, il reset riporta a manuale o pulisce?
            // Generalmente reset riporta allo stato iniziale. Resettiamo a manuale default
            this.mode = 'manual';
            this.durationSlider.value = '25';
            this.updateDurationDisplay(25);
            this.setDuration(25 * 60);
            this.endTimeInput.value = '';
        }

        document.body.classList.remove('timer-critical');
    }

    /**
     * Logica di aggiornamento ogni secondo
     */
    private tick(): void {
        this.remainingTime--;

        if (this.remainingTime <= 10 && this.remainingTime > 0) {
            document.body.classList.add('timer-critical');
        }

        if (this.remainingTime <= 0) {
            this.completeTimer();
        }

        this.updateDisplay();
    }

    private completeTimer(): void {
        this.remainingTime = 0;
        this.pauseTimer();
        this.updateDisplay();

        this.triggerExplosion();

        // Mostra il modale di fine dopo un breve ritardo
        setTimeout(() => {
            this.endModal.classList.remove('hidden');
        }, 800);
    }

    private triggerExplosion(): void {
        document.body.classList.add('shake');
        setTimeout(() => document.body.classList.remove('shake'), 500);

        const colors = ['#8E05C2', '#FF3B30', '#FFFFFF', '#700B97', '#FFD700', '#00FF00', '#00FFFF'];
        const particlesCount = 100;

        // Start position (center of screen, generally where the timer is)
        const x = window.innerWidth / 2;
        const y = window.innerHeight / 2;

        for (let i = 0; i < particlesCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('explosion-particle');
            document.body.appendChild(particle);

            // Random color
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.backgroundColor = color;
            particle.style.boxShadow = `0 0 10px ${color}`; // Aggiunge glow

            // Random size
            const size = Math.random() * 8 + 4; // 4px to 12px
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;

            // Random start position near center
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;

            // Physics calculation
            const angle = Math.random() * Math.PI * 2;
            const velocity = 200 + Math.random() * 400; // Increase velocity range

            const destX = Math.cos(angle) * velocity;
            const destY = Math.sin(angle) * velocity;

            // Random rotation
            const rotation = Math.random() * 360;

            // Animate using Web Animations API
            const animation = particle.animate([
                {
                    transform: `translate(0, 0) rotate(0deg) scale(1)`,
                    opacity: 1
                },
                {
                    transform: `translate(${destX}px, ${destY}px) rotate(${rotation}deg) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 1000 + Math.random() * 500,
                easing: 'cubic-bezier(0.25, 1, 0.5, 1)', // Decelerate
                fill: 'forwards'
            });

            animation.onfinish = () => {
                particle.remove();
            };
        }
    }

    /**
     * Aggiorna l'interfaccia utente
     */
    private updateDisplay(): void {
        // Calcola minuti e secondi
        const minutes = Math.floor(this.remainingTime / 60);
        const seconds = this.remainingTime % 60;

        // Formatta con zero iniziale
        this.minDisplay.textContent = minutes.toString().padStart(2, '0');
        this.secDisplay.textContent = seconds.toString().padStart(2, '0');

        // Calcola progresso percentuale
        const progress = this.duration > 0
            ? ((this.duration - this.remainingTime) / this.duration) * 100
            : 0;

        this.progressBar.style.width = `${progress}%`;
        this.progressPercent.textContent = `${Math.round(progress)}%`;
    }
}

// Avvio dell'applicazione
document.addEventListener('DOMContentLoaded', () => {
    new TimerApp();
});
