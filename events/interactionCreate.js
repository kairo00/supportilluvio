const { getPasteUrl, PrivateBinClient } = require('@agc93/privatebin');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (interaction.customId == "open-ticket") {
      if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
        return interaction.reply({
          content: 'Tu as deja ouvert un ticket!',
          ephemeral: true
        });
      };

      interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
        parent: client.config.parentOpened,
        topic: interaction.user.id,
        permissionOverwrites: [{
            id: interaction.user.id,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: client.config.roleSupport,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        type: 'text',
      }).then(async c => {
        interaction.reply({
          content: `Ticket créé! <#${c.id}>`,
          ephemeral: true
        });

        const embed = new client.discord.MessageEmbed()
          .setColor('6d6ee8')
          .setAuthor(`Ticket de ${interaction.user.username}`, 'https://i.imgur.com/AIyLxgi.png')
          .setDescription('Selectionner la catégorie de votre ticket !')
          .setFooter(`${client.user.tag} || Illuvio Support 💙`, client.user.displayAvatarURL())
          .setTimestamp();

        const row = new client.discord.MessageActionRow()
          .addComponents(
            new client.discord.MessageSelectMenu()
            .setCustomId('category')
            .setPlaceholder('Selectionner la catégorie de votre ticket !')
            .addOptions([{
                label: 'Signaler',
                value: client.config.Category1,
                emoji: '🏳️',
                description: 'Signaler un abus.',
              },
              {
                label: 'Autres',
                value: client.config.Category2,
                emoji: '💬',
                description: 'Besoin d\'aide ?',
              },
              {
                label: 'suggestion',
                value: client.config.Category3,
                emoji: '📢',
                description: 'Donne nous des idées pour le serveur.',
              },
            ]),
          );

        msg = await c.send({
          content: `<@!${interaction.user.id}>`,
          embeds: [embed],
          components: [row]
        });

        const collector = msg.createMessageComponentCollector({
          componentType: 'SELECT_MENU',
          time: 20000 //20 seconds
        });

        collector.on('collect', i => {
          if (i.user.id === interaction.user.id) {
            if (msg.deletable) {
              msg.delete().then(async () => {
                const embed = new client.discord.MessageEmbed()
                  .setColor('6d6ee8')
                  .setAuthor('Ticket', interaction.user.displayAvatarURL())
                  .setDescription(`<@!${interaction.user.id}> a créé un ticket pour \`${i.values[0]}\``)
                  .setFooter(`${client.user.tag} || Illuvio Support 💙`, client.user.displayAvatarURL())
                  .setTimestamp();

                const row = new client.discord.MessageActionRow()
                  .addComponents(
                    new client.discord.MessageButton()
                    .setCustomId('close-ticket')
                    .setLabel('fermer')
                    .setEmoji('✖')
                    .setStyle('DANGER'),
                  );

                const opened = await c.send({
                  content: `<@&${client.config.roleSupport}>`,
                  embeds: [embed],
                  components: [row]
                });

                opened.pin().then(() => {
                  opened.channel.bulkDelete(1);
                });
              });
            };
          };
        });

        collector.on('end', collected => {
          if (collected.size < 1) {
            c.send(`Pas de catégories sélectionnées. Fermeture du ticket...`).then(() => {
              setTimeout(() => {
                if (c.deletable) {
                  c.delete();
                };
              }, 5000);
            });
          };
        });
      });
    };

    if (interaction.customId == "close-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('confirm-close')
          .setLabel('Fermer')
          .setStyle('DANGER'),
          new client.discord.MessageButton()
          .setCustomId('no')
          .setLabel('Annuler')
          .setStyle('SECONDARY'),
        );

      const verif = await interaction.reply({
        content: 'Veux-tu vraiment fermer le ticket ?',
        components: [row]
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 10000
      });

      collector.on('collect', i => {
        if (i.customId == 'confirm-close') {
          interaction.editReply({
            content: `Ticket fermé par <@!${interaction.user.id}>`,
            components: []
          });

          chan.edit({
              name: `closed-${chan.name}`,
              permissionOverwrites: [
                {
                  id: client.users.cache.get(chan.topic),
                  deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: client.config.roleSupport,
                  allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: interaction.guild.roles.everyone,
                  deny: ['VIEW_CHANNEL'],
                },
              ],
            })
            .then(async () => {
              const embed = new client.discord.MessageEmbed()
                .setColor('6d6ee8')
                .setAuthor('Ticket', 'https://i.imgur.com/AIyLxgi.png')
                .setDescription('```Bravo! tu lui as été d\'une grande aide!```')
                .setFooter(`${client.user.tag} || Illuvio Support 💙`, client.user.displayAvatarURL())
                .setTimestamp();

              const row = new client.discord.MessageActionRow()
                .addComponents(
                  new client.discord.MessageButton()
                  .setCustomId('delete-ticket')
                  .setLabel('Supprimer')
                  .setEmoji('🗑️')
                  .setStyle('DANGER'),
                );

              chan.send({
                embeds: [embed],
                components: [row]
              });
            });

          collector.stop();
        };
        if (i.customId == 'no') {
          interaction.editReply({
            content: 'Annulation de la fermeture!',
            components: []
          });
          collector.stop();
        };
      });

      collector.on('end', (i) => {
        if (i.size < 1) {
          interaction.editReply({
            content: 'Annulation de la fermeture!',
            components: []
          });
        };
      });
    };

    if (interaction.customId == "delete-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      interaction.reply({
        content: 'Sauvegarde...'
      });

      chan.messages.fetch().then(async (messages) => {
        let a = messages.filter(m => m.author.bot !== true).map(m =>
          `${new Date(m.createdTimestamp).toLocaleString('en-EN')} - ${m.author.username}#${m.author.discriminator}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`
        ).reverse().join('\n');
        if (a.length < 1) a = "Nothing"
        var paste = new PrivateBinClient("https://privatebin.net/");
        var result = await paste.uploadContent(a, {uploadFormat: 'markdown'})
            const embed = new client.discord.MessageEmbed()
              .setAuthor('Ticket Logs', 'https://i.imgur.com/AIyLxgi.png')
              .setDescription(`📰 Logs ticket \`${chan.id}\` | créé par <@!${chan.topic}> | fermé par <@!${interaction.user.id}>\n\nLogs: [**Voir les logs**](${getPasteUrl(result)})`)
              .setColor('2f3136')
              .setFooter("Les logs seront supprimés dans 24h !")
              .setTimestamp();

            const embed2 = new client.discord.MessageEmbed()
              .setAuthor('Ticket Logs', 'https://i.imgur.com/AIyLxgi.png')
              .setDescription(`📰 Logs ticket \`${chan.id}\`: [**Voir les logs**](${getPasteUrl(result)})`)
              .setColor('2f3136')
              .setFooter("Les logs seront supprimés dans 24h !")
              .setTimestamp();

            client.channels.cache.get(client.config.logsTicket).send({
              embeds: [embed]
            }).catch(() => console.log("Ticket log channel not found."));
            chan.send('Fermeture du channel...');

            setTimeout(() => {
              chan.delete();
            }, 5000);
          });
    };
  },
};