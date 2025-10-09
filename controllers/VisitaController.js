const visita = require("../models/Visita");
const IOFile = require("../models/IOFile");
const fs = require("fs");
var old = [];

var VisitaController = {

    checkDate: (arr) => {
        let now = new Date();
        let month = now.getMonth() + 1;
        now = now.getDate() + "/" + month + "/" + now.getFullYear();
        let anno;
        let mese;
        let giorno;
        try {
            arr.forEach(e => {
                anno = Number(e.DATA.split("/")[2]);
                mese = Number(e.DATA.split("/")[1]);
                giorno = Number(e.DATA.split("/")[0]);
                if (anno < Number(now.split("/")[2].slice(2)) ||
                    (anno == Number(now.split("/")[2].slice(2)) && mese < Number(now.split("/")[1])) ||
                    (anno == Number(now.split("/")[2].slice(2)) && mese == Number(now.split("/")[1]) && giorno < Number(now.split("/")[0]))) {
                    old.push(e);
                };
            });
            console.log("old =>", old);
            if (old && Array.isArray(old) && old.length > 0) {
                arr = arr.filter(el => !old.includes(el));
            };
            console.log("arr.length =>", arr.length);
            return arr;
        } catch (er) {
            console.log("Errore nella pulizia delle date");
        }
    },

    writeFile: (path, lines) => {
        IOFile.writeFile(path, lines);
    }/*,


    addVisita: (visite, nuovaVisita) => {
        visita.addVisita(visite, nuovaVisita);
    },*/

    /*writeFileOld: () => {
        console.log("oldFile =>", oldFile);
        console.log("old =>", old);
        console.log("oldFile.length =>", oldFile.length);
        if (old && Array.isArray(old) && old.length > 0) {
            old.forEach(ele => {
                oldFile.push(ele);
            });
        };

        console.log("oldFile.length 2 =>", oldFile.length);
        oldFile = oldFile.filter(el => !old.includes(el));
        console.log("oldFile.length 3 =>", oldFile.length);

        fetch("/api/writestorico", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(oldFile)
        })
            .then(response => response.text())
            .then(msg => alert(msg))
            .catch(err => console.error("Errore:", err));
    }*/
}

module.exports = VisitaController