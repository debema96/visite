const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logFile = path.join(__dirname, '..', 'log.json');
        this.initializeLogFile();
    }

    initializeLogFile() {
        if (!fs.existsSync(this.logFile)) {
            fs.writeFileSync(this.logFile, JSON.stringify([], null, 2));
        }
    }

    log(action, user = null, details = null) {
        // Non loggare se l'utente è "test"
        if (user === 'test') {
            return;
        }

        try {
            const timestamp = new Date().toISOString();
            const entry = {
                timestamp,
                action,
                user,
                details
            };

            const logs = JSON.parse(fs.readFileSync(this.logFile, 'utf-8'));
            logs.push(entry);
            fs.writeFileSync(this.logFile, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.error('Errore nella scrittura del log:', error);
        }
    }

    // Metodi specifici per le azioni
    loginSuccess(user) {
        this.log('LOGIN_SUCCESS', user, { message: `Utente ${user} loggato con successo` });
    }

    loginFailed(user) {
        this.log('LOGIN_FAILED', user, { message: `Tentativo di login fallito per ${user}` });
    }

    logout(user) {
        this.log('LOGOUT', user, { message: `Utente ${user} disconnesso` });
    }

    addVisite(user, count) {
        this.log('ADD_VISITE', user, { count, message: `Aggiunte ${count} visite` });
    }

    removeVisite(user, count) {
        this.log('REMOVE_VISITE', user, { count, message: `Rimosse ${count} visite` });
    }

    addMedicine(user, count) {
        this.log('ADD_MEDICINE', user, { count, message: `Aggiunte ${count} medicine` });
    }

    removeMedicine(user, count) {
        this.log('REMOVE_MEDICINE', user, { count, message: `Rimosse ${count} medicine` });
    }

    download(user, type, details = null) {
        this.log('DOWNLOAD', user, { type, details, message: `Download di ${type}` });
    }
}

module.exports = new Logger();
