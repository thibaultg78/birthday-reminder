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
        const message = `🎂 Birthday${upcomingBirthdays.length > 1 ? 's' : ''} in ${config.daysInAdvance} days:\n${upcomingBirthdays.join(', ')}`;

        console.log(message);

        // Export for GitHub Actions
        fs.writeFileSync('birthday-alert.txt', message);
        process.exit(0); // Success = send email
    } else {
        console.log('No upcoming birthdays.');
        process.exit(1); // No email to send
    }
}

checkBirthdays().catch(console.error);