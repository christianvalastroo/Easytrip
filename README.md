<div align="center">

# ✈️ EasyTrip

### Organizza ogni viaggio senza caos

🌍 Destinazioni · 📅 Attività · 💰 Budget · ✅ Checklist

</div>

EasyTrip è un'applicazione full stack per organizzare viaggi, attività, budget, note e checklist in un unico spazio personale.

Il progetto è stato sviluppato come Capstone Project e comprende un'interfaccia responsive in inglese e italiano, autenticazione completa e gestione privata dei dati di ogni utente.

![Homepage di EasyTrip](docs/screenshots/easytrip-home.jpg)

## ✨ Funzionalità

- Registrazione, login e logout
- Dashboard personale con riepilogo dei viaggi
- Creazione, modifica ed eliminazione dei viaggi
- Copertina personalizzata per ogni viaggio
- Gestione delle attività con data, ora, luogo, categoria e costo
- Calcolo delle spese rispetto al budget disponibile
- Note e checklist personalizzabile
- Profilo utente con immagine personale
- Guida introduttiva dopo il primo accesso
- Interfaccia disponibile in inglese e italiano
- Layout responsive per desktop, tablet e smartphone

## 🛠️ Tecnologie

### 🎨 Frontend

- React 19
- React Router
- Vite
- Tailwind CSS
- Lucide React

### ⚙️ Backend

- Node.js
- Express
- MongoDB e Mongoose
- JSON Web Token
- bcrypt
- Cloudinary
- Multer

## 📁 Struttura del progetto

```text
Easytrip/
├── Backend/     API REST, autenticazione e database
├── Frontend/    Applicazione React
└── README.md
```

## 📋 Requisiti

- Node.js 20 o versione successiva
- npm
- Database MongoDB
- Account Cloudinary per il caricamento delle immagini

## 🚀 Installazione

Clona il repository:

```bash
git clone https://github.com/christianvalastroo/Easytrip.git
cd Easytrip
```

Installa le dipendenze:

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

## 🔐 Configurazione

Crea i file `.env` partendo dagli esempi inclusi:

```bash
cp Backend/.env.example Backend/.env
cp Frontend/.env.example Frontend/.env
```

Completa i valori nei due file `.env`. Le credenziali reali non devono mai essere aggiunte al repository.

### Variabili backend

| Variabile | Descrizione |
| --- | --- |
| `PORT` | Porta del server Express |
| `CLIENT_URL` | Indirizzo del frontend autorizzato da CORS |
| `MONGO_URL` | Stringa di connessione MongoDB |
| `JWT_SECRET` | Chiave privata per firmare i token |
| `CLOUDINARY_CLOUD_NAME` | Nome cloud Cloudinary |
| `CLOUDINARY_API_KEY` | API key Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret Cloudinary |

### Variabili frontend

| Variabile | Descrizione |
| --- | --- |
| `VITE_API_URL` | URL completo delle API, incluso `/api` |

## 💻 Avvio in locale

Avvia il backend:

```bash
cd Backend
npm run dev
```

In un secondo terminale avvia il frontend:

```bash
cd Frontend
npm run dev
```

Il frontend sarà disponibile normalmente su `http://localhost:5173` e il backend su `http://localhost:5001`.

## ✅ Controlli di qualità

Esegui lint e build del frontend:

```bash
npm --prefix Frontend run lint
npm --prefix Frontend run build
```

Controlla lo stato delle API:

```text
GET /api/health
```

## 🔗 API principali

- `/api/auth` - registrazione e login
- `/api/users` - profilo, password, onboarding e account
- `/api/trips` - gestione dei viaggi e delle copertine
- `/api/activities` - gestione delle attività dei viaggi

Le rotte private richiedono un token JWT nell'header `Authorization`.

## 🌐 Pubblicazione

Il link alla versione online sarà aggiunto dopo il deployment del frontend e del backend.

## 👨‍💻 Autore

Progetto realizzato da [Christian Valastro](https://github.com/christianvalastroo).
