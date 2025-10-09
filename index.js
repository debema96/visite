console.log("Hello, Node.js!");

const express = require("express");
const path = require("path");
const IOFile = require("./models/IOFile");  // Importa la classe IOFile
const VisitaController = require("./controllers/VisitaController");
const app = express();
const PORT = 3000;

const ioFile = new IOFile();  // Crea un'istanza della classe IOFile

// Middleware per gestire JSON e file statici
app.use(express.json());
app.use(express.static(path.join(__dirname, "views")));

// Rotte
//app.use("/api", productRoutes);

/* Rotta principale
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});*/

/*app.get("/api/readstorico", () => {
    return ioFile.readFile("storico.json");  // Uso corretto dell'istanza
    //res.json(data);
    //data;
});*/


// Rotta per leggere i dati dal file
app.get("/api/read", async (req, res) => {
    var data = await ioFile.readFile("visite.json");  // Uso corretto dell'istanza
    console.log("RES => ", data.length);
    res.json(data);
    //res.json(data);
    //data;
});

app.get("/api/readmedicine", async (req, res) => {
    var data = await ioFile.readFile("medicine.json");  // Uso corretto dell'istanza
    console.log("RES => ", data.length);
    res.json(data);
    //res.json(data);
    //data;
});

// Rotta per scrivere i dati nel file
app.post("/api/writevisite", (req, res) => {
    ioFile.writeFile("visite",req.body);  // Uso corretto dell'istanza
    res.send("Dati salvati correttamente!");
});

app.post("/api/checkdate", (req, res) => {
    VisitaController.checkDate(req.body);  // Uso corretto dell'istanza
    res.send("Dati salvati correttamente!");
});

app.post("/api/writemedicine", (req, res) => {
    ioFile.writeFile("medicine",req.body);  // Uso corretto dell'istanza
    res.send("Dati salvati correttamente!");
});

// Avvio del server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
