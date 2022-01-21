const chalk = require('chalk');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    client.user.setPresence({ activities: [{ name: `Illuvio Support`, type: `WATCHING` }], status: 'dnd' });
    console.log(chalk.blue('[Illuvio]') + chalk.blue('Discord support'))
    console.log(chalk.red('_________________________________________'))
    console.log(chalk.green('*') + chalk.cyan('Support'))
    console.log(chalk.green('Bot ') + chalk.cyan('Oppérationel'))
    console.log(chalk.red('_________________________________________'))
    const oniChan = client.channels.cache.get(client.config.ticketChannel)
  

    function sendTicketMSG() {
      const embed = new client.discord.MessageEmbed()
        .setColor('6d6ee8')
        .setAuthor('Illuvio Support | Demander un Ticket.', client.user.avatarURL())
        .setDescription('Salut,\nSi tu es ici c\'est que tu as besoin d\'aide!\nAvant de contacter le support d\'Illuvio nous te conseillons de lire les règles suivantes\n [**Voir les règles**](https://youtube.com)\n  pour éviter de déranger le support pour des questions inutiles.\nMerci à toi et passe de bons moment sur **Illuvio**!\nClique sur le bouton pour ouvrir un ticket.')
        .setFooter(`${client.user.tag} || Illuvio Support 💙`, client.user.displayAvatarURL())
      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('open-ticket')
          .setLabel(' Illuvio Support')
          .setEmoji('✉️')
          .setStyle('PRIMARY'),
        );

      oniChan.send({
        embeds: [embed],
        components: [row]
      })
    }
   


    oniChan.bulkDelete(100).then(() => {
      sendTicketMSG()
      console.log(chalk.green('[Illuvio]') + chalk.cyan(' Création du widget...'))
      
    })
  },
  
};
