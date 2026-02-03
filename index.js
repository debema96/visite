console.log("Hello, Node.js!");

const express = require("express");
const session = require("express-session");
const path = require("path");
const crypto = require("crypto");
const IOFile = require("./models/IOFile");  // Importa la classe IOFile
const VisitaController = require("./controllers/VisitaController");
const MedicinaController = require("./controllers/MedicinaController");
const Logger = require("./models/Logger");  // Importa il Logger
const GitCommit = require("./models/GitCommit");  // Importa GitCommit
const app = express();
const PORT = 3000;

// Genera una secret casuale e sicura usando crypto
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

const ioFile = new IOFile();  // Crea un'istanza della classe IOFile

// Middleware per gestire JSON
app.use(express.json());

// Middleware per gestire le sessioni
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 } // 1 ora
}));

// Middleware per controllare se l'utente è autenticato
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/');
    }
};

// Middleware per aggiungere informazioni utente alle risposte
const addUserInfo = (req, res, next) => {
    res.locals.user = req.session.userId || null;
    next();
};

app.use(addUserInfo);

// Rotte

// Rotta principale - mostra login se non autenticato, altrimenti dashboard
app.get("/", (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.sendFile(path.join(__dirname, "views", "login.html"));
    }
});

// Dashboard - pagina principale dopo il login
app.get("/dashboard", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Serve file statici
app.use(express.static(path.join(__dirname, "views")));

// Rotta per leggere i dati dal file
app.get("/api/read", isAuthenticated, async (req, res) => {
    try {
        const result = await VisitaController.leggiVisite(req.session.userId);
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        console.error("Errore nella lettura:", error);
        res.status(500).json({ error: "Errore nella lettura del file" });
    }
});

app.get("/api/readmedicine", isAuthenticated, async (req, res) => {
    try {
        const result = await MedicinaController.leggiMedicine(req.session.userId);
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        console.error("Errore nella lettura:", error);
        res.status(500).json({ error: "Errore nella lettura del file" });
    }
});

// Nuovi endpoint per operazioni sul backend
app.post("/api/aggiungi-visita", isAuthenticated, async (req, res) => {
    try {
        const result = await VisitaController.aggiungiVisita(req.body, req.session.userId);
        if (result.success) {
            Logger.addVisite(req.session.userId, 1);
        }
        res.json(result);
    } catch (error) {
        console.error("Errore nell'aggiunta della visita:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post("/api/aggiungi-medicina", isAuthenticated, async (req, res) => {
    try {
        const result = await MedicinaController.aggiungiMedicina(req.body, req.session.userId);
        if (result.success) {
            Logger.addMedicine(req.session.userId, 1);
        }
        res.json(result);
    } catch (error) {
        console.error("Errore nell'aggiunta della medicina:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get("/api/organizza-visite", isAuthenticated, async (req, res) => {
    try {
        const result = await VisitaController.leggiVisite(req.session.userId);
        if (result.success) {
            const organizzate = await VisitaController.organizzaPerPaziente(result.data);
            res.json({ success: true, data: organizzate });
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error("Errore nell'organizzazione delle visite:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get("/api/organizza-medicine", isAuthenticated, async (req, res) => {
    try {
        const result = await MedicinaController.leggiMedicine(req.session.userId);
        if (result.success) {
            const organizzate = await MedicinaController.organizzaPerPaziente(result.data);
            res.json({ success: true, data: organizzate });
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error("Errore nell'organizzazione delle medicine:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Rotta per scrivere i dati nel file
app.post("/api/writevisite", (req, res) => {
    const fileToWrite = req.session.userId === 'test' ? 'visite_test' : 'visite';
    ioFile.writeFile(fileToWrite, req.body);
    console.log(`Visite salvate nel file: ${fileToWrite}`);
    res.send("Dati salvati correttamente!");
});

app.post("/api/checkdate", isAuthenticated, async (req, res) => {
    try {
        const fileToWrite = req.session.userId === 'test' ? 'visite_test' : 'visite';
        const cleanedData = VisitaController.checkDate(req.body);
        ioFile.writeFile(fileToWrite, cleanedData);
        console.log(`Dati salvati nel file: ${fileToWrite}`);
        res.json({ success: true, message: "Date pulite e salvate", data: cleanedData });
    } catch (error) {
        console.error("Errore nel checkDate:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint per eliminare una voce
app.post("/api/elimina-voce", isAuthenticated, async (req, res) => {
    try {
        const { tipo, paziente, index } = req.body;
        
        if (tipo === "visita") {
            const result = await VisitaController.eliminaVoce(paziente, index, req.session.userId);
            if (result.success) {
                Logger.removeVisite(req.session.userId, 1);
            }
            res.json(result);
        } else if (tipo === "medicina") {
            const result = await MedicinaController.eliminaVoce(paziente, index, req.session.userId);
            if (result.success) {
                Logger.removeMedicine(req.session.userId, 1);
            }
            res.json(result);
        } else {
            res.status(400).json({ success: false, error: "Tipo non riconosciuto" });
        }
    } catch (error) {
        console.error("Errore nell'eliminazione:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post("/api/writemedicine", isAuthenticated, (req, res) => {
    ioFile.writeFile("medicine",req.body);  // Uso corretto dell'istanza
    res.send("Dati salvati correttamente!");
});

// Endpoint login
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validazione campi
        if (!username || !password) {
            Logger.loginFailed(username || 'sconosciuto');
            return res.json({
                success: false,
                message: "Username e password sono obbligatori"
            });
        }

        // Leggi il file degli utenti
        const utenti = await ioFile.readFile("utenti.json");

        // Cerca l'utente
        const utenteValido = utenti.find(u => u.utente === username && u.pw === password);

        if (utenteValido) {
            // Salva l'utente nella sessione
            req.session.userId = utenteValido.utente;
            Logger.loginSuccess(utenteValido.utente);
            console.log(`Utente ${utenteValido.utente} loggato`);
            res.json({
                success: true,
                message: "Login avvenuto con successo",
                user: utenteValido.utente
            });
        } else {
            Logger.loginFailed(username);
            res.json({
                success: false,
                message: "Credenziali non valide"
            });
        }
    } catch (error) {
        console.error("Errore durante il login:", error);
        Logger.loginFailed('errore_server');
        res.status(500).json({
            success: false,
            message: "Errore del server"
        });
    }
});

// Endpoint logout
app.get("/logout", (req, res) => {
    const user = req.session.userId;
    req.session.destroy((err) => {
        if (err) {
            console.error("Errore durante il logout:", err);
        }
        if (user) {
            Logger.logout(user);
            // Esegui git commit e push
            const gitResult = GitCommit.commitAndPush(user);
            console.log('Risultato git:', gitResult);
        }
        res.redirect('/');
    });
});

// Endpoint per il logging di azioni dal frontend
app.post("/api/log-action", (req, res) => {
    const { action, type } = req.body;
    const user = req.session.userId || 'sconosciuto';
    if (action === 'download') {
        Logger.download(user, type);
    }
    res.json({ success: true });
});

// Avvio del server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
