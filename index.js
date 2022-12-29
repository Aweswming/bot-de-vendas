const Discord = require("discord.js");
const client = new Discord.Client({ intents: 32767 });
const config = require("./config.json");
const mercadopago = require("mercadopago")
const db = require("quick.db")
const axios = require("axios")
const { joinVoiceChannel } = require('@discordjs/voice');

const {
    JsonDatabase,
} = require("wio.db");

const db2 = new JsonDatabase({
  databasePath:"./databases/myJsonDatabase.json"
});
const moment = require("moment")


moment.locale("pt-br");
client.login(config.TOKEN);

client.once('ready', async () => {

    console.log("✅ - Estou online!")

})



  //ENTRADA NO SERIVODR
  client.on("guildMemberAdd", async (member) => {

    let guild = client.guilds.cache.get("ID do servidor");
    let channel = client.channels.cache.get("Id do chat");
  
    if (guild != member.guild) {
  
      return console.log ("Um membro entrou em outro servidor");
  
    } else {
  
      
      let entrada = new Discord.MessageEmbed()
      .setDescription(`** ${member.user.tag}\n\nEntrou no grupo\n\nAtualmente estamos com ${guild.memberCount} usuários.**`)
      .setAuthor (member.user.tag, member.user.displayAvatarURL())
      .setColor("3c186e")
      .setThumbnail(member.user.displayAvatarURL ({dynamic: true, format: "png", size: 1024}))
      .setFooter('ID do usuário: ' + member.user.id)
      .setTimestamp();
  
      await channel.send({ embeds: [entrada] })
    }
  
  });

client.on("ready", () => {

    let channel = client.channels.cache.get(config.canalvoz);

    joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    })

    console.log("✅ - Entrei no canal de vóz [" + channel.name + "] com sucesso.")
});

client.on("ready", () => {
    let activities = [
        ``,
      ],
      i = 0;
    setInterval( () => client.user.setActivity(`${activities[i++ % activities.length]}`, {
          type: "PLAYING"
        }), 30000); // Aqui e o tempo de troca de status, esta e mili segundos 
    client.user
        .setStatus("streaming")
  });



process.on('multipleResolves', (type, reason, promise) => {
    console.log(`🚫 Erro Detectado\n\n` + type, promise, reason)
});
process.on('unhandRejection', (reason, promise) => {
    console.log(`🚫 Erro Detectado:\n\n` + reason, promise)
});
process.on('uncaughtException', (error, origin) => {
    console.log(`🚫 Erro Detectado:\n\n` + error, origin)
});
process.on('uncaughtExceptionMonitor', (error, origin) => {
    console.log(`🚫 Erro Detectado:\n\n` + error, origin)
});



client.on('messageCreate', message => {
    if (message.author.bot) return;
    if (message.channel.type == 'dm') return;
    if (!message.content.toLowerCase().startsWith(config.prefix.toLowerCase())) return;
    if (message.content.startsWith(`<@!${client.user.id}>`) || message.content.startsWith(`<@${client.user.id}>`)) return;

    const args = message.content
        .trim().slice(config.prefix.length)
        .split(/ +/g);
    const command = args.shift().toLowerCase();

    try {
        const commandFile = require(`./commands/${command}.js`)
        commandFile.run(client, message, args);
    } catch (err) {
        console.log(err);
    }
});


