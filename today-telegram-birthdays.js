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

        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateComplete = today.toLocaleDateString('fr-FR', options);
        const dateCapitalized = dateComplete.charAt(0).toUpperCase() + dateComplete.slice(1);

        message = message + ' aujourd\'hui, le ' + dateCapitalized + ' :\n\n' + todayBirthdays.join(', ');

        message = message + '\n\nBon anniversaire ! 🎉';

        console.log(message);

        // Create the email subject
        let subject = '';

        if (todayBirthdays.length === 1) {
            // Single birthday
            subject = `🎂 Anniversaire de ${todayBirthdays[0]} aujourd'hui`;
        } else {
            // Multiple birthdays
            subject = `🎂 ${todayBirthdays.length} anniversaires aujourd'hui`;
        }

        // Export pour Telegram
        fs.writeFileSync('today-telegram.txt', message);

        // Export pour Email (même format que l'email 7 jours avant)
        fs.writeFileSync('today-email-alert.txt', message);
        fs.writeFileSync('today-email-subject.txt', subject);

        process.exit(0);
    } else {
        console.log('Aucun anniversaire aujourd\'hui.');
        process.exit(1);
    }
}

checkTodayBirthdays().catch(console.error);