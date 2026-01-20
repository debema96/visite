const visita = require("../models/Visita");
const IOFile = require("../models/IOFile");
const fs = require("fs");
var old = [];

var VisitaController = {

    // Legge le visite dal file appropriato in base all'utente
    leggiVisite: async (userId) => {
        try {
            const ioFile = new IOFile();
            const fileToRead = userId === 'test' ? 'visite_test.json' : 'visite.json';
            const data = await ioFile.readFile(fileToRead);
            return { success: true, data: data, file: fileToRead };
        } catch (error) {
            console.error("Errore nella lettura delle visite:", error);
            return { success: false, error: error.message };
        }
    },

    // Verifica e filtra le date vecchie
    checkDate: (arr) => {
        let now = new Date();
        let month = now.getMonth() + 1;
        now = now.getDate() + "/" + month + "/" + now.getFullYear();
        let anno;
        let mese;
        let giorno;
        let oldData = [];
        try {
            arr.forEach(e => {
                anno = Number(e.DATA.split("/")[2]);
                mese = Number(e.DATA.split("/")[1]);
                giorno = Number(e.DATA.split("/")[0]);
                if (anno < Number(now.split("/")[2].slice(2)) ||
                    (anno == Number(now.split("/")[2].slice(2)) && mese < Number(now.split("/")[1])) ||
                    (anno == Number(now.split("/")[2].slice(2)) && mese == Number(now.split("/")[1]) && giorno < Number(now.split("/")[0]))) {
                    oldData.push(e);
                };
            });
            console.log("old =>", oldData);
            if (oldData && Array.isArray(oldData) && oldData.length > 0) {
                arr = arr.filter(el => !oldData.includes(el));
            };
            console.log("arr.length =>", arr.length);
            return arr;
        } catch (er) {
            console.log("Errore nella pulizia delle date");
            return arr;
        }
    },

    // Ordina le visite per data
    riordinaPerData: async (array) => {
        if (!array || !Array.isArray(array)) return [];
        
        const parseDate = (dateStr) => {
            const [day, month, year] = dateStr.split('/');
            return new Date(year, month - 1, day);
        };

        return array.sort((a, b) => {
            if (a.DATA && b.DATA) {
                return parseDate(a.DATA) - parseDate(b.DATA);
            }
            return 0;
        });
    },

    // Crea le tabelle organizzate per paziente
    organizzaPerPaziente: async (arr) => {
        if (!arr || !Array.isArray(arr) || arr.length === 0) return {};
        
        const pazienti = [];
        const tab = {};

        arr.forEach(el => {
            if (el.PAZIENTE && !pazienti.includes(el.PAZIENTE)) {
                pazienti.push(el.PAZIENTE);
            }
        });

        pazienti.forEach(a => {
            tab[a] = [];
        });

        arr.forEach(b => {
            Object.keys(tab).forEach(a => {
                if (a == b.PAZIENTE) {
                    tab[a].push(b);
                }
            });
        });

        // Ordina ogni paziente per data
        for (let c of Object.keys(tab)) {
            tab[c] = await VisitaController.riordinaPerData(tab[c]);
        }

        return tab;
    },

    // Aggiunge una visita
    aggiungiVisita: async (visita, userId) => {
        try {
            const ioFile = new IOFile();
            const fileToRead = userId === 'test' ? 'visite_test.json' : 'visite.json';
            const fileToWrite = userId === 'test' ? 'visite_test' : 'visite';
            
            let data = await ioFile.readFile(fileToRead);
            
            // Converte la data dal formato date input
            let day = visita.data.split("-")[2];
            let month = visita.data.split("-")[1];
            let year = visita.data.split("-")[0].slice(2);
            let dataFormattata = day + "/" + month + "/" + year;

            // Valida l'orario
            let ora = visita.ora;
            if (!/^(?:[0-9]|1\d|2[0-3]):[0-5]\d$/.test(ora)) {
                if (/^(?:[0-9]|1\d|2[0-3]).[0-5]\d$/.test(ora)) {
                    ora = ora.replaceAll(".", ":");
                }
            }

            const nuovaVisita = {
                PAZIENTE: visita.paziente.toLowerCase(),
                DATA: dataFormattata,
                ORA: ora,
                LUOGO: visita.luogo.toLowerCase() || " ",
                TIPO_VISITA: visita.tipoVisita.toLowerCase() || " ",
                NOTE: visita.note.toLowerCase() || " "
            };

            data.push(nuovaVisita);
            ioFile.writeFile(fileToWrite, data);
            
            return { success: true, message: "Visita aggiunta con successo", data: data };
        } catch (error) {
            console.error("Errore nell'aggiunta della visita:", error);
            return { success: false, error: error.message };
        }
    },

    // Elimina una voce
    eliminaVoce: async (paziente, index, userId) => {
        try {
            const ioFile = new IOFile();
            const fileToRead = userId === 'test' ? 'visite_test.json' : 'visite.json';
            const fileToWrite = userId === 'test' ? 'visite_test' : 'visite';
            
            let data = await ioFile.readFile(fileToRead);
            
            // Filtra le visite del paziente
            const visitePaziente = data.filter(v => v.PAZIENTE === paziente);
            
            if (index >= 0 && index < visitePaziente.length) {
                const visitaEliminata = visitePaziente[index];
                
                // Trova l'indice vero nell'array totale
                const indiceVero = data.findIndex(v => 
                    v.PAZIENTE === visitaEliminata.PAZIENTE && 
                    v.DATA === visitaEliminata.DATA &&
                    v.ORA === visitaEliminata.ORA &&
                    v.LUOGO === visitaEliminata.LUOGO &&
                    v.TIPO_VISITA === visitaEliminata.TIPO_VISITA &&
                    v.NOTE === visitaEliminata.NOTE
                );
                
                if (indiceVero !== -1) {
                    data.splice(indiceVero, 1);
                    ioFile.writeFile(fileToWrite, data);
                    
                    return { success: true, message: "Voce eliminata con successo", data: data };
                } else {
                    return { success: false, error: "Visita non trovata" };
                }
            } else {
                return { success: false, error: "Indice non valido" };
            }
        } catch (error) {
            console.error("Errore nell'eliminazione della voce:", error);
            return { success: false, error: error.message };
        }
    },

    writeFile: (path, lines) => {
        IOFile.writeFile(path, lines);
    }
}

module.exports = VisitaController