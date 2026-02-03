const { execSync } = require('child_process');
const path = require('path');

class GitCommit {
    constructor() {
        this.repoPath = path.join(__dirname, '..');
    }

    commitAndPush(user) {
        try {
            // Genera timestamp in formato italiano
            const now = new Date();
            const dateString = now.toLocaleDateString('it-IT') + ' ' + now.toLocaleTimeString('it-IT');
            
            // Messaggio di commit
            const commitMessage = `modifiche ${user} ${dateString}`;

            // Esegui git add
            execSync('git add -A', { cwd: this.repoPath });
            console.log('Git add completato');

            // Esegui git commit
            execSync(`git commit -m "${commitMessage}"`, { cwd: this.repoPath });
            console.log(`Commit eseguito: "${commitMessage}"`);

            // Esegui git push
            execSync('git push', { cwd: this.repoPath });
            console.log('Push completato');

            return { success: true, message: 'Commit e push eseguiti con successo' };
        } catch (error) {
            console.error('Errore durante git commit/push:', error.message);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new GitCommit();
