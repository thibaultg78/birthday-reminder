const test = require('node:test');
const assert = require('node:assert/strict');

process.env.GOOGLE_CREDENTIALS = '{}';

const { formatUpcomingBirthdayDate, buildBirthdayLabel } = require('./check-birthdays');

test('formatUpcomingBirthdayDate retourne la date complète en français', () => {
    const checkDate = new Date('2026-04-28T00:00:00Z');
    assert.equal(formatUpcomingBirthdayDate(checkDate), 'le mardi 28 avril');
});

test('buildBirthdayLabel ajoute age + date complète', () => {
    const checkDate = new Date('2026-04-28T00:00:00Z');
    assert.equal(buildBirthdayLabel('Prénom Nom', '01/01/2024', checkDate), 'Prénom Nom - 2 ans - le mardi 28 avril');
});

test('buildBirthdayLabel ajoute la date même sans année de naissance', () => {
    const checkDate = new Date('2026-04-28T00:00:00Z');
    assert.equal(buildBirthdayLabel('Prénom Nom', '', checkDate), 'Prénom Nom - le mardi 28 avril');
});
