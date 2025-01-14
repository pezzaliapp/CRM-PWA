# CRM PWA – La Bibbia del Venditore

Benvenuto/a! Questa applicazione **Progressive Web App (PWA)** è progettata per gestire in modo efficiente **visite, preventivi, ordini** e altre funzionalità tipiche di un CRM (Customer Relationship Management). Il tutto è ottimizzato per l’uso su vari dispositivi (desktop, tablet, smartphone) e include il supporto **offline** grazie al Service Worker.

> **Nota**: Questo software è distribuito sotto **Licenza MIT** – © Alessandro Pezzali 2025.

---

## Sommario

1. [Caratteristiche principali](#caratteristiche-principali)  
2. [Struttura del progetto](#struttura-del-progetto)  
3. [Setup e Installazione](#setup-e-installazione)  
4. [Funzionamento](#funzionamento)  
5. [FAQ e Troubleshooting](#faq-e-troubleshooting)  
6. [Crediti](#crediti)  
7. [Licenza](#licenza)

---

## Caratteristiche principali

- **Gestione delle visite**: Crea, modifica e archivia le visite commerciali.  
- **Funzionalità CRM**: Salva nuovi clienti (o potenziali), caricali da CSV e gestiscine i dati.  
- **Gestione prodotti**: Carica prodotti da CSV, aggiungili alla tabella ordini/preventivi e applica sconti.  
- **Esportazione dati**: Esporta in Excel, CSV e JSON, con la possibilità di filtrare per data.  
- **Simulatore noleggio**: Calcola importi, rate e costi giornalieri/orari di noleggio.  
- **Genera PDF**: Crea un PDF personalizzato di ordine o preventivo, con possibilità di includere immagini, link e un report di noleggio.  
- **Supporto offline**: Grazie al Service Worker, puoi usare l’app anche senza connessione; se una risorsa non è in cache, viene mostrata la pagina offline.  
- **Dark Mode**: Possibilità di attivare una modalità scura.

---

## Struttura del progetto

Nel repository sono presenti i seguenti file e cartelle principali:
.
├── index.html                # Entry point dell’app PWA
├── styles.css                # Foglio di stile principale
├── app.js                    # Logica e funzionalità JavaScript
├── manifest.json             # Manifest PWA
├── service-worker.js         # Service Worker per il supporto offline
├── offline.html              # Pagina di fallback in assenza di rete
├── icons
│   ├── icons_crm-192x192.png  # Icona PWA 192x192
│   └── icons_crm-512x512.png  # Icona PWA 512x512
└── README.md                 # Questo file di documentazione
### Breve descrizione di ciascun file

- **index.html**  
  Contiene la struttura di base della pagina web, i riferimenti ai file CSS e JS, e la definizione di vari elementi (tabelle, form, pulsanti, ecc.).

- **styles.css**  
  Include le regole di stile (responsive design, dark mode, layout tabella, bottoni, modali ecc.).

- **app.js**  
  Contiene tutta la logica dell'applicazione, tra cui:
  - Caricamento CSV (prodotti e clienti potenziali)  
  - Calcolo sconti e costi  
  - Gestione delle visite / ordini (salvataggio su LocalStorage e modifica/eliminazione)  
  - Generazione del PDF  
  - Supporto per la Dark Mode  
  - Altre funzionalità CRM

- **manifest.json**  
  Definisce i metadati per la PWA (nome, icone, colori, modalità di visualizzazione). Grazie a questo file, l’app può essere installata su dispositivi mobili e desktop.

- **service-worker.js**  
  Registra e gestisce la cache dei file principali e la pagina `offline.html`. Se l’utente è offline, fornisce le risorse già in cache o, se non sono disponibili, mostra la pagina di fallback.

- **offline.html**  
  Schermata di fallback: se l’utente tenta di navigare verso risorse non disponibili senza connessione, visualizzerà questa pagina.

- **icons/**  
  Cartella con le icone `.png` che vengono utilizzate dal manifest per l’installazione su vari dispositivi.

---

## Setup e Installazione

1. **Clona o scarica** questo repository sul tuo computer:
   ```bash
   git clone https://github.com/pezzaliapp/CRM-PWA.git
2.	Apri la cartella del progetto e verifica di avere tutti i file elencati nella struttura.
3.	Apri il file index.html in un browser moderno (Chrome, Firefox, Edge, Safari…) oppure usa un server di sviluppo (ad esempio Live Server per Visual Studio Code).
4.	Abilita il Service Worker: Quando la pagina è servita da un server locale (o remoto con HTTPS), si attiverà automaticamente il Service Worker.
5.	Verifica la corretta installazione:
	•	Apri gli strumenti per sviluppatori del browser (F12).
	•	Vai nella sezione Application (Chrome) o Storage (Firefox).
	•	Controlla la registrazione del Service Worker e la presenza della cache (ad esempio, “crm-pwa-cache-v1”).

FAQ e Troubleshooting
	•	Perché non funziona offline su localhost?
Il Service Worker richiede che i file siano serviti via HTTPS (o localhost con un server locale). Assicurati di usare un server statico (ad esempio live-server o simili).
	•	Come faccio a resettare i dati (clienti, visite…) salvati?
Elimina i dati dal LocalStorage del browser. Puoi farlo nelle Application > Storage (su Chrome) o dalle impostazioni del browser.
	•	La generazione del PDF non funziona su un browser specifico.
Verifica che le librerie jspdf e jspdf-autotable siano incluse correttamente. Alcune versioni di Safari o browser meno recenti potrebbero non essere supportate.
	•	Posso installare la PWA su smartphone? Sì. Se apri index.html via HTTPS, comparirà un prompt (o un’icona) per aggiungere l’app alla schermata Home 			(Android/Chrome) oppure, su iOS/Safari, segui le istruzioni per l’installazione.

Crediti
	•	jsPDF e jspdf-autotable per la generazione di PDF.
	•	xlsx per la lettura e scrittura di file Excel.
	•	Icone .png create internamente o da risorse open-source.
	•	Tutti i contributori che hanno testato e suggerito miglioramenti per questa PWA.

Licenza

Questo progetto è rilasciato sotto Licenza MIT – © Alessandro Pezzali 2025.

Buon lavoro e buona vendita!
Sfrutta la tua PWA “CRM – La Bibbia del Venditore” per gestire al meglio i tuoi clienti, le tue visite e i tuoi ordini.

### 8. Creazione della Cartella `icons`

Assicurati di avere una cartella chiamata `icons` nella radice del tuo progetto e di inserire all'interno i file delle icone:
icons/
├── icons_crm-192x192.png
└── icons_crm-512x512.png

#### Come Creare la Cartella su GitHub

Se stai utilizzando GitHub, puoi creare la cartella `icons` e aggiungere i file seguendo questi passaggi:

1. **Vai al tuo repository** su GitHub.
2. **Clicca su "Add file"** e poi su **"Upload files"**.
3. **Trascina la cartella `icons`** con i file `icons_crm-192x192.png` e `icons_crm-512x512.png` all'interno dell'area di upload.
4. **Commit** i file al repository.

---

### Note Finali

- **Funzione `parseEuropeanFloat` Correttamente Implementata**: Ora, la funzione `parseEuropeanFloat` rimuove tutti i punti (considerati come separatori delle migliaia) e sostituisce la virgola con un punto (decimale), garantendo che valori come `3.200€` vengano interpretati correttamente come `3200`.

- **Valori Trasporto a Forfait e Installazione a Forfait**: I campi `trasportoForfait` e `installazioneForfait` ora accettano input formattati in stile europeo e vengono trattati correttamente nel calcolo dei totali.

- **Importazione del Totale Articoli nel Simulatore di Noleggio**: La funzione `useTotal()` è stata rivista per importare correttamente il totale articoli nel campo `importo`, senza causare errori di parsing.

- **Separa completamente i file HTML, CSS e JS**: Ora il progetto è ben organizzato, con file separati per la struttura, lo stile e la logica dell'applicazione.

- **Supporto Offline**: Il `service-worker.js` gestisce correttamente la cache e fornisce la pagina `offline.html` quando necessario.

- **Licenza MIT**: La PWA è distribuita sotto Licenza MIT, con il credito appropriato.

   
