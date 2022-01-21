# Illuvio Support


## Installation

Tu dois avoir Node.JS 16+

installer les modules: ```npm i```

## Configuraton

```json
//config.json
{
  "clientId": "id du bot",
  "token": "token du bot,

  "parentOpened": "categorie lorsque le ticket est ouvert",
  "Category1": "",
  "Category2": "",
  "Category3": "",

  "roleSupport": "id support",
  
  "logsTicket": "id channel logs",
  "ticketChannel": "id channel créer un ticket"
}
```

+ You can change category emojis in `intractionCreate.js` @ line 50.
+ Make sure the `ticketChannel` is empty.

## Deployment
```bash
node commands.js # To deploy slash commands in all the servers the bot is in
node index.js # To start the ticket-bot
```
