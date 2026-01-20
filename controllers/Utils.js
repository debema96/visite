const fs = require("fs");

var Utils = {

    parseTime : async (str) => {
        const [h, min, s = 0] = str.split(":").map(Number);
        return h * 3600 + min * 60 + s; // converte tutto in secondi
    },

    parseDate : async (dateStr) => {
        let [day, month, year] = dateStr.split('/');
        year = parseInt(year, 10) < 100 ? `20${year}` : year; // Gestisce l'anno con due cifre
        return new Date(year, month - 1, day); // Mese base 0 in JavaScript
    },

    download : async (file) => {
        let now = new Date().toLocaleDateString('it-IT').replace(/\//g, '_');
        if (Object.keys(tab).length > 0) {
            Object.keys(tab).forEach(a => {
                doc = new jsPDF();
                colonne = [];
                Object.values(tab[a]).forEach(b => {
                    Object.keys(b).forEach(c => {
                        c = c.replaceAll("_", " ");
                        if (!colonne.includes(c)) colonne.push(c);
                    });
                });
                righe = tab[a].map(obj => Object.values(obj));
                if (file == "visite") {
                    righe.sort((a, b) => {
                        const parseDate = str => {
                            const [d, m, y] = str.split("/");
                            return new Date(`20${y}`, m - 1, d);
                        };

                        const parseTime = str => {
                            const [h, min, s = 0] = str.split(":").map(Number);
                            return h * 3600 + min * 60 + s; // converte tutto in secondi
                        };

                        const dataA = parseDate(a[1]);
                        const dataB = parseDate(b[1]);

                        if (dataA - dataB !== 0) {
                            return dataA - dataB; // confronto per data
                        } else {
                            //console.log("differenze orario a=> ", a[2], " b=>", b[2])
                            return parseTime(a[2]) - parseTime(b[2]); // confronto per ora
                        }
                    });
                }
                //console.log("colonne", colonne)
                //console.log("righe dopo", righe)
                doc.autoTable({
                    head: [colonne],
                    body: righe,
                    startY: 20,
                    pageBreak: 'avoid',
                    headStyles: { fontSize: 14 },
                    bodyStyles: { fontSize: 14 },
                    theme: 'grid'
                });
                doc.save(a + "_" + now + ".pdf");
            })
        } else if (arr.length > 0) {
            colonne = Object.keys(arr[0]).map(key => key.replaceAll("_", " "));
            righe = arr.map(obj => Object.values(obj));
            doc.autoTable({
                head: [colonne],
                body: righe,
                startY: 20,
                pageBreak: 'avoid',
                headStyles: { fontSize: 14 },
                bodyStyles: { fontSize: 14 },
                theme: 'grid'
            });
            doc.save(arr[0].PAZIENTE + "_" + now + ".pdf");
        } else {
            console.log("Nessun paziente trovato");
            alert("Impossibile scaricare il nulla");
        }
    },

    downloadAll : async (file) => {
        let now = new Date().toLocaleDateString('it-IT').replace(/\//g, '_');
        var doc = new jsPDF();

        if ((arr && Array.isArray(arr) && arr.length > 0) || (med && Array.isArray(med) && med.length > 0)) {
            if (file == "visite") {
                colonne = Object.keys(arr[0]).map(key => key.replaceAll("_", " "));
                righe = arr.map(obj => Object.values(obj));
                righe.sort((a, b) => {
                    const dataA = parseDate(a[1]);
                    const dataB = parseDate(b[1]);

                    if (dataA - dataB !== 0) {
                        return dataA - dataB; // confronto per data
                    } else {
                        //console.log("differenze orario a=> ", a[2], " b=>", b[2])
                        return parseTime(a[2]) - parseTime(b[2]); // confronto per ora
                    }
                });


            }
            else if (file == "medicine") {
                colonne = Object.keys(med[0]).map(key => key.replaceAll("_", " "));
                righe = med.map(obj => Object.values(obj));
            }
            doc.autoTable({
                head: [colonne],
                body: righe,
                startY: 20,
                pageBreak: 'avoid',
                headStyles: { fontSize: 14 },
                bodyStyles: { fontSize: 14 },
                theme: 'grid'
            });
            if (file == "visite") doc.save("visite_" + now + ".pdf");
            else if (file == "medicine") doc.save("medicine_" + now + ".pdf");
        } else {
            console.log("Nessun dato trovato");
            alert("Impossibile scaricare il nulla");
        }
    }



};

module.exports = Utils;
