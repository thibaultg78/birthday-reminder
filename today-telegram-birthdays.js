const { google } = require('googleapis');
const fs = require('fs');

// Charger la config
const config = JSON.parse(fs.readFileSync('birthdays-config.json', 'utf8'));

// Charger les credentials Google
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

async function checkTodayBirthdays() {
    // Auth Google
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Lire le Google Sheet
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: config.spreadsheetId,
        range: `${config.sheetName}!A:C`,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
        console.log('Aucune donnée trouvée.');
        return;
    }

    // Date du jour
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.toLocaleString('fr-FR', { month: 'long' });

    const todayBirthdays = [];

    // Parcourir les lignes (skip header)
    for (let i = 1; i < rows.length; i++) {
        const [nom, _, dateAnniversaire] = rows[i];

        if (!dateAnniversaire) continue;

        // Parser la date (format: "20 juillet", "28 octobre", etc.)
        const parts = dateAnniversaire.trim().split(' ');
        const day = parseInt(parts[0]);
        const month = parts[1];

        if (day === todayDay && month === todayMonth) {
            todayBirthdays.push(nom);
        }
    }

    // Si anniversaires aujourd'hui
    if (todayBirthdays.length > 0) {
        let message = '🎂 Anniversaire';

        if (todayBirthdays.length > 1) {
            message = message + 's';
        }

        message = message + ' aujourd\'hui :\n' + todayBirthdays.join(', ');

        message = message + '\n\nBon anniversaire ! 🎉';

        console.log(message);

        // Export pour Telegram
        fs.writeFileSync('today-telegram.txt', message);
        process.exit(0);
    } else {
        console.log('Aucun anniversaire aujourd\'hui.');
        process.exit(1);
    }
}

checkTodayBirthdays().catch(console.error);