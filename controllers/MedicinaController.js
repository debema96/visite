const IOFile = require("../models/IOFile");

var MedicinaController = {

    // Legge le medicine dal file appropriato in base all'utente
    leggiMedicine: async (userId) => {
        try {
            const ioFile = new IOFile();
            const fileToRead = userId === 'test' ? 'medicine_test.json' : 'medicine.json';
            const data = await ioFile.readFile(fileToRead);
            return { success: true, data: data, file: fileToRead };
        } catch (error) {
            console.error("Errore nella lettura delle medicine:", error);
            return { success: false, error: error.message };
        }
    },

    // Ordina le medicine per giorno della settimana e momento della giornata
    ordinaMedicine: (arr) => {
        const ordineGiorni = {
            "tutti i giorni": 1,
            "giorni alterni": 2,
            "lunedì": 3,
            "martedì": 4,
            "mercoledì": 5,
            "giovedì": 6,
            "venerdì": 7,
            "sabato": 8,
            "domenica": 9
        };

        const ordineOra = {
            "colazione": 1,
            "metà mattina": 2,
            "pranzo": 3,
            "metà pomeriggio": 4,
            "cena": 5
        };

        return arr.sort((a, b) => {
            const priorityA = ordineGiorni[a.GIORNO?.toLowerCase()] || 999;
            const priorityB = ordineGiorni[b.GIORNO?.toLowerCase()] || 999;

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            const oraA = ordineOra[a.ORA?.toLowerCase()] || 999;
            const oraB = ordineOra[b.ORA?.toLowerCase()] || 999;

            return oraA - oraB;
        });
    },

    // Organizza le medicine per paziente
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

        // Ordina le medicine per ogni paziente
        Object.keys(tab).forEach(paziente => {
            tab[paziente] = MedicinaController.ordinaMedicine(tab[paziente]);
        });

        return tab;
    },

    // Aggiunge una medicina
    aggiungiMedicina: async (medicina, userId) => {
        try {
            const ioFile = new IOFile();
            const fileToRead = userId === 'test' ? 'medicine_test.json' : 'medicine.json';
            const fileToWrite = userId === 'test' ? 'medicine_test' : 'medicine';
            
            let data = await ioFile.readFile(fileToRead);

            const nuovaMedicina = {
                PAZIENTE: medicina.paziente.toLowerCase(),
                MEDICINA: medicina.medicina.toLowerCase() || " ",
                GIORNO: medicina.giorno,
                ORA: medicina.ora,
                NOTE: medicina.note.toLowerCase() || " "
            };

            data.push(nuovaMedicina);
            ioFile.writeFile(fileToWrite, data);
            
            return { success: true, message: "Medicina aggiunta con successo", data: data };
        } catch (error) {
            console.error("Errore nell'aggiunta della medicina:", error);
            return { success: false, error: error.message };
        }
    },

    // Elimina una voce
    eliminaVoce: async (paziente, index, userId) => {
        try {
            const ioFile = new IOFile();
            const fileToRead = userId === 'test' ? 'medicine_test.json' : 'medicine.json';
            const fileToWrite = userId === 'test' ? 'medicine_test' : 'medicine';
            
            let data = await ioFile.readFile(fileToRead);
            
            // Filtra le medicine del paziente
            const medicinePaziente = data.filter(m => m.PAZIENTE === paziente);
            
            if (index >= 0 && index < medicinePaziente.length) {
                const medicinaEliminata = medicinePaziente[index];
                
                // Trova l'indice vero nell'array totale
                const indiceVero = data.findIndex(m => 
                    m.PAZIENTE === medicinaEliminata.PAZIENTE && 
                    m.MEDICINA === medicinaEliminata.MEDICINA &&
                    m.GIORNO === medicinaEliminata.GIORNO &&
                    m.ORA === medicinaEliminata.ORA &&
                    m.NOTE === medicinaEliminata.NOTE
                );
                
                if (indiceVero !== -1) {
                    data.splice(indiceVero, 1);
                    ioFile.writeFile(fileToWrite, data);
                    
                    return { success: true, message: "Voce eliminata con successo", data: data };
                } else {
                    return { success: false, error: "Medicina non trovata" };
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
        const ioFile = new IOFile();
        ioFile.writeFile(path, lines);
    }
}

module.exports = MedicinaController