client.on("interactionCreate", (interaction) => {
    if (interaction.isButton()) {

        const eprod = db.get(interaction.customId);
        if (!eprod) return;
        const severi = interaction.customId;
        if (eprod) {
            const quantidade = db.get(`${severi}.conta`).length;



            const row = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId(interaction.customId)
                        .setLabel('Comprar')
                        .setEmoji("🛒")
                        .setStyle(config.botao),
                );
            const embed = new Discord.MessageEmbed()
                .setTitle(`${config.nomebot} | Produto`)
                .setDescription(`\`\`\`${db.get(`${interaction.customId}.desc`)}\`\`\`\n🛒 **Produto:** **__${db.get(`${interaction.customId}.nome`)}__**\n💵 **Preço:** **R$${db.get(`${interaction.customId}.preco`)}**\n📦 **Estoque:** **${db.get(`${interaction.customId}.conta`).length}**`)
                .setColor(config.cor)
                .setFooter("Para comprar clique no botão abaixo.")
                .setImage(config.fotoembed)
            interaction.message.edit({ embeds: [embed], components: [row] })


            const embedsemstock = new Discord.MessageEmbed()
                .setTitle(`Sistema de Vendas`)
                .setDescription(`Este produto está sem estoque, aguarde um reabastecimento!`)
                .setColor(config.cor)
                .setImage(config.fotoembed)
            if (quantidade < 1) return interaction.reply({
                embeds: [embedsemstock],
                ephemeral: true
            });

            interaction.guild.channels.create(`carrinho-${interaction.user.username}`, {
                type: "GUILD_TEXT",
                parent: config.catecarrinho,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS"]
                    },
                    {
                        id: interaction.user.id,
                        allow: ["VIEW_CHANNEL"],
                        deny: ["SEND_MESSAGES"]
                    }
                ]
            }).then(c => {
                interaction.reply({embeds: [], ephemeral: true})
                const timer1 = setTimeout(function () {
                    
                    c.delete()
                }, 300000)
                c.setTopic(interaction.user.id)
                const emessage = c.send({ content: `<@${interaction.user.id}>` }).then(msg => {
                    setTimeout(() => msg.delete(), 1000)
                })

                const row2 = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('pix')
                        .setLabel('Finalizar compra')
                        .setEmoji("🛒")
                        .setStyle(config.botao),
                )
               //.addComponents(
               //    new Discord.MessageButton()
               //        .setCustomId('btc')
               //        .setEmoji("977055592722079744")
               //        .setStyle(config.botao)
               //        .setDisabled(true),
               //)
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('cancelar')
                        .setLabel('Cancelar')
                        .setEmoji("1017881056113856658")
                        .setStyle(config.botao),
                );
                const embed2 = new Discord.MessageEmbed()
                .setTitle(`COMPRANDO ${eprod.nome}`)
                .setDescription(`Seja bem-vindo(a) ao nosso sistema de compras, leiam os termos de compra para não ter dúvidas. Os termos estão no canal <#1025089601750188162>!\n\nSelecione **Finalizar compra** para continuar com sua compra na loja.`)
                .setColor(config.cor)
            c.send({ embeds: [embed2], components: [row2] }).then(msg => {
                const filter = i => i.user.id === interaction.user.id;
                const collector = msg.channel.createMessageComponentCollector({ filter });
                collector.on("collect", interaction2 => {
                
                
                        if (interaction2.customId == 'pix') {
                            clearInterval(timer1)
                            const timer2 = setTimeout(function () {
                    
                                c.delete()
                            }, 300000)
                            msg.delete()
                            let quantidade1 = 1;
                            let precoalt = eprod.preco;
                            const row = new Discord.MessageActionRow()
                                .addComponents(
                                    new Discord.MessageButton()
                                        .setCustomId('addboton')
                                        .setLabel('Produto')
                                        .setEmoji("1017879627999481897")
                                        .setStyle(config.botao),
                                )
                                .addComponents(
                                    new Discord.MessageButton()
                                        .setCustomId('removeboton')
                                        .setLabel('Produto')
                                        .setEmoji("1017879728700522608")
                                        .setStyle(config.botao),
                                )
                                .addComponents(
                                    new Discord.MessageButton()
                                        .setCustomId('comprarboton')
                                        .setLabel('Pagar')
                                        .setEmoji("1010343950986514503")
                                        .setStyle(config.botao),
                                )
                                .addComponents(
                                    new Discord.MessageButton()
                                        .setCustomId('cancelar')
                                        .setLabel('Cancelar')
                                        .setEmoji("1017881056113856658")
                                        .setStyle(config.botao),
                                );
                            const embedss = new Discord.MessageEmbed()
                                .setTitle(`Informações de Compra`)
                                .setDescription(`🛒 **Produto:** ${eprod.nome}\n📦 **Quantidade:** ${quantidade1}\n💸 **Preço:** R$${precoalt}\n\n**Lembre-se de deixar seu privado aberto para receber o backup do seu produto.**\n\n❗ As entregas são feitas automaticamente pelo BOT, se tiver dúvidas ou problema comunique a nossa equipe. Vá até <#977971612290797619> para nos contatar.`)
                                .setColor(config.cor)
                            interaction2.channel.send({ embeds: [embedss], components: [row], fetchReply: true }).then(msg => {
                                const filter = i => i.user.id === interaction2.user.id;
                                const collector = msg.createMessageComponentCollector({ filter });
                                collector.on("collect", intera => {
                                    intera.deferUpdate()
                                    if (intera.customId === "addboton") {

                                        const embedadici = new Discord.MessageEmbed()
                                            .setDescription(`Você não pode adicionar um valor maior do que o estoque`)
                                            .setColor(config.cor)
                                        if (quantidade1++ >= quantidade) {
                                            quantidade1--;

                                            intera.channel.send({ embeds: [embedadici] })
                                            const embedss2 = new Discord.MessageEmbed()
                                                .setTitle(`Sistema de Compras`)
                                                .setDescription(`🛒 **Produto:** ${eprod.nome}\n📦 **Quantidade:** ${quantidade1}\n💸 **Preço:** R$${precoalt}\n\n❗ As entregas são feitas automaticamente pelo BOT, se tiver dúvidas ou problema comunique a nossa equipe. Vá até <#977971612290797619> para nos contatar.`)
                                                .setColor(config.cor)
                                            msg.edit({ embeds: [embedss2] })
                                        } else {
                                            precoalt = Number(precoalt) + Number(eprod.preco);
                                            const embedss = new Discord.MessageEmbed()
                                                .setTitle(`Sistema de Compras`)
                                                .setDescription(`🛒 **Produto:** ${eprod.nome}\n📦 **Quantidade:** ${quantidade1}\n💸 **Preço:** R$${precoalt}\n\n❗ As entregas são feitas automaticamente pelo BOT, se tiver dúvidas ou problema comunique a nossa equipe. Vá até <#977971612290797619> para nos contatar.`)
                                                .setColor(config.cor)
                                            msg.edit({ embeds: [embedss] })
                                        }
                                    }
                                    if (intera.customId === "removeboton") {
                                        if (quantidade1 <= 1) {
                                            const embedadici = new Discord.MessageEmbed()
                                                .setDescription(`Você não pode remover mais produtos`)
                                                .setColor(config.cor)

                                            intera.channel.send({ embeds: [embedadici] })

                                        } else {
                                            precoalt = precoalt - eprod.preco;
                                            quantidade1--;
                                            const embedss = new Discord.MessageEmbed()
                                                .setTitle(`Sistema de Compras`)
                                                .setDescription(`🛒 **Produto:** ${eprod.nome}\n📦 **Quantidade:** ${quantidade1}\n💸 **Preço:** R$${precoalt}\n\n❗ As entregas são feitas automaticamente pelo BOT, se tiver dúvidas ou problema comunique a nossa equipe. Vá até <#977971612290797619> para nos contatar.`)
                                                .setColor(config.cor)
                                            msg.edit({ embeds: [embedss] })
                                        }
                                    }
                                    if (intera.customId === "comprarboton") {
                                        clearInterval(timer2)
msg.channel.bulkDelete(50);
                                        mercadopago.configurations.setAccessToken(config.access_token);
                                        var payment_data = {
                                            transaction_amount: Number(precoalt),
                                            description: `Pagamento - ${interaction2.user.username}`,
                                            payment_method_id: 'pix',
                                            payer: {
                                                email: 'paulaguimaraes2906@gmail.com',
                                                first_name: 'Paula',
                                                last_name: 'Guimaraes',
                                                identification: {
                                                    type: 'CPF',
                                                    number: '07944777984'
                                                },
                                                address: {
                                                    zip_code: '06233200',
                                                    street_name: 'Av. das Nações Unidas',
                                                    street_number: '3003',
                                                    neighborhood: 'Bonfim',
                                                    city: 'Osasco',
                                                    federal_unit: 'SP'
                                                }
                                            }
                                        };

                                        mercadopago.payment.create(payment_data).then(function (data) {
                                            const buffer = Buffer.from(data.body.point_of_interaction.transaction_data.qr_code_base64, "base64");
                                            const attachment = new Discord.MessageAttachment(buffer, "payment.png");
                                            const row = new Discord.MessageActionRow()
                                                .addComponents(
                                                    new Discord.MessageButton()
                                                        .setCustomId('codigo')
                                                        .setEmoji("1017886089689710693")
                                                        .setLabel("PIX COPIA E COLA")
                                                        .setStyle(config.botao),
                                                )
                                                .addComponents(
                                                    new Discord.MessageButton()
                                                        .setCustomId('cancelarpix')
                                                        .setEmoji("1017881056113856658")
                                                        .setLabel("Cancelar")
                                                        .setStyle(config.botao),
                                                );
                                            const embed = new Discord.MessageEmbed()
                                                .setTitle(`Sistema de pagamento`)
                                                .setDescription(`- Efetue o pagamento de \`${eprod.nome}\` escaneando o QR Code abaixo.\n\n> Caso prefira efetuar o pagamento copiando e colando o código em seu aplicativo do banco, clique no botão “<:pix:977968666324926534>”, o bot irá enviar nesse chat o código do seu pagamento.`)
                                                .setImage("attachment://payment.png")
                                                .setColor(config.cor)
                                                .setFooter("Após efetuar o pagamento, o tempo de entrega é de no maximo 1 minuto!")
                                            msg.channel.send({ embeds: [embed], files: [attachment], components: [row] }).then(msg => {

                                                const collector = msg.channel.createMessageComponentCollector();
                                                const lopp = setInterval(function () {
                                                    const time2 = setTimeout(function () {
                                                        clearInterval(lopp);
                                                        msg.channel.delete()
                                                    }, 300000)
                                                    axios.get(`https://api.mercadolibre.com/collections/notifications/${data.body.id}`, {
                                                        headers: {
                                                            'Authorization': `Bearer ${config.access_token}`
                                                        }
                                                    }).then(async (doc) => {

                                                        if (doc.data.collection.status === "approved") {
                                                            clearTimeout(time2)
                                                            clearInterval(lopp);
                                                            msg.channel.bulkDelete(50);
                                                            const a = db.get(`${severi}.conta`);
                                                            const embederror = new Discord.MessageEmbed()
                                                                .setTitle(`Compra aprovada`)
                                                                .setDescription(`\`\`\`Infelizmente alguem comprou esse produto antes de você, mande mensagem para algum dos staffs e apresente o codigo: [${data.body.id}]\`\`\``)
                                                                .setColor(config.cor)

                                                                db2.add("pedidostotal", 1)
                                                                db2.add("gastostotal", Number(precoalt))
                                                                
                                                                db2.add(`${moment().format('L')}.pedidos`, 1)
                                                                db2.add(`${moment().format('L')}.recebimentos`, Number(precoalt))
                                                                
                                                                db2.add(`${interaction.user.id}.gastosaprovados`, Number(precoalt))
                                                                db2.add(`${interaction.user.id}.pedidosaprovados`, 1)

                                                            if (a < quantidade1) {
                                                                interaction2.channel.send({ embeds: [embederror] })
                                                                client.channels.cache.get(config.canallogs).send(`Ocorreu um erro na compra do: <@${interaction.user.id}>, Valor da compra: ${precoalt}`)
                                                            } else {
                                                            const removed = a.splice(0, Number(quantidade1));
                                                            db.set(`${severi}.conta`, a);

                                                            const embedentrega = new Discord.MessageEmbed()
                                                                .setTitle(`${config.nomebot} | Entrega`)
                                                                .setDescription(`\`\`\`${removed.join("\n")}\`\`\`\n❗ Foi enviado um backup em seu privado, para avaliar a loja vá até <#977970031793152002> e <#977968223913914458>`)
                                                                .setColor(config.cor)

                                                            interaction.user.send({ embeds: [embedentrega] }).catch(() => {});
                                                            msg.channel.send({ embeds: [embedentrega] })

                                                            const membro = interaction.guild.members.cache.get(interaction.user.id)
                                                            const role = interaction.guild.roles.cache.find(role => role.id === config.cargovip)
                                                            membro.roles.add(role)
                                                            setTimeout(() => interaction2.channel.delete(), 300000)
                                                            const embedcompraaprovada = new Discord.MessageEmbed()
                                                                .setTitle(`Compra aprovada`)
                                                                .addField(`ID PEDIDO:`, `${data.body.id}`)
                                                                .addField(`COMPRADOR:`, `<@${interaction.user.id}>`, true)
                                                                .addField(`ID COMPRADOR:`, `\`${interaction.user.id}\``, true)
                                                                .addField(`DATA:`, `\`${moment().format('LLLL')}\``)
                                                                .addField(`PRODUTO ID:`, `\`${severi}\``, true)
                                                                .addField(`PRODUTO NOME:`, `\`${eprod.nome}\``, true)
                                                                .addField(`VALOR PAGO:`, `\`R$${precoalt}\``, true)
                                                                .addField(`QUANTIDADE COMPRADO:`, `\`${quantidade1}\``)
                                                                .addField(`PRODUTO ENTREGUE: `, `\`\`\`${removed.join(" \n")}\`\`\``)
                                                                .setColor(config.cor)

                                                            client.channels.cache.get(config.canallogs).send({ embeds: [embedcompraaprovada] })

                                                            const embedaprovadolog = new Discord.MessageEmbed()
                                                            .setDescription(`👤 **Comprador:** ${interaction.user}\n🛒 **Produto Comprado:** \`${eprod.nome}\`\n📦 Quantidade: \`${quantidade1}\`\n💵 Valor Pago: \`${precoalt}\``)
                                                            .setColor(config.cor)
                                                            .setImage(config.fotoembed)
                                                            client.channels.cache.get(config.logpublica).send({embeds: [embedaprovadolog]})

                                                            const row2 = new Discord.MessageActionRow()
                                                                .addComponents(
                                                                    new Discord.MessageButton()
                                                                        .setCustomId(interaction.customId)
                                                                        .setLabel('Comprar')
                                                                        .setEmoji("🛒")
                                                                        .setStyle(config.botao),
                                                                );
                                                            const embed2 = new Discord.MessageEmbed()
                                                                .setTitle(`${config.nomebot} | Produto`)
                                                                .setDescription(`\`\`\`${db.get(`${interaction.customId}.desc`)}\`\`\`\n🛒 **Produto:** **__${db.get(`${interaction.customId}.nome`)}__**\n💵 **Preço:** **R$${db.get(`${interaction.customId}.preco`)}**\n📦 **Estoque:** **${db.get(`${interaction.customId}.conta`).length}**`)
                                                                .setColor(config.cor)
                                                                .setFooter("Para comprar clique no botão abaixo.")
                                                                .setImage(config.fotoembed)
                                                            interaction.message.edit({ embeds: [embed2], components: [row2] })
                                                        }}
                                                    })
                                                }, 10000)
                                                collector.on("collect", interaction => {
                                                    if (interaction.customId === 'codigo') {
                                                        interaction.deferUpdate();
                                                        const row = new Discord.MessageActionRow()
                                                    
                                                        .addComponents(
                                                            new Discord.MessageButton()
                                                                .setCustomId('cancelarpix')
                                                                .setEmoji("1017881056113856658")
                                                                .setLabel('Cancelar')
                                                                .setStyle(config.botao),
                                                        );
                                                        const embed = new Discord.MessageEmbed()
                                                            .setTitle(`Sistema de pagamento`)
                                                            .setDescription(`- Efetue o pagamento de \`${eprod.nome}\` escaneando o QR Code abaixo.`)
                                                            .setImage("attachment://payment.png")
                                                            .setColor(config.cor)
                                                            .setFooter("Após efetuar o pagamento, o tempo de entrega é de no maximo 1 minuto!")
                                                        msg.edit({ embeds: [embed], files: [attachment], components: [row] })
                                                        interaction.channel.send(data.body.point_of_interaction.transaction_data.qr_code)
                                                    }
                                                    if (interaction.customId === 'cancelarpix') {
                                                        clearInterval(lopp);
                                                        interaction.channel.delete()
                                                    }
                                                })
                                            })
                                        }).catch(function (error) {
                                            console.log(error)
                                        });





                                    }
                                })
                            })
                        }
                        if (interaction2.customId == 'cancelar') {
                            clearInterval(timer1);
                            interaction2.channel.delete();
                        }
                    })
                })
            })
        }



    }
})




