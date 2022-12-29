// PRECISA ARRUMAR

const Discord = require('discord.js');
const config = require("../config.json")
var ms = require('milliseconds');
const {
    JsonDatabase,
} = require("wio.db");

const db = new JsonDatabase({
  databasePath:"./databases/geral.json"
});
const db2 = new JsonDatabase({
    databasePath:"./databases/myJsonDatabase.json"
  });
module.exports = {
    name: 'rankcall',
    aliases: ['rk', 'top', 'leaderboard'],

    run: async (client, message, args) => {

        const embedcinc = new Discord.MessageEmbed()
            .setTitle("Erro - Permissão")
            .setDescription(`${message.author} Você não tem a permissão de: [\`ADMINISTRATOR\`]`)
            .setFooter({ text: `${config.nomebot} - Todos os direitos reservados.` })
            .setColor(config.cor)
        if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send({ embeds: [embedcinc] })



        var pagina = 0;
if(!args[0]) pagina = 1;
if(args[0]) pagina = args[0];
        async function rankTempocall(pagina, per_pagina) {

            const resp = await db.all().filter(data => data.ID.startsWith('gasto_')).sort((a, b) => b.data - a.data);

            var pagina = pagina || 1,
                per_pagina = per_pagina || 5,
                offset = (pagina - 1) * per_pagina,

                paginatedItems = resp.slice(offset).slice(0, per_pagina),
                total_pagina = Math.ceil(resp.length / per_pagina);

            let id = resp.slice('gasto_')

            var rankMensagem = ""
            for (var i in paginatedItems) {

                if (paginatedItems[i].data == undefined || paginatedItems[i].data == "") {

                } else {
                    let tempo = paginatedItems[i].data
                    
                    let nick = paginatedItems[i].ID.replace("gasto_", "")
                    if (message.guild.members.cache.get(nick)) {
                        nick = message.guild.members.cache.get(nick)
                        rankMensagem += `**${resp.indexOf(resp[i]) + 1}°** ${nick.user.tag} **• R$${tempo},00.**\n**ID:** \`${nick.id}\`\n\n`;
                    } else {
                    }
                }
            }

            let final = {
                pagina: pagina,
                per_pagina: per_pagina,
                pre_pagina: pagina - 1 ? pagina - 1 : null,
                next_page: (total_pagina > pagina) ? pagina + 1 : null,
                total: resp.length,
                total_pagina: total_pagina,
                data: paginatedItems,
                message: rankMensagem
            };

            if (rankMensagem == undefined || rankMensagem == "") rankMensagem = 'Não temos lista de compradores ainda.';

            const topembed = new Discord.MessageEmbed()
                .setColor(client.cor)
                .setTitle(`🏆 Ranking de Gastos`)
                .setDescription(rankMensagem)
            
                .setColor(config.cor)
            return message.reply({ embeds: [topembed] })
        }
        rankTempocall(pagina, 5)
    },
};