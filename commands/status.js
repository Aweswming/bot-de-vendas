const Discord = require("discord.js")
const db = require("quick.db")
const config = require("../config.json")
const axios = require("axios")
module.exports = {
    
    name: "estoque", // Coloque o nome do comando do arquivo
    run: async(client, message, args) => {
        message.delete()
        const embederro = new Discord.MessageEmbed()
        .setTitle(`Erro - Permissão`)
        .setDescription(`Você não tem permissão para isto!`)
        .setColor(config.cor)
        .setFooter(`${config.nomebot} - Todos os direitos reservados.`)
                if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send({ embeds: [embederro] }).then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                })
                axios.get(`https://api.mercadolibre.com/collections/notifications/${args[0]}`, {
                                                                    headers: {
                                                                        'Authorization': `Bearer ${config.access_token}`
                                                                    }
                                                                }).then(async (doc) => {
                                                                    console.log(doc)
                                                                    if(doc.data.collection.status === "approved") {
                                                                      var msg = "Aprovado";
                                                                    } else {
                                                                       var msg = "Cancelado";
                                                                    }
message.channel.send(`Status: ${msg}\nRecebido: R$${doc.data.collection.transaction_amount},00`)
                                                                }).catch(e => {
                                                                    console.log(e)
                                                                    message.channel.send("Erro")
                                                                })

    }
}