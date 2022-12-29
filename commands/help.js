const Discord = require("discord.js")
const db = require("quick.db")
const config = require("../config.json")
module.exports = {
    name: "stock", // Coloque o nome do comando do arquivo
    run: async(client, message, args) => {
        const embederro = new Discord.MessageEmbed()
        .setTitle(`Erro - Permissão`)
        .setDescription(`Você não tem permissão para isto!`)
        .setColor(config.cor)
        .setFooter(`Todos os direitos reservados.`)
                if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send({ embeds: [embederro] })
        const embed = new Discord.MessageEmbed()
        .setTitle(`${config.nomebot} | Comandos do Bot`)
        .addField(`${config.prefix}help`, `\`Exibe está mensagem\``)
        .addField(`${config.prefix}add`, `\`Cria um produto para venda\``)
        .addField(`${config.prefix}stock`, `\`Mostra todos os produtos que você tem a venda\``)
        .addField(`${config.prefix}stockid \`ID\``, `\`Mostra o estoque do produto que você colocou o ID\``)
        .addField(`${config.prefix}set \`ID\``, `\`Cria a mensagem de compra do produto\``)
        .addField(`${config.prefix}gerenciar`, `\`Gerencia os produtos nome, preço e estoque do produto\``)
        .addField(`${config.prefix}limpar`, `\`Limpa as mensagens do canal\``)
        .addField(`${config.prefix}estatisticas`, `\`Mostra as estatisticas de suas vendas\``)
        .addField(`${config.prefix}perfil`, `\`Mostra o perfil de quem enviou o comando(liberado para todos os usuarios)\``)
        .addField(`${config.prefix}rank`, `\`Mostra o rank de pessoas que mais compraram\``)
.setColor(config.cor)
message.channel.send({embeds: [embed]})
        
    }
}