const visita = require("../models/Medicina");
const IOFile = require("../models/IOFile");
const fs = require("fs");

var MedicinaController = {

    writeFile : (path, lines) => {
        IOFile.writeFile(path, lines);
    }
}

module.exports = MedicinaController