client.on('interactionCreate', async interaction => {
    
    if (!interaction.isSelectMenu()) return;

    if (interaction.customId === 'gerenciar') {
        interaction.deferUpdate();
        const adb = interaction.values[0];
        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('precogerenciar')
                    .setLabel('PREÇO')
                    .setStyle('SECONDARY'),
            )
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('nomegerenciar')
                    .setLabel('NOME')
                    .setStyle('SECONDARY'),
            )
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('estoquegerenciar')
                    .setLabel('ESTOQUE')
                    .setStyle('SECONDARY'),
            )
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('descgerenciar')
                    .setLabel('DESCRIÇÃO')
                    .setStyle('SECONDARY'),
            ).addComponents(
                new Discord.MessageButton()
                    .setCustomId('deletegerenciar')
                    .setLabel('DELETAR')
                    .setStyle('SECONDARY'),
            );
        const embed = new Discord.MessageEmbed()
            .setTitle(`Gerenciar Produto`)
            .setDescription(`Produto sendo gerenciado: ${adb}`)
            .setColor(config.cor)
            .setFooter({ text: `Todos os direitos reservados.` })
        interaction.message.edit({ embeds: [embed], components: [row] }).then(msg => {
            const filter = i => i.user.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({ filter });
            collector.on("collect", interaction => {
                if (interaction.customId === "deletegerenciar") {
                    msg.delete()
                    db.delete(adb)
                    const row = new Discord.MessageActionRow()
                        .addComponents(
                            new Discord.MessageSelectMenu()
                                .setCustomId('gerenciar')
                                .setPlaceholder('Selecione uma opção')
                                .addOptions(db.all().map(item => ({ label: `ID: ${item.ID} - PREÇO: R$${item.data.preco}`, description: `NOME: ${item.data.nome || "Sem nome"}`, value: item.ID }))),
                        );
                    const embed = new Discord.MessageEmbed()
                        .setDescription(`Olá, para você gerenciar um produto\nselecione o menu abaixoe clique no produto\nque você quer gerenciar :)`)
                        .setColor(config.cor)
                    msg.edit({ embeds: [embed], components: [row] })
                }
                if (interaction.customId === "precogerenciar") {
                    msg.delete()
                    const embedpreco = new Discord.MessageEmbed()
                        .setTitle(`Gerenciar Produto`)
                        .setDescription(`Envie o novo preço abaixo`)
                        .setColor(config.cor)
                    interaction.channel.send({ embeds: [embedpreco] }).then(msg => {
                        const filter = m => m.author.id === interaction.user.id;
                        const collector = msg.channel.createMessageCollector({ filter, max: 1 });
                        collector.on("collect", message => {
                            message.delete()
                            db.set(`${adb}.preco`, [`${message.content}`])

                            const row = new Discord.MessageActionRow()
                                .addComponents(
                                    new Discord.MessageSelectMenu()
                                        .setCustomId('gerenciar')
                                        .setPlaceholder('Selecione uma opção')
                                        .addOptions(db.all().map(item => ({ label: `ID: ${item.ID} - PREÇO: R$${item.data.preco}`, description: `NOME: ${item.data.nome || "Sem nome"}`, value: item.ID }))),
                                );
                            const embed = new Discord.MessageEmbed()
                                .setDescription(`Olá, para você gerenciar um produto\nselecione o menu abaixoe clique no produto\nque você quer gerenciar :)`)
                                .setColor(config.cor)
                            msg.edit({ embeds: [embed], components: [row] })
                        })
                    })
                }
                if (interaction.customId === "nomegerenciar") {
                    msg.delete()
                    const embednome = new Discord.MessageEmbed()
                        .setTitle(`Gerenciar Produto`)
                        .setDescription(`Envie o novo nome abaixo`)
                        .setColor(config.cor)
                    interaction.channel.send({ embeds: [embednome] }).then(msg => {
                        const filter = m => m.author.id === interaction.user.id;
                        const collector = msg.channel.createMessageCollector({ filter, max: 1 });
                        collector.on("collect", message => {
                            db.set(`${adb}.nome`, [`${message.content}`])
                            const row = new Discord.MessageActionRow()
                                .addComponents(
                                    new Discord.MessageSelectMenu()
                                        .setCustomId('gerenciar')
                                        .setPlaceholder('Selecione uma opção')
                                        .addOptions(db.all().map(item => ({ label: `ID: ${item.ID} - PREÇO: R$${item.data.preco}`, description: `NOME: ${item.data.nome || "Sem nome"}`, value: item.ID }))),
                                );
                            const embed = new Discord.MessageEmbed()
                                .setDescription(`Olá, para você gerenciar um produto\nselecione o menu abaixoe clique no produto\nque você quer gerenciar :)`)
                                .setColor(config.cor)
                            msg.edit({ embeds: [embed], components: [row] })
                        })
                    })
                }
                if (interaction.customId === "estoquegerenciar") {
                    msg.delete()
                    const itens = db.get(`${adb}.conta`);
                    const row2 = new Discord.MessageActionRow()
                        .addComponents(
                            new Discord.MessageButton()
                                .setCustomId('adicionarest')
                                .setLabel('ADICIONAR')
                                .setStyle('SECONDARY'),
                        )
                        .addComponents(
                            new Discord.MessageButton()
                                .setCustomId('removerest')
                                .setLabel('REMOVER')
                                .setStyle('SECONDARY'),
                        );
                    const embedest = new Discord.MessageEmbed()
                        .setTitle(`Gerenciar Produto`)
                        .setDescription(`Este é seu estoque: \`\`\`${itens.join(" \n") || "Sem estoque, adicione"}\`\`\``)
                        .setColor(config.cor)
                    interaction.channel.send({ embeds: [embedest], components: [row2] }).then(msg => {
                        const filter = i => i.user.id === interaction.user.id;
                        const collector = msg.createMessageComponentCollector({ filter });
                        collector.on("collect", interaction => {
                            if (interaction.customId === "adicionarest") {
                                const embede = new Discord.MessageEmbed().setDescription(`Envie o produto de um em um, quando terminar de enviar digite: "finalizar"`).setColor(config.cor);
                                msg.edit({ embeds: [embede], components: [] }).then(msg => {
                                    const filter = m => m.author.id === interaction.user.id;
                                    const collector = msg.channel.createMessageCollector({ filter })
                                    collector.on("collect", message => {

                                        if (message.content === "finalizar") {
                                            collector.stop();
                                            const itens = db.get(`${adb}.conta`);
                                            const embedfinalizar = new Discord.MessageEmbed()
                                                .setTitle(`Estoque adicionado`)
                                                .setDescription(`Seu novo estoque agora é: \n\`\`\`${itens.join(" \n")}\`\`\``)
                                                .setColor(config.cor)
                                            interaction.channel.send({ embeds: [embedfinalizar] })
                                            const row = new Discord.MessageActionRow()
                                                .addComponents(
                                                    new Discord.MessageSelectMenu()
                                                        .setCustomId('gerenciar')
                                                        .setPlaceholder('Selecione uma opção')
                                                        .addOptions(db.all().map(item => ({ label: `ID: ${item.ID} - PREÇO: R$${item.data.preco}`, description: `NOME: ${item.data.nome || "Sem nome"}`, value: item.ID }))),
                                                );
                                            const embed = new Discord.MessageEmbed()
                                                .setDescription(`Olá, para você gerenciar um produto\nselecione o menu abaixoe clique no produto\nque você quer gerenciar :)`)
                                                .setColor(config.cor)
                                            msg.channel.send({ embeds: [embed], components: [row] })
                                        } else {

                                            message.delete()

                                            db.push(`${adb}.conta`, [`${message.content}`])
                                        }
                                    })
                                })
                            }
                            if (interaction.customId === "removerest") {
                                const embedest = new Discord.MessageEmbed()
                                    .setTitle(`Gerenciar Produto`)
                                    .setDescription(`Este é seu estoque: \`\`\`${itens.join(" \n") || "Sem estoque"}\`\`\`\n**Para remover um item você irá enviar a linha do produto!**`)
                                    .setColor(config.cor)
                                msg.edit({ embeds: [embedest], components: [] }).then(msg => {
                                    const filter = m => m.author.id === interaction.user.id;
                                    const collector = msg.channel.createMessageCollector({ filter, max: 1 })
                                    collector.on("collect", message1 => {
                                        const a = db.get(`${adb}.conta`);
                                        a.splice(message1.content, 1)
                                        db.set(`${adb}.conta`, a);
                                        const itens2 = db.get(`${adb}.conta`);
                                        const embedest2 = new Discord.MessageEmbed()
                                            .setTitle(`Gerenciar Produto`)
                                            .setDescription(`Este é seu novo estoque: \`\`\`${itens2.join(" \n") || "Sem estoque"}\`\`\``)
                                            .setColor(config.cor)
                                        msg.channel.send({ embeds: [embedest2] })
                                        const row = new Discord.MessageActionRow()
                                            .addComponents(
                                                new Discord.MessageSelectMenu()
                                                    .setCustomId('gerenciar')
                                                    .setPlaceholder('Selecione uma opção')
                                                    .addOptions(db.all().map(item => ({ label: `ID: ${item.ID} - PREÇO: R$${item.data.preco}`, description: `NOME: ${item.data.nome || "Sem nome"}`, value: item.ID }))),
                                            );
                                        const embed = new Discord.MessageEmbed()
                                            .setDescription(`Olá, para você gerenciar um produto\nselecione o menu abaixoe clique no produto\nque você quer gerenciar :)`)
                                            .setColor(config.cor)
                                        msg.channel.send({ embeds: [embed], components: [row] })
                                    })
                                })
                            }
                        })
                    })
                }
                if (interaction.customId === "descgerenciar") {
                    msg.delete()
                    const embeddesc = new Discord.MessageEmbed()
                        .setTitle(`Gerenciar Produto`)
                        .setDescription(`Envie a nova descrição abaixo`)
                        .setColor(config.cor)
                    interaction.channel.send({ embeds: [embeddesc] }).then(msg => {
                        const filter = m => m.author.id === interaction.user.id;
                        const collector = msg.channel.createMessageCollector({ filter, max: 1 });
                        collector.on("collect", message => {
                            message.delete()
                            db.set(`${adb}.desc`, [`${message.content}`])
                            const row = new Discord.MessageActionRow()
                                .addComponents(
                                    new Discord.MessageSelectMenu()
                                        .setCustomId('gerenciar')
                                        .setPlaceholder('Selecione uma opção')
                                        .addOptions(db.all().map(item => ({ label: `ID: ${item.ID} - PREÇO: R$${item.data.preco}`, description: `NOME: ${item.data.nome || "Sem nome"}`, value: item.ID }))),
                                );
                            const embed = new Discord.MessageEmbed()
                                .setDescription(`Olá, para você gerenciar um produto\nselecione o menu abaixoe clique no produto\nque você quer gerenciar :)`)
                                .setColor(config.cor)
                            msg.edit({ embeds: [embed], components: [row] })
                        })
                    })
                }
            })
        })
    }
});