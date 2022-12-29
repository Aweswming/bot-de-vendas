const Discord = require("discord.js")
const cor = require("../config.json").cor;
const config = require("../config.json")
const db = require("quick.db")
module.exports = {
    
    run: async(client, message, args) => {
        
        const embederro = new Discord.MessageEmbed()
        .setTitle(`Erro - Permissão`)
        .setDescription(`Você não tem permissão para isto!`)
        .setColor(config.cor)
        .setFooter(`${config.nomebot} - Todos os direitos reservados.`)
                if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send({ embeds: [embederro] })
                const embednprod = new Discord.MessageEmbed()
                .setTitle("Erro - Sistema de Gerenciar")
                .setDescription("Você não tem nenhum produto adicionado, utilize \`[/add]\` para criar o produto!")
                .setColor(config.cor)
                
                if(db.all().length == 0) return message.channel.send({embeds: [embednprod]}).then(msg => {
                    message.delete()
                    setTimeout(() => msg.delete(), 10000)
                })
                message.delete()
        const row = new Discord.MessageActionRow()
.addComponents(
    new Discord.MessageSelectMenu()
        .setCustomId('gerenciar')
        .setPlaceholder('Selecione uma opção')
        .addOptions(db.all().map(item => ({ label: `ID: ${item.ID}`, description: `NOME: ${item.data.nome || "Sem nome"} - PREÇO: R$${item.data.preco},00`, value: item.ID }))),
);
const embed = new Discord.MessageEmbed()
.setTitle(`Gerenciar estoque`)
.setDescription(`Escolha qual produto você deseja gerenciar.`)
.setColor(config.cor)
message.channel.send({embeds: [embed], components: [row]})
    }
}