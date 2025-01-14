CRM PWA – La Bibbia del Venditore

Benvenuto/a! Questa applicazione Progressive Web App (PWA) è progettata per gestire in modo efficiente visite, preventivi, ordini e altre funzionalità tipiche di un CRM (Customer Relationship Management). Il tutto è ottimizzato per l’uso su vari dispositivi (desktop, tablet, smartphone) e include il supporto offline grazie al Service Worker.

Sommario
	1.	Caratteristiche principali
	2.	Struttura del progetto
	3.	Setup e Installazione
	4.	Funzionamento
	5.	FAQ e Troubleshooting
	6.	Crediti
 Caratteristiche principali
	•	Gestione delle visite: crea, modifica e archivia le visite commerciali.
	•	Funzionalità CRM: salva nuovi clienti (o potenziali), caricali da CSV e gestiscine i dati.
	•	Gestione prodotti: carica prodotti da CSV, aggiungili alla tabella ordini/preventivi e applica sconti.
	•	Esportazione dati: esporta in Excel, CSV e JSON, con la possibilità di filtrare per data.
	•	Simulatore noleggio: calcola importi, rate e costi giornalieri/orari di noleggio.
	•	Genera PDF: crea un PDF personalizzato di ordine o preventivo, con possibilità di includere immagini, link e un report di noleggio.
	•	Supporto offline: grazie al Service Worker, puoi usare l’app anche senza connessione; se una pagina non è disponibile offline, viene mostrata la pagina offline.html.
	•	Dark Mode: possibilità di attivare una modalità scura.
 Nel repository sono presenti i seguenti file e cartelle principali:
 .
├── index.html                # Entry point dell'app PWA
├── styles.css                # Foglio di stile principale
├── app.js                    # Logica e funzionalità JavaScript
├── manifest.json             # Manifest PWA
├── service-worker.js         # Service Worker per il supporto offline
├── offline.html              # Pagina di fallback in assenza di rete
├── icons
│   ├── icons_crm-192x192.png
│   └── icons_crm-512x512.png
└── README.md                 # Questo file di documentazione
Breve descrizione di ciascun file
	•	index.html
Contiene la struttura di base della pagina web, i riferimenti ai file CSS e JS, e la definizione di vari elementi (tabelle, form, pulsanti, etc.).
	•	styles.css
Include le regole di stile (responsive design, dark mode, layout tabella, bottoni, modali ecc.).
	•	app.js
Contiene tutta la logica dell’applicazione:
	•	Caricamento CSV (prodotti e clienti potenziali),
	•	Calcolo sconti e costi,
	•	Gestione delle visite / ordini (salvataggio su LocalStorage e modifica/eliminazione),
	•	Generazione del PDF,
	•	Supporto per la Dark Mode, e molto altro.
	•	manifest.json
Definisce i metadati per la PWA (nome, icone, colori, modalità di visualizzazione). Grazie a questo file, l’app può essere installata su dispositivi mobili e desktop.
	•	service-worker.js
Registra e gestisce la cache dei file principali e la pagina offline.html. Se l’utente è offline, il Service Worker fornisce le risorse già nella cache e, se una risorsa non è disponibile, mostra la pagina offline.
	•	offline.html
Schermata di fallback: se l’utente tenta di navigare verso risorse non disponibili senza connessione, visualizzerà questa pagina.
	•	icons/
Cartella con le icone .png che vengono utilizzate dal manifest per l’installazione su vari dispositivi.
Setup e Installazione
	1.	Clona o scarica questo repository sul tuo computer:
 git clone https://github.com/pezzaliapp/CRM-PWA.git
 2.	Apri la cartella del progetto e verifica di avere tutti i file elencati nella struttura.
	3.	Apri il file index.html in un browser moderno (Chrome, Firefox, Edge, Safari…).
	•	In alternativa, usa una semplice estensione come Live Server per lanciare un server locale.
	4.	Abilita il Service Worker: quando la pagina è servita da un server locale (o remoto con HTTPS), si attiverà automaticamente il Service Worker.
	5.	Verifica la corretta installazione:
	•	Apri gli strumenti per sviluppatori del browser (F12),
	•	Vai nella sezione Application (Chrome) o Storage (Firefox),
	•	Controlla la registrazione del Service Worker e la cache creata (ad esempio, “crm-pwa-cache-v1”).
 Funzionamento
	1.	Gestione Visite
	•	Utilizza i pulsanti “Salva Visita/Ordine” e “Richiama Visite” per salvare e ricaricare dati su LocalStorage.
	•	È possibile stampare la tabella visite o esportarla in CSV/Excel/JSON.
	2.	Caricamento CSV
	•	Clicca sui pulsanti di upload (CSV Prodotti o CSV Clienti) per caricare dati esistenti; verranno mostrati in elenco e potrai selezionarli.
	3.	Ordini e Preventivi
	•	Attiva la modalità “Preventivo” tramite l’apposito checkbox, oppure resta in modalità “Ordine”.
	•	Scegli i prodotti (anche multipli) da una lista filtrabile, aggiungi righe all’ordine, imposta sconti e calcola i totali.
	4.	Generazione PDF
	•	Premi “Genera PDF” per avere un file completo, con i dati di testata, l’elenco prodotti, eventuali immagini allegate e la sezione di noleggio (se abilitata).
	5.	Dark Mode
	•	Seleziona “Abilita Modalità Scura” per passare a un tema scuro (dato che l’informazione viene salvata in LocalStorage, il tema sarà ricordato ai successivi accessi).
	6.	Modalità Offline
	•	Quando il Service Worker è installato, se l’utente si disconnette, potrà comunque utilizzare buona parte delle funzionalità dell’app (già visitate e in cache).
	•	Se la risorsa non è disponibile, verrà caricata la pagina offline.html.
 FAQ e Troubleshooting
	1.	Perché non funziona offline su localhost?
	•	Il Service Worker richiede di servire i file via HTTPS (oppure su localhost con un server locale). Assicurati di usare un server statico o un pacchetto come live-server.
	2.	Come faccio a resettare i dati (clienti, visite…) salvati?
	•	Elimina i dati dal LocalStorage del browser. Puoi farlo dalle Application > Storage (Chrome) o Impostazioni del browser.
	3.	La generazione PDF non funziona su un browser specifico.
	•	Verifica la presenza delle librerie jspdf e jspdf-autotable. Aggiorna il browser o prova su un altro (alcune versioni di Safari meno recenti possono creare problemi).
	4.	Posso installare la PWA su smartphone?
	•	Sì, se apri index.html in HTTPS, comparirà la richiesta o il pulsante “Aggiungi a Schermata Home” (Android/Chrome). Per iOS, usa Safari e segui le istruzioni per l’installazione.
 Crediti
	•	jsPDF e jspdf-autotable per la generazione di PDF.
	•	xlsx per la lettura e scrittura di file Excel.
	•	Icone .png create internamente o da risorse open-source.
	•	Tutti coloro che hanno contribuito con suggerimenti e test per migliorare questa PWA.

Buon lavoro e buona vendita! Sfrutta la tua PWA “CRM – La Bibbia del Venditore” per gestire al meglio i tuoi clienti, le tue visite e i tuoi ordini.
> **Nota**: Questo software è distribuito sotto **Licenza MIT** – © Alessandro Pezzali 2025.




