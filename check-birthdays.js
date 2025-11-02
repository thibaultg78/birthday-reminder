const { google } = require('googleapis');
const fs = require('fs');

// Load config
const config = JSON.parse(fs.readFileSync('birthdays-config.json', 'utf8'));

// Load Google credentials
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

async function checkBirthdays() {
    // Google Auth
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Read Google Sheet
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: config.spreadsheetId,
        range: `${config.sheetName}!A:C`, // Columns: Name, Birth date, Birthday date
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
        console.log('No data found.');
        return;
    }

    // Today's date + X days
    const today = new Date();
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + config.daysInAdvance);

    const checkDay = checkDate.getDate();
    const checkMonth = checkDate.toLocaleString('fr-FR', { month: 'long' });

    const upcomingBirthdays = [];

    // Loop through rows (skip header)
    for (let i = 1; i < rows.length; i++) {
        const [nom, _, dateAnniversaire] = rows[i];

        if (!dateAnniversaire) continue;

        // Parse date (format: "20 juillet", "28 octobre", etc.)
        const parts = dateAnniversaire.trim().split(' ');
        const day = parseInt(parts[0]);
        const month = parts[1];

        if (day === checkDay && month === checkMonth) {
            upcomingBirthdays.push(nom);
        }
    }

    // If birthdays found
    if (upcomingBirthdays.length > 0) {
        const message = `🎂 Anniversaire${upcomingBirthdays.length > 1 ? 's' : ''} dans ${config.daysInAdvance} jours :\n${upcomingBirthdays.join(', ')}`;

        // Créer l'objet du mail
        const subject = upcomingBirthdays.length === 1
            ? `🎂 Anniversaire de ${upcomingBirthdays[0]} dans ${config.daysInAdvance} jours`
            : `🎂 ${upcomingBirthdays.length} anniversaires dans ${config.daysInAdvance} jours`;

        console.log(message);

        // Export pour GitHub Actions
        fs.writeFileSync('birthday-alert.txt', message);
        fs.writeFileSync('birthday-subject.txt', subject);
        process.exit(0);
    }
}

checkBirthdays().catch(console.error);