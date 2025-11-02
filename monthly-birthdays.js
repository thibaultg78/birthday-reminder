const { google } = require('googleapis');
const fs = require('fs');

// Load config
const config = JSON.parse(fs.readFileSync('birthdays-config.json', 'utf8'));

// Load Google credentials
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

async function getMonthlyBirthdays() {
    // Google Auth
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Read Google Sheet
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: config.spreadsheetId,
        range: `${config.sheetName}!A:C`,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
        console.log('Aucune donnée trouvée.');
        return;
    }

    // Current month
    const today = new Date();
    const currentMonth = today.toLocaleString('fr-FR', { month: 'long' });
    const currentMonthCapitalized = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

    const monthBirthdays = [];

    // Loop through rows (skip header)
    for (let i = 1; i < rows.length; i++) {
        const [nom, _, dateAnniversaire] = rows[i];

        if (!dateAnniversaire) continue;

        // Parse date (format: "20 juillet", "28 octobre", etc.)
        const parts = dateAnniversaire.trim().split(' ');
        const day = parseInt(parts[0]);
        const month = parts[1];

        if (month === currentMonth) {
            monthBirthdays.push({
                nom: nom,
                jour: day,
                dateTexte: dateAnniversaire
            });
        }
    }

    // Sort by day
    monthBirthdays.sort((a, b) => a.jour - b.jour);

    // If birthdays found
    if (monthBirthdays.length > 0) {
        // Build message
        let message = `🎂 Anniversaires du mois de ${currentMonthCapitalized}\n\n`;

        for (const birthday of monthBirthdays) {
            message = message + `- ${birthday.dateTexte} : ${birthday.nom}\n`;
        }

        message = message + `\nTotal : ${monthBirthdays.length} anniversaire`;

        if (monthBirthdays.length > 1) {
            message = message + 's';
        }

        message = message + ' ce mois-ci !';

        console.log(message);

        // Create email object
        const subject = `🎂 ${monthBirthdays.length} anniversaire${monthBirthdays.length > 1 ? 's' : ''} en ${currentMonthCapitalized}`;

        // Export for GitHub Actions
        fs.writeFileSync('monthly-alert.txt', message);
        fs.writeFileSync('monthly-subject.txt', subject);
        process.exit(0);
    } else {
        console.log('Aucun anniversaire ce mois-ci.');
        process.exit(1);
    }
}

getMonthlyBirthdays().catch(console.error);