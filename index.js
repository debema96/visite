console.log("Hello, Node.js!");

const express = require("express");
const session = require("express-session");
const path = require("path");
const IOFile = require("./models/IOFile");  // Importa la classe IOFile
const VisitaController = require("./controllers/VisitaController");
const app = express();
const PORT = 3000;

const ioFile = new IOFile();  // Crea un'istanza della classe IOFile

// Middleware per gestire JSON
app.use(express.json());

// Middleware per gestire le sessioni
app.use(session({
    secret: 'your-secret-key-change-this',
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
app.get("/api/read", async (req, res) => {
    try {
        const fileToRead = req.session.userId === 'test' ? 'visite_test.json' : 'visite.json';
        var data = await ioFile.readFile(fileToRead);
        console.log(`RES => Letto da ${fileToRead}, ${data.length} elementi`);
        res.json(data);
    } catch (error) {
        console.error("Errore nella lettura:", error);
        res.status(500).json({ error: "Errore nella lettura del file" });
    }
});

app.get("/api/readmedicine", async (req, res) => {
    try {
        const fileToRead = req.session.userId === 'test' ? 'medicine_test.json' : 'medicine.json';
        var data = await ioFile.readFile(fileToRead);
        console.log(`RES => Letto da ${fileToRead}, ${data.length} elementi`);
        res.json(data);
    } catch (error) {
        console.error("Errore nella lettura:", error);
        res.status(500).json({ error: "Errore nella lettura del file" });
    }
});

// Rotta per scrivere i dati nel file
app.post("/api/writevisite", (req, res) => {
    const fileToWrite = req.session.userId === 'test' ? 'visite-test' : 'visite';
    ioFile.writeFile(fileToWrite, req.body);
    console.log(`Visite salvate nel file: ${fileToWrite}`);
    res.send("Dati salvati correttamente!");
});

app.post("/api/checkdate", async (req, res) => {
    try {
        const fileToWrite = req.session.userId === 'test' ? 'visite-test' : 'visite';
        await VisitaController.checkDate(req.body);
        ioFile.writeFile(fileToWrite, req.body);
        console.log(`Dati salvati nel file: ${fileToWrite}`);
        res.send("Dati salvati correttamente!");
    } catch (error) {
        console.error("Errore durante il checkDate:", error);
        res.status(500).send("Errore durante il salvataggio");
    }
});

app.post("/api/writemedicine", (req, res) => {
    ioFile.writeFile("medicine",req.body);  // Uso corretto dell'istanza
    res.send("Dati salvati correttamente!");
});

// Endpoint login
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validazione campi
        if (!username || !password) {
            return res.json({
                success: false,
                message: "Username e password sono obbligatori"
            });
        }

        // Leggi il file degli utenti
        const utenti = await ioFile.readFile("utenti.json");

        console.log("utente => ", username, password);
        // Cerca l'utente
        const utenteValido = utenti.find(u => u.utente === username && u.pw === password);

        if (utenteValido) {
            // Salva l'utente nella sessione
            req.session.userId = utenteValido.utente;
            console.log(`Utente ${utenteValido.utente} loggato`);
            res.json({
                success: true,
                message: "Login avvenuto con successo",
                user: utenteValido.utente
            });
        } else {
            res.json({
                success: false,
                message: "Credenziali non valide"
            });
        }
    } catch (error) {
        console.error("Errore durante il login:", error);
        res.status(500).json({
            success: false,
            message: "Errore del server"
        });
    }
});

// Endpoint logout
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Errore durante il logout:", err);
        }
        res.redirect('/');
    });
});

// Avvio del server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
