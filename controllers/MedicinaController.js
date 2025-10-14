const visita = require("../models/Medicina");
const IOFile = require("../models/IOFile");
const fs = require("fs");

var MedicinaController = {
    
    /*checkDate: (arr) => {
        const giorniOrdinati = ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato", "domenica"];
        arr.forEach(el => {
            el
        });
    },*/

    writeFile: (path, lines) => {
        IOFile.writeFile(path, lines);
    }
}

module.exports = MedicinaController