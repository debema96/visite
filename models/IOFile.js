const fs = require("fs");
const path = require("path");

class IOFile {


    // Funzione per leggere gli utenti dal file
    readFile = async (filePath) => {
        try {
            console.log("leggo =>", filePath);
            if (filePath == "visite.json") {
                const fileContent = fs.readFileSync(filePath, "utf-8"); // Legge il file come testo
                if (fileContent) {
                    const arr = JSON.parse(fileContent); // Converte il contenuto in JSON
                    console.log("Visite lette correttamente:", arr.length);
                    return arr;                                                  
                } else return [];
            } else  if (filePath == "medicine.json") {
                const fileContent = fs.readFileSync(filePath, "utf-8"); // Legge il file come testo
                if (fileContent) {
                    const arr = JSON.parse(fileContent); // Converte il contenuto in JSON
                    console.log("Medicine lette correttamente:", arr.length);
                    return arr;                                                  
                } else return [];
            }

        } catch (error) {
            console.log("Errore nella lettura o conversione del file");
            return [];
        }
    }

    writeFile = async (file,arr) => {
        // Converti l'array in una stringa JSON
        const jsonData = JSON.stringify(arr, null, 2); // `null, 2` per formattare il JSON in modo leggibile

        // Scrivi il JSON in un file 
        if (file == "visite") {
            fs.writeFile('visite.json', jsonData, (err) => {
                if (err) { console.error('Errore durante la scrittura del file:', err); }
                    else { console.log('Dati salvati correttamente in visite.json'); }
            });
        } else if (file == "medicine") {
             fs.writeFile('medicine.json', jsonData, (err) => {
                if (err) { console.error('Errore durante la scrittura del file:', err); } 
                    else { console.log('Dati salvati correttamente in medicine.json'); }
            });
        }
    }


}

module.exports = IOFile;