"use strict";
/**
 * Web Timer Application
 * Logica principale dell'applicazione timer
 */
class TimerApp {
    constructor() {
        // Stato dell'applicazione
        this.duration = 25 * 60; // Durata totale in secondi
        this.remainingTime = 25 * 60; // Tempo rimanente in secondi
        this.isRunning = false;
        this.timerInterval = null;
        this.mode = 'manual';
        // Inizializzazione riferimenti DOM
        this.minDisplay = document.getElementById('minutes');
        this.secDisplay = document.getElementById('seconds');
        this.progressPercent = document.getElementById('progress-percent');
        this.progressBar = document.getElementById('progress-bar');
        this.durationSlider = document.getElementById('duration-slider');
        this.durationDisplay = document.getElementById('duration-display');
        this.endTimeInput = document.getElementById('end-time-input');
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.resetModal = document.getElementById('reset-modal');
        this.endModal = document.getElementById('end-modal');
        this.confirmResetBtn = document.getElementById('confirm-reset-btn');
        this.closeResetBtn = document.querySelectorAll('.close-modal, .close-modal-btn[data-target="reset-modal"]');
        this.restartBtn = document.getElementById('restart-btn');
        this.closeEndBtn = document.querySelector('.close-modal-btn[data-target="end-modal"]');
        this.init();
    }
    /**
     * Inizializzazione degli Event Listener e dello stato iniziale
     */
    init() {
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
    handleEndTimeSelection() {
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
    setDuration(seconds) {
        this.duration = seconds;
        this.remainingTime = seconds;
        this.updateDisplay();
        // Rimuove stato critico se presente
        document.body.classList.remove('timer-critical');
    }
    updateDurationDisplay(minutes) {
        this.durationDisplay.textContent = `${minutes} min`;
    }
    /**
     * Avvia o Mette in Pausa il timer
     */
    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        }
        else {
            this.startTimer();
        }
    }
    startTimer() {
        if (this.remainingTime <= 0)
            return;
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
    pauseTimer() {
        this.isRunning = false;
        this.startBtn.innerHTML = '<span class="icon">▶</span> Riprendi';
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    resetTimer() {
        this.pauseTimer();
        this.startBtn.innerHTML = '<span class="icon">▶</span> Start Focus';
        // Riabilita input
        this.durationSlider.disabled = false;
        this.endTimeInput.disabled = false;
        // Ripristina durata basata sulla modalità
        if (this.mode === 'manual') {
            const minutes = parseInt(this.durationSlider.value);
            this.setDuration(minutes * 60);
        }
        else {
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
    tick() {
        this.remainingTime--;
        if (this.remainingTime <= 10 && this.remainingTime > 0) {
            document.body.classList.add('timer-critical');
        }
        if (this.remainingTime <= 0) {
            this.completeTimer();
        }
        this.updateDisplay();
    }
    completeTimer() {
        this.remainingTime = 0;
        this.pauseTimer();
        this.updateDisplay();
        // Auto-reset dopo 1.5 secondi invece di mostrare il modale
        setTimeout(() => {
            this.resetTimer();
        }, 1500);
    }
    /**
     * Aggiorna l'interfaccia utente
     */
    updateDisplay() {
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
