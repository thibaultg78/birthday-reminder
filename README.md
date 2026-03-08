# Birthday Reminder

Bot automatique de rappels d'anniversaires pour la famille, basé sur GitHub Actions.

## Fonctionnement

Les dates d'anniversaires sont stockées dans un Google Sheet (colonnes : Nom, Date de naissance, Date d'anniversaire au format "20 juillet"). Un projet GCP avec l'API Google Sheets permet la lecture des données. Le sheet est partagé avec le compte de service associé.

## Notifications

| Quand | Canal | Contenu |
|---|---|---|
| 1er du mois | Email | Récapitulatif de tous les anniversaires du mois avec les âges |
| J-7 | Email | Rappel avec le nom et l'âge à souhaiter |
| Jour J | Telegram + Email | Message d'anniversaire avec le nom et l'âge |

## Workflows GitHub Actions

- **[birthday-reminder.yml](.github/workflows/birthday-reminder.yml)** — Rappel 7 jours avant par email (tous les jours à 6h UTC)
- **[birthday-telegram.yml](.github/workflows/birthday-telegram.yml)** — Notification Telegram + email le jour J (tous les jours à 6h UTC)
- **[monthly-birthdays.yml](.github/workflows/monthly-birthdays.yml)** — Récap mensuel par email (le 1er de chaque mois à 6h UTC)
- **[keepalive.yml](.github/workflows/keepalive.yml)** — Commit vide mensuel pour éviter la désactivation des workflows par GitHub

## Secrets requis

| Secret | Description |
|---|---|
| `GOOGLE_CREDENTIALS` | Credentials JSON du compte de service GCP |
| `EMAIL_USERNAME` | Adresse Gmail pour l'envoi des emails |
| `EMAIL_PASSWORD` | Mot de passe d'application Gmail |
| `TELEGRAM_BOT_TOKEN` | Token du bot Telegram |
| `TELEGRAM_CHAT_ID` | ID du chat Telegram destinataire |

## Stack

- Node.js 18
- [googleapis](https://www.npmjs.com/package/googleapis) pour la lecture du Google Sheet
- GitHub Actions pour l'orchestration et l'envoi (email via [dawidd6/action-send-mail](https://github.com/dawidd6/action-send-mail), Telegram via l'API HTTP)
