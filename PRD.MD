# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1. Informazioni Generali
- **Nome Progetto:** Web Timer  
- **Tipo Progetto:** Applicazione Web Front-End  
- **Contesto:** Progetto di stage – Azienda di consulenza informatica  
- **Tecnologie:** HTML, CSS, TypeScript  
- **Piattaforma:** Browser desktop  

## 2. Descrizione del Progetto
Sviluppo di un’applicazione web per la gestione di un **timer ad uso generico**, con interfaccia minimale, moderna e professionale.  
L’app consente di impostare un timer tramite durata manuale o orario di fine, fornendo controlli semplici e un feedback visivo chiaro.


## 3. Obiettivi
- Realizzare un timer funzionale e intuitivo
- Applicare buone pratiche di sviluppo front-end
- Dimostrare competenze di base in UX/UI e TypeScript
- Fornire un progetto ordinato e ben documentato

## 4. Utenti Target
- Utenti generici  
- Tutor e responsabili di stage  
- Personale aziendale  

## 5. Requisiti Funzionali

### Modalità Timer
- **Durata manuale** tramite slider  
- **Orario di fine** con calcolo automatico del tempo rimanente  
- Blocco degli orari nel passato  

### Controlli
- Pulsante **Start / Reset** (cambio colore in base alla modalità)
  - Il reset richiede conferma tramite modale di conferma   
- Pulsante **Stop / Riprendi** (cambio colore in base alla modalità)

### Fine Timer
- Modale centrale di fine timer  
- Effetto **glow rosso** sullo sfondo negli ultimi 10 secondi  

## 6. Requisiti di Interfaccia
- Tema **dark** : palette di colori :
primario  #000000
secondario: #3E065F
Terzoario : #700B97
Altri: #8E05C2
- Design minimale, moderno e professionale,
- tutti i modali devono avere lo stesso design 
- Visualizzazione del timer:
  - countdown numerico (`MM:SS`) MM E SS separati da due card 
  - barra di avanzamento con %
- Animazioni minime (solo glow finale)
- l'applicazione deve essere responsive

## 7. Flusso Utente
1. Selezione della modalità timer  
2. Avvio del countdown  
3. Pausa / ripresa o reset (con popup di conferma)  
4. Avviso visivo finale  
5. Popup di fine timer  

## 8. Requisiti Tecnici
- HTML
- CSS puro
- TypeScript
- Nessun framework o libreria esterna  

### Struttura File
- index.html
- style.css
- src/
  - app.ts

## 9. Vincoli
- Utilizzo solo su browser desktop
- Nessun salvataggio dei dati
- Nessun backend
- Progetto a scopo didattico (stage)
- è necessario documentare il codice , pertanto devi commentare ogni blocco in modo chiaro e pulito in italiano 
- Nessun framework o libreria esterna 

## 10. Out of Scope
- Backend e database
- Autenticazione utenti
- Persistenza dello stato
- Ottimizzazione mobile avanzata
- Notifiche esterne al browser

