require('dotenv').config()
const { Telegraf } = require('telegraf')
const crypto = require('crypto')
const bot = new Telegraf(process.env.TOKEN)

process.env.TZ = "Asia/Jakarta";

//database
const db = require('./config/connection')
const collection = require('./config/collection')
const saver = require('./database/filesaver')
const helpcommand = require('./help.js')

//DATABASE CONNECTION 
db.connect((err) => {
    if(err) { console.log('error connection db' + err); }
    else { console.log('db connected'); }
})

//ID Channel/Group
const channelId = `${process.env.CHANNELJOIN}`;

function today(ctx){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var hours = today.getHours();
    var minutes = today.getMinutes();
    var seconds = today.getSeconds();
    return today = mm + '/' + dd + '/' + yyyy + ' ' + hours + ':' + minutes + ':' + seconds;
}

function today2(ctx){
    var today2 = new Date();
    var dd2 = String(today2.getDate()).padStart(2, '0');
    var mm2 = String(today2.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy2 = today2.getFullYear();
    var hours2 = today2.getHours();
    var minutes2 = today2.getMinutes();
    var seconds2 = today2.getSeconds();
    return today2 = mm2 + '/' + dd2 + '/' + yyyy2 + '-' + hours2 + ':' + minutes2 + ':' + seconds2;
}

//Function
function first_name(ctx){
    return `${ctx.from.first_name ? ctx.from.first_name : ""}`;
}
function last_name(ctx){
    return `${ctx.from.last_name ? ctx.from.last_name : ""}`;
}
function username(ctx){
    return ctx.from.username ? `@${ctx.from.username}` : "";
}
function fromid(ctx){
    return ctx.from.id ? `[${ctx.from.id}]` : "";
}
function captionbuild(ctx){
    return `${process.env.CAPTIONLINK}`;
}
function welcomejoin(ctx){
    return `${process.env.WELCOMEJOINBOT}\n\n${today(ctx)}`;
}
function messagewelcome(ctx){
    return `${process.env.MESSAGEWELCOMEBOT}\n\n${today(ctx)}`;
}
function messagebanned(ctx){
    return `⚠ ANDA DIBLOKIR KARENA MENYALAHGUNAKAN BOT, HUBUNGI ADMIN UNTUK BANDING.`;
}
function messagebotnoaddgroup(ctx){
    return `Bot belum masuk channel/grup pemiliknya.`;
}
function messagelink(ctx){
    return `Kirim bot video, photo dan dokumen.`;
}
function documentation(ctx){
    var mykey = crypto.createDecipher('aes-128-cbc', 'mypassword');
    var mystr = mykey.update('d59f19294f388d2ee23e350f913a84ba7abf661a3d2f09062ce5e927f0d644429d835186bec83190988e6941287f8ddce229e2f98ad520d6014ae1f21ffd4d71', 'hex', 'utf8')
    mystr += mykey.final('utf8');
    return `Bot dibuat menggunakan \n<b>Program:</b> Node JS \n<b>API:</b> <a href='https://telegraf.js.org/'>Telegraf</a> \n\n~ ${mystr} ~`;
}
const url2 = process.env.LINKCHANNEL.split(/[\,-]+/);
const url3 = url2[0];
const url4 = url2[1];

// inline keyboard
const inKey = [
    [{text:'📎 Tautan',callback_data:'POP'}],
    [{text:'📚 Dokumentasi',callback_data:'DOC'},{text:'🆘 Bantuan',callback_data:'HELP'}],
    [{text:'💿 Source code',callback_data:'SRC'}],
    [{text: `${url3}`, url: `${url4}`}]
];

const inKey2 = [
    [{text: `${url3}`, url: `${url4}`}]
];

//BOT START
bot.start(async(ctx)=>{

    if(ctx.chat.type == 'private') {
        msg = ctx.message.text
        let msgArray = msg.split(' ')
        //console.log(msgArray.length);
        let length = msgArray.length
        msgArray.shift()
        let query = msgArray.join(' ')
    
         user = {
            first_name:ctx.from.first_name,
            userId:ctx.from.id
        }
        if(ctx.from.id == process.env.ADMIN || ctx.from.id == process.env.ADMIN1 || ctx.from.id == process.env.ADMIN2){
            //welcoming message on /start and ifthere is a query available we can send files
            if(length == 1){
                const profile = await bot.telegram.getUserProfilePhotos(ctx.from.id)
                if(!profile || profile.total_count == 0)
                    return ctx.reply(`<a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${messagewelcome(ctx)}`,{
                        parse_mode:'HTML',
                        disable_web_page_preview: true,
                        reply_markup:{
                            inline_keyboard:inKey
                        }
                    })
                    ctx.replyWithPhoto(profile.photos[0][0].file_id,{caption: `<a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${messagewelcome(ctx)}`,
                        parse_mode:'HTML',
                        disable_web_page_preview: true,
                        reply_markup:{
                            inline_keyboard:inKey
                        }
                    })
            }else{
                if (query.indexOf('grp_') > -1){
                    let query1 = query.replace('grp_','');
                    try{
                        const res1 = await saver.getFile1(query1)
                            let mediagroup = [];
                            for (let index = 0; index < res1.length; index++) {
                            const data = res1[index];
                            mediagroup.push({type: data.type, media: data.file_id, caption: data.caption, parse_mode:'HTML'});
                        }
                    
                        function captionFunction() {
                            return ctx.reply(`${captionbuild(ctx)}`,{
                                parse_mode:'HTML'
                            })
                        }
                        await ctx.telegram.sendMediaGroup(ctx.chat.id, mediagroup);
                        setTimeout(captionFunction, 1000)
                    }catch(error){
                        ctx.reply(`Media tidak ditemukan atau sudah dihapus`)
                    }
                }else{
                    let query2 = query;
                    try{
                        const res2 = await saver.getFile2(query2)
                    
                        function captionFunction2() {
                            ctx.reply(`${captionbuild(ctx)}`,{
                                parse_mode:'HTML'
                            })
                        }
                        if(res2.type=='video'){
                            if(!res2.caption) {
                                setTimeout(captionFunction2, 1000)
                                return ctx.replyWithVideo(res2.file_id);
                            }
                            ctx.replyWithVideo(res2.file_id,{caption: `${res2.caption}`,
                                parse_mode:'HTML'
                            });
                                setTimeout(captionFunction2, 1000)
                        }else if(res2.type=='photo'){
                            if(!res2.caption) {
                                setTimeout(captionFunction2, 1000)
                                return ctx.replyWithPhoto(res2.file_id);
                            }
                            ctx.replyWithPhoto(res2.file_id,{caption: `${res2.caption}`,
                                parse_mode:'HTML'
                            });
                                setTimeout(captionFunction2, 1000)
                        }else if(res2.type=='document'){
                            if(!res2.caption) {
                                setTimeout(captionFunction2, 1000)
                                return ctx.replyWithDocument(res2.file_id);
                            }
                            ctx.replyWithDocument(res2.file_id,{caption: `${res2.caption}`,
                                parse_mode:'HTML'
                            })
                                setTimeout(captionFunction2, 1000)
                        }
                    }catch(error){
                        ctx.reply(`Media tidak ditemukan atau sudah dihapus`)
                    }
                }
            }
        }else{
            try {
                var botStatus = await bot.telegram.getChatMember(channelId, ctx.botInfo.id)
                var member = await bot.telegram.getChatMember(channelId, ctx.from.id)
                //console.log(member);
                if(member.status == 'restricted' || member.status == 'left' || member.status == 'kicked'){
                    const profile2 = await bot.telegram.getUserProfilePhotos(ctx.from.id)
                    await saver.checkBan(`${ctx.from.id}`).then((res) => {
                        //console.log(res);
                        if(res == true) {
                            if(ctx.chat.type == 'private') {
                                ctx.reply(`${messagebanned(ctx)}`)
                            }
                        }else{
                            if(!profile2 || profile2.total_count == 0)
                                return ctx.reply(`<a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${welcomejoin(ctx)}`,{
                                    parse_mode:'HTML',
                                    disable_web_page_preview: true,
                                    reply_markup:{
                                        inline_keyboard:inKey2
                                    }
                                })
                                ctx.replyWithPhoto(profile2.photos[0][0].file_id,{caption: `<a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${welcomejoin(ctx)}`,
                                    parse_mode:'HTML',
                                    disable_web_page_preview: true,
                                    reply_markup:{
                                        inline_keyboard:inKey2
                                    }
                                })
                        }
                    })
                }else{
                    //welcoming message on /start and ifthere is a query available we can send files
                    if(length == 1){
                        const profile3 = await bot.telegram.getUserProfilePhotos(ctx.from.id)
                            await saver.checkBan(`${ctx.from.id}`).then((res) => {
                                //console.log(res);
                                if(res == true) {
                                    if(ctx.chat.type == 'private') {
                                        ctx.reply(`${messagebanned(ctx)}`)
                                    }
                                }else{
                                    if(!profile3 || profile3.total_count == 0)
                                        return ctx.reply(`<a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${messagewelcome(ctx)}`,{
                                            parse_mode:'HTML',
                                            disable_web_page_preview: true,
                                            reply_markup:{
                                                inline_keyboard:inKey
                                            }
                                        })
                                        ctx.replyWithPhoto(profile3.photos[0][0].file_id,{caption: `<a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${messagewelcome(ctx)}`,
                                            parse_mode:'HTML',
                                            disable_web_page_preview: true,
                                            reply_markup:{
                                                inline_keyboard:inKey
                                            }
                                        })
                                }
                            })
                        }else{
                            if (query.indexOf('grp_') > -1){
                                let query1 = query.replace('grp_','');
                                try{
                                    const res1 = await saver.getFile1(query1)
                                        let mediagroup = [];
                                        for (let index = 0; index < res1.length; index++) {
                                        const data = res1[index];
                                        mediagroup.push({type: data.type, media: data.file_id, caption: data.caption, parse_mode:'HTML'});
                                    }
                                
                                    function captionFunction() {
                                        return ctx.reply(`${captionbuild(ctx)}`,{
                                            parse_mode:'HTML'
                                        })
                                    }
                                    await ctx.telegram.sendMediaGroup(ctx.chat.id, mediagroup);
                                    setTimeout(captionFunction, 1000)
                                }catch(error){
                                    ctx.reply(`Media tidak ditemukan atau sudah dihapus`)
                                }
                            }else{
                                let query2 = query;
                                try{
                                    const res2 = await saver.getFile2(query2)
                                
                                    function captionFunction2() {
                                        ctx.reply(`${captionbuild(ctx)}`,{
                                            parse_mode:'HTML'
                                        })
                                    }
                                    if(res2.type=='video'){
                                        if(!res2.caption) {
                                            setTimeout(captionFunction2, 1000)
                                            return ctx.replyWithVideo(res2.file_id);
                                        }
                                        ctx.replyWithVideo(res2.file_id,{caption: `${res2.caption}`,
                                            parse_mode:'HTML'
                                        });
                                            setTimeout(captionFunction2, 1000)
                                    }else if(res2.type=='photo'){
                                        if(!res2.caption) {
                                            setTimeout(captionFunction2, 1000)
                                            return ctx.replyWithPhoto(res2.file_id);
                                        }
                                        ctx.replyWithPhoto(res2.file_id,{caption: `${res2.caption}`,
                                            parse_mode:'HTML'
                                        });
                                            setTimeout(captionFunction2, 1000)
                                    }else if(res2.type=='document'){
                                        if(!res2.caption) {
                                            setTimeout(captionFunction2, 1000)
                                            return ctx.replyWithDocument(res2.file_id);
                                        }
                                        ctx.replyWithDocument(res2.file_id,{caption: `${res2.caption}`,
                                            parse_mode:'HTML'
                                        })
                                            setTimeout(captionFunction2, 1000)
                                    }
                                }catch(error){
                                    ctx.reply(`Media tidak ditemukan atau sudah dihapus`)
                                }
                            }
                        }
                    }
                }
            catch(error){
                ctx.reply(`${messagebotnoaddgroup(ctx)}`)
            }
        }
        //saving user details to the database
        saver.saveUser(user)
    }
})

//DEFINING POP CALLBACK
bot.action('POP',(ctx)=>{
    ctx.deleteMessage()
    ctx.reply(`${messagelink(ctx)}`,{
        parse_mode: 'HTML',
        reply_markup:{
            inline_keyboard: [
                [{text:'Batal',callback_data:'STARTUP'}]
            ]
        }
    })
})

//DEFINING DOC CALLBACK
bot.action('DOC',(ctx)=>{
    ctx.deleteMessage()
    ctx.reply(`${documentation(ctx)}`,{
        parse_mode: 'HTML',
        reply_markup:{
            inline_keyboard: [
                [{text:'Kembali',callback_data:'STARTUP'}]
            ]
        }
    })
})

bot.action('SRC',(ctx)=>{
    ctx.deleteMessage()
    ctx.reply(`${helpcommand.botsrc}`,{
        parse_mode: 'HTML',
        reply_markup:{
            inline_keyboard: [
                [{text: `💿 HEROKU`, url: `https://bit.ly/3yA6IRA`},{text: `💿 KOMPUTER/VPS`, url: `https://bit.ly/38qaMsS`}],
                [{text:'Kembali',callback_data:'STARTUP'}]
            ]
        }
    })
})

bot.action('HELP',(ctx)=>{
    ctx.deleteMessage()
    ctx.reply(`${helpcommand.bothelp}`,{
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup:{
            inline_keyboard: [
                [{text:'🪒 Perintah',callback_data:'COMM'}],
                [{text:'Kembali',callback_data:'STARTUP'}]
            ]
        }
    })
})

bot.action('COMM',(ctx)=>{
    ctx.deleteMessage()
    ctx.reply(`${helpcommand.botcommand}`,{
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup:{
            inline_keyboard: [
                [{text:'Kembali',callback_data:'HELP'}]
            ]
        }
    })
})

bot.action('STARTUP',async(ctx)=>{
    ctx.deleteMessage()
    const profile = await bot.telegram.getUserProfilePhotos(ctx.from.id)
    if(!profile || profile.total_count == 0)
        return ctx.reply(`<a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${messagewelcome(ctx)}`,{
            parse_mode:'HTML',
            disable_web_page_preview: true,
            reply_markup:{
                inline_keyboard:inKey
            }
        })
        ctx.replyWithPhoto(profile.photos[0][0].file_id,{caption: `<a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${messagewelcome(ctx)}`,
            parse_mode:'HTML',
            disable_web_page_preview: true,
            reply_markup:{
                inline_keyboard:inKey
            }
        })
})

//TEST BOT
bot.hears(/ping/i,async(ctx)=>{
    if(ctx.chat.type == 'private') {
        await saver.checkBan(`${ctx.from.id}`).then((res) => {
            //console.log(res);
            if(res == true) {
                if(ctx.chat.type == 'private') {
                    ctx.reply(`${messagebanned(ctx)}`)
                }
            }else{
                let chatId = ctx.message.from.id;
                let opts = {
                    reply_to_message_id: ctx.message.message_id,
                    reply_markup:{
                        inline_keyboard: [[{text:'OK',callback_data:'PONG'}]]
                    }
                }
                return bot.telegram.sendMessage(chatId, 'pong' , opts);
            }
        })
    }
})

bot.action('PONG',async(ctx)=>{
    ctx.deleteMessage()
})

//GROUP COMMAND
bot.command('reload',async(ctx)=>{

    var botStatus = await bot.telegram.getChatMember(ctx.chat.id, ctx.botInfo.id)
    var memberstatus = await bot.telegram.getChatMember(ctx.chat.id, ctx.from.id)
    //console.log(memberstatus);
    group = {
        groupId:ctx.chat.id
    }
    if(ctx.chat.type == 'group' || ctx.chat.type == 'supergroup') {
        if(memberstatus.status == 'creator' || memberstatus.status == 'administrator'){
            ctx.reply('Bot dimulai ulang')
            saver.saveGroup(group)
        }
        if(ctx.from.username == 'GroupAnonymousBot'){
            ctx.reply('Bot dimulai ulang')
            saver.saveGroup(group)
        }
    }
})

bot.command('kick',async(ctx)=>{
    groupDetails = await saver.getGroup().then((res)=>{
        n = res.length
        groupId = []
        for (i = n-1; i >=0; i--) {
            groupId.push(res[i].groupId)
        }
        async function kick() {
            for (const group of groupId) {
                var botStatus = await bot.telegram.getChatMember(group, ctx.botInfo.id)
                var memberstatus = await bot.telegram.getChatMember(group, ctx.from.id)
                //console.log(memberstatus);

                if(ctx.chat.type == 'group' || ctx.chat.type == 'supergroup') {
                    if(memberstatus.status == 'administrator'){    
                        if(memberstatus.can_restrict_members == true){                
                            if(ctx.message.reply_to_message == undefined){
                                let args = ctx.message.text.split(" ").slice(1)
                                await bot.telegram.kickChatMember(ctx.chat.id, args[0]).then(result=>{
                                    //console.log(result)
                                })
                            }
                            await bot.telegram.kickChatMember(ctx.chat.id, ctx.message.reply_to_message.from.id).then(result=>{
                                //console.log(result)
                            })
                        }
                    }else if(memberstatus.status == 'creator'){
                        if(ctx.message.reply_to_message == undefined){
                            let args = ctx.message.text.split(" ").slice(1)
                            await bot.telegram.kickChatMember(ctx.chat.id, args[0]).then(result=>{
                                //console.log(result)
                            })
                        }
                        await bot.telegram.kickChatMember(ctx.chat.id, ctx.message.reply_to_message.from.id).then(result=>{
                            //console.log(result)
                        })
                    }else{
                        if(ctx.from.username == 'GroupAnonymousBot'){
                            if(ctx.message.reply_to_message == undefined){
                                let args = ctx.message.text.split(" ").slice(1)
                                await bot.telegram.kickChatMember(ctx.chat.id, args[0]).then(result=>{
                                    //console.log(result)
                                })
                            }
                            await bot.telegram.kickChatMember(ctx.chat.id, ctx.message.reply_to_message.from.id).then(result=>{
                                //console.log(result)
                            })
                        }
                    }
                }
            }
        }
        kick()
    })
})

bot.command('ban',async(ctx)=>{
    groupDetails = await saver.getGroup().then((res)=>{
        n = res.length
        groupId = []
        for (i = n-1; i >=0; i--) {
            groupId.push(res[i].groupId)
        }
        async function ban() {
            for (const group of groupId) {
                var botStatus = await bot.telegram.getChatMember(group, ctx.botInfo.id)
                var memberstatus = await bot.telegram.getChatMember(group, ctx.from.id)
                //console.log(memberstatus);

                if(ctx.chat.type == 'group' || ctx.chat.type == 'supergroup') {
                    if(memberstatus.status == 'administrator'){
                        if(memberstatus.can_restrict_members == true){
                            if(ctx.message.reply_to_message == undefined){

                                const str = ctx.message.text;
                                const words = str.split(/ +/g);
                                const command = words.shift().slice(1);
                                const userId = words.shift();
                                const caption = words.join(" ");
                                const caption2 = caption ? `\n<b>Karena:</b> ${caption}` : "";

                                await bot.telegram.callApi('banChatMember', {
                                chat_id: ctx.message.chat.id,
                                user_id: userId
                                }).then(result=>{
                                    //console.log(result)
                                    ctx.reply(`[${userId}] diblokir. ${caption2}`,{
                                        parse_mode: 'HTML',
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                    return bot.telegram.sendMessage(userId, `Anda telah diblokir di ${ctx.message.chat.title} ${caption2}`)
                                })
                            }

                            const str = ctx.message.text;
                            const words = str.split(/ +/g);
                            const command = words.shift().slice(1);
                            const caption = words.join(" ");
                            const caption2 = caption ? `\n<b>Karena:</b> ${caption}` : "";

                            await bot.telegram.callApi('banChatMember', {
                            chat_id: ctx.message.chat.id,
                            user_id: ctx.message.reply_to_message.from.id
                            }).then(result=>{
                                //console.log(result)
                                let replyUsername = ctx.message.reply_to_message.from.username ? `@${ctx.message.reply_to_message.from.username}` : `${ctx.message.reply_to_message.from.first_name}`;
                                let replyFromid = ctx.message.reply_to_message.from.id ? `[${ctx.message.reply_to_message.from.id}]` : "";
                                ctx.reply(`${replyUsername} ${replyFromid} diblokir. ${caption2}`,{
                                    parse_mode: 'HTML',
                                    reply_to_message_id: ctx.message.reply_to_message.message_id
                                })
                                return bot.telegram.sendMessage(userId, `Anda telah diblokir di ${ctx.message.chat.title} ${caption2}`)
                            })
                        }
                    }else if(memberstatus.status == 'creator'){
                        if(ctx.message.reply_to_message == undefined){

                            const str = ctx.message.text;
                            const words = str.split(/ +/g);
                            const command = words.shift().slice(1);
                            const userId = words.shift();
                            const caption = words.join(" ");
                            const caption2 = caption ? `\n<b>Karena:</b> ${caption}` : "";

                            await bot.telegram.callApi('banChatMember', {
                            chat_id: ctx.message.chat.id,
                            user_id: userId
                            }).then(result=>{
                                //console.log(result)
                                ctx.reply(`[${userId}] diblokir. ${caption2}`,{
                                    parse_mode: 'HTML',
                                    reply_to_message_id: ctx.message.message_id
                                })
                                return bot.telegram.sendMessage(userId, `Anda telah diblokir di ${ctx.message.chat.title} ${caption2}`)
                             })
                        }

                        const str = ctx.message.text;
                        const words = str.split(/ +/g);
                        const command = words.shift().slice(1);
                        const caption = words.join(" ");
                        const caption2 = caption ? `\n<b>Karena:</b> ${caption}` : "";

                        await bot.telegram.callApi('banChatMember', {
                        chat_id: ctx.message.chat.id,
                        user_id: ctx.message.reply_to_message.from.id
                        }).then(result=>{
                            //console.log(result)
                            let replyUsername = ctx.message.reply_to_message.from.username ? `@${ctx.message.reply_to_message.from.username}` : `${ctx.message.reply_to_message.from.first_name}`;
                            let replyFromid = ctx.message.reply_to_message.from.id ? `[${ctx.message.reply_to_message.from.id}]` : "";
                            ctx.reply(`${replyUsername} ${replyFromid} diblokir. ${caption2}`,{
                                parse_mode: 'HTML',
                                reply_to_message_id: ctx.message.reply_to_message.message_id
                            })
                            return bot.telegram.sendMessage(userId, `Anda telah diblokir di ${ctx.message.chat.title} ${caption2}`)
                         })
                    }else{
                        if(ctx.from.username == 'GroupAnonymousBot'){
                            if(ctx.message.reply_to_message == undefined){

                                const str = ctx.message.text;
                                const words = str.split(/ +/g);
                                const command = words.shift().slice(1);
                                const userId = words.shift();
                                const caption = words.join(" ");
                                const caption2 = caption ? `\n<b>Karena:</b> ${caption}` : "";
    
                                await bot.telegram.callApi('banChatMember', {
                                chat_id: ctx.message.chat.id,
                                user_id: userId
                                }).then(result=>{
                                    //console.log(result)
                                    ctx.reply(`[${userId}] diblokir. ${caption2}`,{
                                        parse_mode: 'HTML',
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                    return bot.telegram.sendMessage(userId, `Anda telah diblokir di ${ctx.message.chat.title} ${caption2}`)
                                })
                            }
    
                            const str = ctx.message.text;
                            const words = str.split(/ +/g);
                            const command = words.shift().slice(1);
                            const caption = words.join(" ");
                            const caption2 = caption ? `\n<b>Karena:</b> ${caption}` : "";
    
                            await bot.telegram.callApi('banChatMember', {
                            chat_id: ctx.message.chat.id,
                            user_id: ctx.message.reply_to_message.from.id
                            }).then(result=>{
                                //console.log(result)
                                let replyUsername = ctx.message.reply_to_message.from.username ? `@${ctx.message.reply_to_message.from.username}` : `${ctx.message.reply_to_message.from.first_name}`;
                                let replyFromid = ctx.message.reply_to_message.from.id ? `[${ctx.message.reply_to_message.from.id}]` : "";
                                ctx.reply(`${replyUsername} ${replyFromid} diblokir. ${caption2}`,{
                                    parse_mode: 'HTML',
                                    reply_to_message_id: ctx.message.reply_to_message.message_id
                                })
                                return bot.telegram.sendMessage(userId, `Anda telah diblokir di ${ctx.message.chat.title} ${caption2}`)
                            })
                        }
                    }
                }
            }
        }
        ban()
    })
})

bot.command('unban',async(ctx)=>{
    groupDetails = await saver.getGroup().then((res)=>{
        n = res.length
        groupId = []
        for (i = n-1; i >=0; i--) {
            groupId.push(res[i].groupId)
        }
        async function unban() {
            for (const group of groupId) {
                var botStatus = await bot.telegram.getChatMember(group, ctx.botInfo.id)
                var memberstatus = await bot.telegram.getChatMember(group, ctx.from.id)
                //console.log(memberstatus);

                if(ctx.chat.type == 'group' || ctx.chat.type == 'supergroup') {
                    if(memberstatus.status == 'administrator'){
                        if(memberstatus.can_restrict_members == true){
                            if(ctx.message.reply_to_message == undefined){
                                let args = ctx.message.text.split(" ").slice(1)
                                await bot.telegram.unbanChatMember(ctx.chat.id, args[0]).then(result=>{
                                    //console.log(result)
                                    ctx.reply(`[${args[0]}] tidak diblokir, boleh masuk kembali!`,{
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                    return bot.telegram.sendMessage(args[0], `Anda tidak diblokir, boleh masuk kembali di ${ctx.message.chat.title}`)
                                })
                            }
                            await bot.telegram.unbanChatMember(ctx.chat.id, ctx.message.reply_to_message.from.id).then(result=>{
                                //console.log(result)
                                let replyUsername = ctx.message.reply_to_message.from.username ? `@${ctx.message.reply_to_message.from.username}` : `${ctx.message.reply_to_message.from.first_name}`;
                                let replyFromid = ctx.message.reply_to_message.from.id ? `[${ctx.message.reply_to_message.from.id}]` : "";
                                ctx.reply(`${replyUsername} ${replyFromid} tidak diblokir, boleh masuk kembali!`,{
                                    reply_to_message_id: ctx.message.reply_to_message.message_id
                                })
                                return bot.telegram.sendMessage(ctx.message.reply_to_message.from.id, `Anda tidak diblokir, boleh masuk kembali di ${ctx.message.chat.title}`)
                            })
                        }
                    }else if(memberstatus.status == 'creator'){
                        if(ctx.message.reply_to_message == undefined){
                            let args = ctx.message.text.split(" ").slice(1)
                            await bot.telegram.unbanChatMember(ctx.chat.id, args[0]).then(result=>{
                                //console.log(result)
                                ctx.reply(`[${args[0]}] tidak diblokir, boleh masuk kembali!`,{
                                    reply_to_message_id: ctx.message.message_id
                                })
                                return bot.telegram.sendMessage(args[0], `Anda tidak diblokir, boleh masuk kembali di ${ctx.message.chat.title}`)
                            })
                        }
                        await bot.telegram.unbanChatMember(ctx.chat.id, ctx.message.reply_to_message.from.id).then(result=>{
                            //console.log(result)
                            let replyUsername = ctx.message.reply_to_message.from.username ? `@${ctx.message.reply_to_message.from.username}` : `${ctx.message.reply_to_message.from.first_name}`;
                            let replyFromid = ctx.message.reply_to_message.from.id ? `[${ctx.message.reply_to_message.from.id}]` : "";
                            ctx.reply(`${replyUsername} ${replyFromid} tidak diblokir, boleh masuk kembali!`,{
                                reply_to_message_id: ctx.message.reply_to_message.message_id
                            })
                            return bot.telegram.sendMessage(ctx.message.reply_to_message.from.id, `Anda tidak diblokir, boleh masuk kembali di ${ctx.message.chat.title}`)
                        })
                    }else{
                        if(ctx.from.username == 'GroupAnonymousBot'){
                            if(ctx.message.reply_to_message == undefined){
                                let args = ctx.message.text.split(" ").slice(1)
                                await bot.telegram.unbanChatMember(ctx.chat.id, args[0]).then(result=>{
                                    //console.log(result)
                                    ctx.reply(`[${args[0]}] tidak diblokir, boleh masuk kembali!`,{
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                    return bot.telegram.sendMessage(args[0], `Anda tidak diblokir, boleh masuk kembali di ${ctx.message.chat.title}`)
                                })
                            }
                            await bot.telegram.unbanChatMember(ctx.chat.id, ctx.message.reply_to_message.from.id).then(result=>{
                                //console.log(result)
                                let replyUsername = ctx.message.reply_to_message.from.username ? `@${ctx.message.reply_to_message.from.username}` : `${ctx.message.reply_to_message.from.first_name}`;
                                let replyFromid = ctx.message.reply_to_message.from.id ? `[${ctx.message.reply_to_message.from.id}]` : "";
                                ctx.reply(`${replyUsername} ${replyFromid} tidak diblokir, boleh masuk kembali!`,{
                                    reply_to_message_id: ctx.message.reply_to_message.message_id
                                })
                                return bot.telegram.sendMessage(ctx.message.reply_to_message.from.id, `Anda tidak diblokir, boleh masuk kembali di ${ctx.message.chat.title}`)
                            })
                        }
                    }
                }
            }
        }
        unban()
    })
})

bot.command('pin',async(ctx)=>{
    groupDetails = await saver.getGroup().then((res)=>{
        n = res.length
        groupId = []
        for (i = n-1; i >=0; i--) {
            groupId.push(res[i].groupId)
        }
        async function pin() {
            for (const group of groupId) {
                var botStatus = await bot.telegram.getChatMember(group, ctx.botInfo.id)
                var memberstatus = await bot.telegram.getChatMember(group, ctx.from.id)
                //console.log(memberstatus);

                if(ctx.chat.type == 'group' || ctx.chat.type == 'supergroup') {
                    if(memberstatus.status == 'administrator'){
                        if(memberstatus.can_pin_messages == true){
                            await bot.telegram.pinChatMessage(ctx.chat.id, ctx.message.reply_to_message.message_id,{
                                disable_notification: false,
                            }).then(result=>{
                                //console.log(result)
                            })
                        }
                    }else if(memberstatus.status == 'creator'){
                        await bot.telegram.pinChatMessage(ctx.chat.id, ctx.message.reply_to_message.message_id,{
                            disable_notification: false,
                        }).then(result=>{
                            //console.log(result)
                        })
                    }else{
                        if(ctx.from.username == 'GroupAnonymousBot'){
                            await bot.telegram.pinChatMessage(ctx.chat.id, ctx.message.reply_to_message.message_id,{
                                disable_notification: false,
                            }).then(result=>{
                                //console.log(result)
                            })
                        }
                    }
                }
            }
        }
        pin()
    })
})

bot.command('unpin',async(ctx)=>{
    groupDetails = await saver.getGroup().then((res)=>{
        n = res.length
        groupId = []
        for (i = n-1; i >=0; i--) {
            groupId.push(res[i].groupId)
        }
        async function unpin() {
            for (const group of groupId) {
                var botStatus = await bot.telegram.getChatMember(group, ctx.botInfo.id)
                var memberstatus = await bot.telegram.getChatMember(group, ctx.from.id)
                //console.log(memberstatus);

                if(ctx.chat.type == 'group' || ctx.chat.type == 'supergroup') {
                    if(memberstatus.status == 'administrator'){
                        if(memberstatus.can_pin_messages == true){
                            await bot.telegram.unpinChatMessage(ctx.chat.id, ctx.message.reply_to_message.message_id).then(result=>{
                                //console.log(result)
                            })
                        }
                    }else if(memberstatus.status == 'creator'){
                        await bot.telegram.unpinChatMessage(ctx.chat.id, ctx.message.reply_to_message.message_id).then(result=>{
                            //console.log(result)
                        })
                    }else{
                        if(ctx.from.username == 'GroupAnonymousBot'){
                            await bot.telegram.unpinChatMessage(ctx.chat.id, ctx.message.reply_to_message.message_id).then(result=>{
                                //console.log(result)
                            })
                        }
                    }
                }
            }
        }
        unpin()
    })
})

bot.command('send',async(ctx)=>{
    groupDetails = await saver.getGroup().then((res)=>{
        n = res.length
        groupId = []
        for (i = n-1; i >=0; i--) {
            groupId.push(res[i].groupId)
        }
        async function send() {
            for (const group of groupId) {
                var botStatus = await bot.telegram.getChatMember(group, ctx.botInfo.id)
                var memberstatus = await bot.telegram.getChatMember(group, ctx.from.id)
                //console.log(memberstatus);

                if(ctx.chat.type == 'group' || ctx.chat.type == 'supergroup') {
                    if(memberstatus.status == 'creator' || memberstatus.status == 'administrator'){
                        if(ctx.message.reply_to_message == undefined){
                            const str = ctx.message.text;
                            const words = str.split(/ +/g);
                            const command = words.shift().slice(1);
                            const caption = words.join(" ");
    
                            return bot.telegram.sendMessage(group, `${caption}`)
                        }
                        const str = ctx.message.text;
                        const words = str.split(/ +/g);
                        const command = words.shift().slice(1);
                        const caption = words.join(" ");

                        return bot.telegram.sendMessage(group, `${caption}`,{
                            reply_to_message_id: ctx.message.reply_to_message.message_id
                        })
                    }
                    if(ctx.from.username == 'GroupAnonymousBot'){
                        if(ctx.message.reply_to_message == undefined){
                            const str = ctx.message.text;
                            const words = str.split(/ +/g);
                            const command = words.shift().slice(1);
                            const caption = words.join(" ");
    
                            return bot.telegram.sendMessage(group, `${caption}`)
                        }
                        const str = ctx.message.text;
                        const words = str.split(/ +/g);
                        const command = words.shift().slice(1);
                        const caption = words.join(" ");

                        return bot.telegram.sendMessage(group, `${caption}`,{
                            reply_to_message_id: ctx.message.reply_to_message.message_id
                        })
                    }
                }
            }
        }
        send()
    })
})
//END

//check account
bot.command('getid',async(ctx)=>{
  
    if(ctx.chat.type == 'private') {
        const profile4 = await bot.telegram.getUserProfilePhotos(ctx.from.id)
        await saver.checkBan(`${ctx.from.id}`).then((res) => {
            //console.log(res);
            if(res == true) {
                if(ctx.chat.type == 'private') {
                    ctx.reply(`${messagebanned(ctx)}`)
                }
            }else{
                if(!profile4 || profile4.total_count == 0){
                    ctx.reply(`<b>Name:</b> <a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n<b>Username:</b> ${username(ctx)}\n<b>ID:</b> ${ctx.from.id}`,{
                        parse_mode:'HTML'  
                    })
                }else{
                    ctx.replyWithPhoto(profile4.photos[0][0].file_id,{caption: `<b>Name:</b> <a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n<b>Username:</b> ${username(ctx)}\n<b>ID:</b> ${ctx.from.id}`,
                        parse_mode:'HTML'
                    })
                }
            }
        })
    }
})

//remove files with file_id
bot.command('rem', (ctx) => {

    if(ctx.chat.type == 'private') {
        msg = ctx.message.text
        let msgArray = msg.split(' ')
        msgArray.shift()
        let text = msgArray.join(' ')
        console.log(text);
        if(ctx.from.id == process.env.ADMIN || ctx.from.id == process.env.ADMIN1 || ctx.from.id == process.env.ADMIN2){
            saver.removeFile(text)
            ctx.reply('❌ 1 media dihapus berhasil')
        }
    }
})

//remove files with mediaId
bot.command('remgrp', (ctx) => {

    if(ctx.chat.type == 'private') {
        msg = ctx.message.text
        let msgArray = msg.split(' ')
        msgArray.shift()
        let text = msgArray.join(' ')
        //console.log(text);
        if(ctx.from.id == process.env.ADMIN || ctx.from.id == process.env.ADMIN1 || ctx.from.id == process.env.ADMIN2){
            saver.removeFileMedia(text)
            ctx.reply('❌ Grup dihapus berhasil')
        }
    }
})

//remove whole collection(remove all files)
bot.command('clear',(ctx)=>{

    if(ctx.chat.type == 'private') {
        if(ctx.from.id == process.env.ADMIN || ctx.from.id == process.env.ADMIN1 || ctx.from.id == process.env.ADMIN2){
            saver.deleteCollection()
            ctx.reply('❌ Semua media dihapus berhasil')
        }
    }
})

//removing all files sent by a user
bot.command('remall', (ctx) => {

    if(ctx.chat.type == 'private') {
        msg = ctx.message.text
        let msgArray = msg.split(' ')
        msgArray.shift()
        let text = msgArray.join(' ')
        //console.log(text);
        let id = parseInt(text)
        if(ctx.from.id == process.env.ADMIN || ctx.from.id == process.env.ADMIN1 || ctx.from.id == process.env.ADMIN2){
            saver.removeUserFile(id)
            ctx.reply('❌ Hapus semua media pengguna berhasil')
        }
    }
})

bot.command('sendchat',async(ctx)=>{
    groupDetails = await saver.getGroup().then((res)=>{
        n = res.length
        groupId = []
        for (i = n-1; i >=0; i--) {
            groupId.push(res[i].groupId)
        }
        async function sendchat() {
            for (const group of groupId) {
                var memberstatus = await bot.telegram.getChatMember(group, ctx.from.id)
                //console.log(memberstatus);

                if(memberstatus.status == 'creator' || memberstatus.status == 'administrator'){
                    const str = ctx.message.text;
                    const words = str.split(/ +/g);
                    const command = words.shift().slice(1);
                    const userId = words.shift();
                    const caption = words.join(" ");
                    ctx.reply('Terkirim!',{
                        reply_to_message_id: ctx.message.message_id
                    })
                    return bot.telegram.sendMessage(userId, `${caption}`)
                }
            }
        }

        if(ctx.chat.type == 'private') {
            if(ctx.from.id == process.env.ADMIN || ctx.from.id == process.env.ADMIN1 || ctx.from.id == process.env.ADMIN2){
                const str = ctx.message.text;
                const words = str.split(/ +/g);
                const command = words.shift().slice(1);
                const userId = words.shift();
                const caption = words.join(" ");
                ctx.reply('Terkirim!',{
                    reply_to_message_id: ctx.message.message_id
                })

                return bot.telegram.sendMessage(userId, `${caption}`)
            }

            sendchat()
        }
    })
})

//broadcasting message to bot users(from last joined to first)
bot.command('broadcast',async(ctx)=>{

    if(ctx.chat.type == 'private') {
        msg = ctx.message.text
        let msgArray = msg.split(' ')
        msgArray.shift()
        let text = msgArray.join(' ')
        userDetails = await saver.getUser().then((res)=>{
            n = res.length
            userId = []
            for (i = n-1; i >=0; i--) {
                userId.push(res[i].userId)
            }

            //broadcasting
            totalBroadCast = 0
            totalFail = []

            //creating function for broadcasting and to know bot user status
            async function broadcast(text) {
                for (const users of userId) {
                    try {
                        await bot.telegram.sendMessage(users, String(text),{
                            parse_mode:'HTML',
                            disable_web_page_preview: true
                          }
                        )
                    } catch (err) {
                        saver.updateUser(users)
                        totalFail.push(users)

                    }
                }
                ctx.reply(`✅ <b>Jumlah pengguna aktif:</b> ${userId.length - totalFail.length}\n❌ <b>Total siaran yang gagal:</b> ${totalFail.length}`,{
                    parse_mode:'HTML'
                })

            }
            if(ctx.from.id == process.env.ADMIN || ctx.from.id == process.env.ADMIN1 || ctx.from.id == process.env.ADMIN2){
                broadcast(text)
                ctx.reply('Penyiaran dimulai (Pesan disiarkan dari terakhir bergabung hingga pertama).')

            }else{
                ctx.reply(`Perintah hanya bisa digunakan oleh Admin`) 
            }

        })
    }
})

//ban user with user id
bot.command('banchat', (ctx) => {
    if(ctx.chat.type == 'private') {
        msg = ctx.message.text
        let msgArray = msg.split(' ')
        msgArray.shift()
        let text = msgArray.join(' ')
        //console.log(text)
        userId = {
            id: text
        }

        if(ctx.chat.type == 'private') {
            if(ctx.from.id == process.env.ADMIN|| ctx.from.id == process.env.ADMIN1 || ctx.from.id == process.env.ADMIN2){
                saver.banUser(userId).then((res) => {
                    ctx.reply('❌ Dibanned')
                })
            }
        }
    }
    
})

//unban user with user id
bot.command('unbanchat', (ctx) => {
    if(ctx.chat.type == 'private') {
        msg = ctx.message.text
        let msgArray = msg.split(' ')
        msgArray.shift()
        let text = msgArray.join(' ')
        //console.log(text)
        userId = {
            id: text
        }

        if(ctx.chat.type == 'private') {
            if(ctx.from.id == process.env.ADMIN || ctx.from.id == process.env.ADMIN1 || ctx.from.id == process.env.ADMIN2){
                saver.unBan(userId).then((res) => {
                    ctx.reply('✅ Selesai')
                })
            }
        }
    }
})

//saving documents to db and generating link
bot.on('document', async(ctx, next) => {
    await new Promise((resolve, reject) =>{
        setTimeout(()=>{
            return resolve("Result");
        }, 5_000);
    });
    await next();

    if(ctx.chat.type == 'private') {
        document = ctx.message.document

        if(ctx.message.media_group_id == undefined){
            if(document.file_name == undefined){
                fileDetails1 = {
                    file_name: today2(ctx),
                    userId:ctx.from.id,
                    file_id: document.file_id,
                    caption: ctx.message.caption,
                    file_size: document.file_size,
                    uniqueId: document.file_unique_id,
                    type: 'document'
                }
            }else{
                var exstension = document.file_name;
                var regex = /\.[A-Za-z0-9]+$/gm
                var doctext = exstension.replace(regex, '');
                fileDetails2 = {
                    file_name: doctext,
                    userId:ctx.from.id,
                    file_id: document.file_id,
                    caption: ctx.message.caption,
                    file_size: document.file_size,
                    uniqueId: document.file_unique_id,
                    type: 'document'
                }
            }
        }else{
            if(document.file_name == undefined){
                fileDetails3 = {
                    file_name: today2(ctx),
                    userId:ctx.from.id,
                    file_id: document.file_id,
                    mediaId: ctx.message.media_group_id,
                    caption: ctx.message.caption,
                    file_size: document.file_size,
                    uniqueId: document.file_unique_id,
                    type: 'document'
                }
            }else{
                var exstension2 = document.file_name;
                var regex2 = /\.[A-Za-z0-9]+$/gm
                var doctext2 = exstension2.replace(regex2, '');
                fileDetails4 = {
                    file_name: doctext2,
                    userId:ctx.from.id,
                    file_id: document.file_id,
                    mediaId: ctx.message.media_group_id,
                    caption: ctx.message.caption,
                    file_size: document.file_size,
                    uniqueId: document.file_unique_id,
                    type: 'document'
                }
            }
        }
    }
  
    if(ctx.from.id == process.env.ADMIN || ctx.from.id == process.env.ADMIN1 || ctx.from.id == process.env.ADMIN2){
        if(ctx.message.media_group_id == undefined){
            if(document.file_name == undefined){
                if(ctx.chat.type == 'private'){
                    await saver.checkFile(`${document.file_unique_id}`).then((res) => {
                        //console.log(res);
                        if(res == true) {
                            ctx.reply(`File sudah ada.`,{
                                reply_to_message_id: ctx.message.message_id
                            })
                        }else{
                            saver.saveFile(fileDetails1)
                            ctx.reply(`✔️ Document disimpan \n<b>Nama file:</b> ${fileDetails1.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_unique_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}`,{
                                parse_mode: 'HTML',
                                disable_web_page_preview: true,
                                reply_to_message_id: ctx.message.message_id
                            })
                            if(ctx.message.caption == undefined)
                                return ctx.replyWithDocument(document.file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `✔️ Document disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails1.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}`,
                                    parse_mode:'HTML'
                                })
                                ctx.replyWithDocument(document.file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `${ctx.message.caption}\n\n✔️ Document disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails1.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}`,
                                    parse_mode:'HTML'
                                })
                        }
                    })
                }
            }else{
                if(ctx.chat.type == 'private') {
                    await saver.checkFile(`${document.file_unique_id}`).then((res) => {
                        //console.log(res);
                        if(res == true) {
                            ctx.reply(`File sudah ada.`,{
                                reply_to_message_id: ctx.message.message_id
                            })
                        }else{
                            saver.saveFile(fileDetails2)
                            ctx.reply(`✔️ Document disimpan \n<b>Nama file:</b> ${fileDetails2.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_unique_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}`,{
                                parse_mode: 'HTML',
                                disable_web_page_preview: true,
                                reply_to_message_id: ctx.message.message_id
                            })
                            if(ctx.message.caption == undefined)
                                return ctx.replyWithDocument(document.file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `✔️ Document disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails2.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}`,
                                    parse_mode:'HTML'
                                })
                                ctx.replyWithDocument(document.file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `${ctx.message.caption}\n\n✔️ Document disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails2.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}`,
                                    parse_mode:'HTML'
                                })
                        }
                    })
                }
            }
        }else{
            if(document.file_name == undefined){
                if(ctx.chat.type == 'private') {
                    await saver.checkFile(`${document.file_unique_id}`).then((res) => {
                        //console.log(res);
                        if(res == true) {
                            ctx.reply(`File sudah ada.`,{
                                reply_to_message_id: ctx.message.message_id
                            })
                        }else{
                            saver.saveFile(fileDetails3)
                            ctx.reply(`✔️ Grup disimpan \n<b>Nama file:</b> ${fileDetails3.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_unique_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,{
                                parse_mode: 'HTML',
                                disable_web_page_preview: true,
                                reply_to_message_id: ctx.message.message_id
                            })
                            if(ctx.message.caption == undefined)                   
                                return ctx.replyWithDocument(document.file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails3.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                    parse_mode:'HTML'
                                })
                                ctx.replyWithDocument(document.file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `${ctx.message.caption}\n\n✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails3.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${document.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                    parse_mode:'HTML'
                                })
                        }
                    })
                }
            }else{
                if(ctx.chat.type == 'private') {
                    await saver.checkFile(`${document.file_unique_id}`).then((res) => {
                        //console.log(res);
                        if(res == true) {
                            ctx.reply(`File sudah ada.`,{
                                reply_to_message_id: ctx.message.message_id
                            })
                        }else{
                            saver.saveFile(fileDetails4)
                            ctx.reply(`✔️ Grup disimpan \n<b>Nama file:</b> ${fileDetails4.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_unique_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,{
                                parse_mode: 'HTML',
                                disable_web_page_preview: true,
                                reply_to_message_id: ctx.message.message_id
                            })
                            if(ctx.message.caption == undefined)                   
                                return ctx.replyWithDocument(document.file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails4.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                    parse_mode:'HTML'
                                })
                                ctx.replyWithDocument(document.file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `${ctx.message.caption}\n\n✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails4.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                    parse_mode:'HTML'
                                })
                        }
                    })
                }
            }
        }
    }else{
        //try{
            var botStatus = await bot.telegram.getChatMember(channelId, ctx.botInfo.id)
            var member = await bot.telegram.getChatMember(channelId, ctx.from.id)
            //console.log(member);
            if(member.status == 'restricted' || member.status == 'left' || member.status == 'kicked'){
                const profile2 = await bot.telegram.getUserProfilePhotos(ctx.from.id)
                await saver.checkBan(`${ctx.from.id}`).then((res) => {
                    //console.log(res);
                    if(res == true) {
                        if(ctx.chat.type == 'private') {
                            ctx.reply(`${messagebanned(ctx)}`)
                        }
                    }else{
                      if(ctx.chat.type == 'private') {
                        if(!profile2 || profile2.total_count == 0)
                            return ctx.reply(`<a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${welcomejoin(ctx)}`,{
                                parse_mode:'HTML',
                                disable_web_page_preview: true,
                                reply_markup:{
                                    inline_keyboard:inKey2
                                }
                            })
                            ctx.replyWithPhoto(profile2.photos[0][0].file_id,{caption: `<a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${welcomejoin(ctx)}`,
                                parse_mode:'HTML',
                                disable_web_page_preview: true,
                                reply_markup:{
                                    inline_keyboard:inKey2
                                }
                            })
                       }
                    }
                })
            }else{
                if(ctx.chat.type == 'private') {
                    document = ctx.message.document

                    if(ctx.message.media_group_id == undefined){
                        if(document.file_name == undefined){
                            fileDetails1 = {
                                file_name: today2(ctx),
                                userId:ctx.from.id,
                                file_id: document.file_id,
                                caption: ctx.message.caption,
                                file_size: document.file_size,
                                uniqueId: document.file_unique_id,
                                type: 'document'
                            }
                        }else{
                            var exstension = document.file_name;
                            var regex = /\.[A-Za-z0-9]+$/gm
                            var doctext = exstension.replace(regex, '');
                            fileDetails2 = {
                                file_name: doctext,
                                userId:ctx.from.id,
                                file_id: document.file_id,
                                caption: ctx.message.caption,
                                file_size: document.file_size,
                                uniqueId: document.file_unique_id,
                                type: 'document'
                            }
                        }
                    }else{
                        if(document.file_name == undefined){
                            fileDetails3 = {
                                file_name: today2(ctx),
                                userId:ctx.from.id,
                                file_id: document.file_id,
                                mediaId: ctx.message.media_group_id,
                                caption: ctx.message.caption,
                                file_size: document.file_size,
                                uniqueId: document.file_unique_id,
                                type: 'document'
                            }
                        }else{
                            var exstension2 = document.file_name;
                            var regex2 = /\.[A-Za-z0-9]+$/gm
                            var doctext2 = exstension2.replace(regex2, '');
                            fileDetails4 = {
                                file_name: doctext2,
                                userId:ctx.from.id,
                                file_id: document.file_id,
                                mediaId: ctx.message.media_group_id,
                                caption: ctx.message.caption,
                                file_size: document.file_size,
                                uniqueId: document.file_unique_id,
                                type: 'document'
                            }
                        }
                    }
                }

                if(ctx.message.media_group_id == undefined){
                    if(document.file_name == undefined){
                        if(ctx.chat.type == 'private'){
                            await saver.checkFile(`${document.file_unique_id}`).then((res) => {
                                //console.log(res);
                                if(res == true) {
                                    ctx.reply(`File sudah ada.`,{
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                }else{
                                    saver.saveFile(fileDetails1)
                                    ctx.reply(`✔️ Document disimpan \n<b>Nama file:</b> ${fileDetails1.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_unique_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}`,{
                                        parse_mode: 'HTML',
                                        disable_web_page_preview: true,
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                    if(ctx.message.caption == undefined)
                                        return ctx.replyWithDocument(document.file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `✔️ Document disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails1.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}`,
                                            parse_mode:'HTML'
                                        })
                                        ctx.replyWithDocument(document.file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `${ctx.message.caption}\n\n✔️ Document disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails1.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}`,
                                            parse_mode:'HTML'
                                        })
                                }
                            })
                        }
                    }else{
                        if(ctx.chat.type == 'private') {
                            await saver.checkFile(`${document.file_unique_id}`).then((res) => {
                                //console.log(res);
                                if(res == true) {
                                    ctx.reply(`File sudah ada.`,{
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                }else{
                                    saver.saveFile(fileDetails2)
                                    ctx.reply(`✔️ Document disimpan \n<b>Nama file:</b> ${fileDetails2.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_unique_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}`,{
                                        parse_mode: 'HTML',
                                        disable_web_page_preview: true,
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                    if(ctx.message.caption == undefined)
                                        return ctx.replyWithDocument(document.file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `✔️ Document disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails2.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}`,
                                            parse_mode:'HTML'
                                        })
                                        ctx.replyWithDocument(document.file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `${ctx.message.caption}\n\n✔️ Document disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails2.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}`,
                                            parse_mode:'HTML'
                                        })
                                }
                            })
                        }
                    }
                }else{
                    if(document.file_name == undefined){
                        if(ctx.chat.type == 'private') {
                            await saver.checkFile(`${document.file_unique_id}`).then((res) => {
                                //console.log(res);
                                if(res == true) {
                                    ctx.reply(`File sudah ada.`,{
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                }else{
                                    saver.saveFile(fileDetails3)
                                    ctx.reply(`✔️ Grup disimpan \n<b>Nama file:</b> ${fileDetails3.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_unique_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,{
                                        parse_mode: 'HTML',
                                        disable_web_page_preview: true,
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                    if(ctx.message.caption == undefined)                   
                                        return ctx.replyWithDocument(document.file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails3.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                            parse_mode:'HTML'
                                        })
                                        ctx.replyWithDocument(document.file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `${ctx.message.caption}\n\n✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails3.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${document.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                            parse_mode:'HTML'
                                        })
                                }
                            })
                        }
                    }else{
                        if(ctx.chat.type == 'private') {
                            await saver.checkFile(`${document.file_unique_id}`).then((res) => {
                                //console.log(res);
                                if(res == true) {
                                    ctx.reply(`File sudah ada.`,{
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                }else{
                                    saver.saveFile(fileDetails4)
                                    ctx.reply(`✔️ Grup disimpan \n<b>Nama file:</b> ${fileDetails4.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_unique_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,{
                                        parse_mode: 'HTML',
                                        disable_web_page_preview: true,
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                    if(ctx.message.caption == undefined)                   
                                        return ctx.replyWithDocument(document.file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails4.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                            parse_mode:'HTML'
                                        })
                                        ctx.replyWithDocument(document.file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `${ctx.message.caption}\n\n✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails4.file_name}\n<b>Size:</b> ${document.file_size} B\n<b>ID file:</b> ${document.file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                            parse_mode:'HTML'
                                        })
                                }
                            })
                        }
                    }
                }
            }
            
        //}
        //catch(error){
        //    ctx.reply(`${messagebotnoaddgroup(ctx)}`)
        //}
    }

})

//video files
bot.on('video', async(ctx, next) => {
    await new Promise((resolve, reject) =>{
        setTimeout(()=>{
            return resolve("Result");
        }, 5_000);
    });
    await next();
    if(ctx.chat.type == 'private') {
        video = ctx.message.video

        if(ctx.message.media_group_id == undefined){
            if(video.file_name == undefined){
                fileDetails1 = {
                    file_name: today2(ctx),
                    userId:ctx.from.id,
                    file_id: video.file_id,
                    caption: ctx.message.caption,
                    file_size: video.file_size,
                    uniqueId: video.file_unique_id,
                    type: 'video'
                }
            }else{
                var exstension = video.file_name;
                var regex = /\.[A-Za-z0-9]+$/gm
                var vidext = exstension.replace(regex, '');
                fileDetails2 = {
                    file_name: vidext,
                    userId:ctx.from.id,
                    file_id: video.file_id,
                    caption: ctx.message.caption,
                    file_size: video.file_size,
                    uniqueId: video.file_unique_id,
                    type: 'video'
                }
            }
        }else{
            if(video.file_name == undefined){
                fileDetails3 = {
                    file_name: today2(ctx),
                    userId:ctx.from.id,
                    file_id: video.file_id,
                    mediaId: ctx.message.media_group_id,
                    caption: ctx.message.caption,
                    file_size: video.file_size,
                    uniqueId: video.file_unique_id,
                    type: 'video'
                }
            }else{
                var exstension2 = video.file_name;
                var regex2 = /\.[A-Za-z0-9]+$/gm
                var vidext2 = exstension2.replace(regex2, '');
                fileDetails4 = {
                    file_name: vidext2,
                    userId:ctx.from.id,
                    file_id: video.file_id,
                    mediaId: ctx.message.media_group_id,
                    caption: ctx.message.caption,
                    file_size: video.file_size,
                    uniqueId: video.file_unique_id,
                    type: 'video'
                }
            }
        }
    }
  
    if(ctx.from.id == process.env.ADMIN || ctx.from.id == process.env.ADMIN1 || ctx.from.id == process.env.ADMIN2){
        if(ctx.message.media_group_id == undefined){
            if(video.file_name == undefined){
                if(ctx.chat.type == 'private') {
                    await saver.checkFile(`${video.file_unique_id}`).then((res) => {
                        //console.log(res);
                        if(res == true) {
                            ctx.reply(`File sudah ada.`,{
                                reply_to_message_id: ctx.message.message_id
                            })
                        }else{
                            saver.saveFile(fileDetails1)
                            ctx.reply(`✔️ Video disimpan \n<b>Nama file:</b> ${fileDetails1.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_unique_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}`,{
                                parse_mode: 'HTML',
                                disable_web_page_preview: true,
                                reply_to_message_id: ctx.message.message_id
                            })
                            if(ctx.message.caption == undefined)
                                return ctx.replyWithVideo(video.file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `✔️ Video disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails1.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}`,
                                    parse_mode:'HTML'
                                })
                                ctx.replyWithVideo(video.file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `${ctx.message.caption}\n\n✔️ Video disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails1.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}`,
                                    parse_mode:'HTML'
                                })
                        }
                    })
                }
            }else{
                if(ctx.chat.type == 'private') {
                    await saver.checkFile(`${video.file_unique_id}`).then((res) => {
                        //console.log(res);
                        if(res == true) {
                            ctx.reply(`File sudah ada.`,{
                                reply_to_message_id: ctx.message.message_id
                            })
                        }else{
                            saver.saveFile(fileDetails2)
                            ctx.reply(`✔️ Video disimpan \n<b>Nama file:</b> ${fileDetails2.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_unique_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}`,{
                                parse_mode: 'HTML',
                                disable_web_page_preview: true,
                                reply_to_message_id: ctx.message.message_id
                            })
                            if(ctx.message.caption == undefined)
                                return ctx.replyWithVideo(video.file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `✔️ Video disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails2.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}`,
                                    parse_mode:'HTML'
                                })
                                ctx.replyWithVideo(video.file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `${ctx.message.caption}\n\n✔️ Video disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails2.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}`,
                                    parse_mode:'HTML'
                                })
                        }
                    })
                }
            }
        }else{
            if(video.file_name == undefined){
                if(ctx.chat.type == 'private') {
                    await saver.checkFile(`${video.file_unique_id}`).then((res) => {
                        //console.log(res);
                        if(res == true) {
                            ctx.reply(`File sudah ada.`,{
                                reply_to_message_id: ctx.message.message_id
                            })
                        }else{
                            saver.saveFile(fileDetails3)
                            ctx.reply(`✔️ Grup disimpan \n<b>Nama file:</b> ${fileDetails3.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_unique_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,{
                                parse_mode: 'HTML',
                                disable_web_page_preview: true,
                                reply_to_message_id: ctx.message.message_id
                            })
                            if(ctx.message.caption == undefined)                   
                                return ctx.replyWithVideo(video.file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails3.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                    parse_mode:'HTML'
                                })
                                ctx.replyWithVideo(video.file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `${ctx.message.caption}\n\n✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails3.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${video.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                    parse_mode:'HTML'
                                })
                        }
                    })
                }
            }else{
                if(ctx.chat.type == 'private') {
                    await saver.checkFile(`${video.file_unique_id}`).then((res) => {
                        //console.log(res);
                        if(res == true) {
                            ctx.reply(`File sudah ada.`,{
                                reply_to_message_id: ctx.message.message_id
                            })
                        }else{
                            saver.saveFile(fileDetails4)
                            ctx.reply(`✔️ Grup disimpan \n<b>Nama file:</b> ${fileDetails4.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_unique_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,{
                                parse_mode: 'HTML',
                                disable_web_page_preview: true,
                                reply_to_message_id: ctx.message.message_id
                            })
                            if(ctx.message.caption == undefined)                   
                                return ctx.replyWithVideo(video.file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails4.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                    parse_mode:'HTML'
                                })
                                ctx.replyWithVideo(video.file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `${ctx.message.caption}\n\n✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails4.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                    parse_mode:'HTML'
                                })
                        }
                    })
                }
            }
        }
    }else{
        //try{
            var botStatus = await bot.telegram.getChatMember(channelId, ctx.botInfo.id)
            var member = await bot.telegram.getChatMember(channelId, ctx.from.id)
            //console.log(member);
            if(member.status == 'restricted' || member.status == 'left' || member.status == 'kicked'){
                const profile2 = await bot.telegram.getUserProfilePhotos(ctx.from.id)
                await saver.checkBan(`${ctx.from.id}`).then((res) => {
                    //console.log(res);
                    if(res == true) {
                        if(ctx.chat.type == 'private') {
                            ctx.reply(`${messagebanned(ctx)}`)
                        }
                    }else{
                      if(ctx.chat.type == 'private') {
                        if(!profile2 || profile2.total_count == 0)
                            return ctx.reply(`<a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${welcomejoin(ctx)}`,{
                                parse_mode:'HTML',
                                disable_web_page_preview: true,
                                reply_markup:{
                                    inline_keyboard:inKey2
                                }
                            })
                            ctx.replyWithPhoto(profile2.photos[0][0].file_id,{caption: `<a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${welcomejoin(ctx)}`,
                                parse_mode:'HTML',
                                disable_web_page_preview: true,
                                reply_markup:{
                                    inline_keyboard:inKey2
                                }
                            })
                       }
                    }
                })
            }else{
                if(ctx.chat.type == 'private') {
                    video = ctx.message.video

                    if(ctx.message.media_group_id == undefined){
                        if(video.file_name == undefined){
                            fileDetails1 = {
                                file_name: today2(ctx),
                                userId:ctx.from.id,
                                file_id: video.file_id,
                                caption: ctx.message.caption,
                                file_size: video.file_size,
                                uniqueId: video.file_unique_id,
                                type: 'video'
                            }
                        }else{
                            var exstension = video.file_name;
                            var regex = /\.[A-Za-z0-9]+$/gm
                            var vidext = exstension.replace(regex, '');
                            fileDetails2 = {
                                file_name: vidext,
                                userId:ctx.from.id,
                                file_id: video.file_id,
                                caption: ctx.message.caption,
                                file_size: video.file_size,
                                uniqueId: video.file_unique_id,
                                type: 'video'
                            }
                        }
                    }else{
                        if(video.file_name == undefined){
                            fileDetails3 = {
                                file_name: today2(ctx),
                                userId:ctx.from.id,
                                file_id: video.file_id,
                                mediaId: ctx.message.media_group_id,
                                caption: ctx.message.caption,
                                file_size: video.file_size,
                                uniqueId: video.file_unique_id,
                                type: 'video'
                            }
                        }else{
                            var exstension2 = video.file_name;
                            var regex2 = /\.[A-Za-z0-9]+$/gm
                            var vidext2 = exstension2.replace(regex2, '');
                            fileDetails4 = {
                                file_name: vidext2,
                                userId:ctx.from.id,
                                file_id: video.file_id,
                                mediaId: ctx.message.media_group_id,
                                caption: ctx.message.caption,
                                file_size: video.file_size,
                                uniqueId: video.file_unique_id,
                                type: 'video'
                            }
                        }
                    }
                }

                if(ctx.message.media_group_id == undefined){
                    if(video.file_name == undefined){
                        if(ctx.chat.type == 'private') {
                            await saver.checkFile(`${video.file_unique_id}`).then((res) => {
                                //console.log(res);
                                if(res == true) {
                                    ctx.reply(`File sudah ada.`,{
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                }else{
                                    saver.saveFile(fileDetails1)
                                    ctx.reply(`✔️ Video disimpan \n<b>Nama file:</b> ${fileDetails1.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_unique_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}`,{
                                        parse_mode: 'HTML',
                                        disable_web_page_preview: true,
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                    if(ctx.message.caption == undefined)
                                        return ctx.replyWithVideo(video.file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `✔️ Video disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails1.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}`,
                                            parse_mode:'HTML'
                                        })
                                        ctx.replyWithVideo(video.file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `${ctx.message.caption}\n\n✔️ Video disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails1.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}`,
                                            parse_mode:'HTML'
                                        })
                                }
                            })
                        }
                    }else{
                        if(ctx.chat.type == 'private') {
                            await saver.checkFile(`${video.file_unique_id}`).then((res) => {
                                //console.log(res);
                                if(res == true) {
                                    ctx.reply(`File sudah ada.`,{
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                }else{
                                    saver.saveFile(fileDetails2)
                                    ctx.reply(`✔️ Video disimpan \n<b>Nama file:</b> ${fileDetails2.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_unique_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}`,{
                                        parse_mode: 'HTML',
                                        disable_web_page_preview: true,
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                    if(ctx.message.caption == undefined)
                                        return ctx.replyWithVideo(video.file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `✔️ Video disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails2.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}`,
                                            parse_mode:'HTML'
                                        })
                                        ctx.replyWithVideo(video.file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `${ctx.message.caption}\n\n✔️ Video disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails2.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}`,
                                            parse_mode:'HTML'
                                        })
                                }
                            })
                        }
                    }
                }else{
                    if(video.file_name == undefined){
                        if(ctx.chat.type == 'private') {
                            await saver.checkFile(`${video.file_unique_id}`).then((res) => {
                                //console.log(res);
                                if(res == true) {
                                    ctx.reply(`File sudah ada.`,{
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                }else{
                                    saver.saveFile(fileDetails3)
                                    ctx.reply(`✔️ Grup disimpan \n<b>Nama file:</b> ${fileDetails3.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_unique_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,{
                                        parse_mode: 'HTML',
                                        disable_web_page_preview: true,
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                    if(ctx.message.caption == undefined)                   
                                        return ctx.replyWithVideo(video.file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails3.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                            parse_mode:'HTML'
                                        })
                                        ctx.replyWithVideo(video.file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `${ctx.message.caption}\n\n✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails3.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${video.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                            parse_mode:'HTML'
                                        })
                                }
                            })
                        }
                    }else{
                        if(ctx.chat.type == 'private') {
                            await saver.checkFile(`${video.file_unique_id}`).then((res) => {
                                //console.log(res);
                                if(res == true) {
                                    ctx.reply(`File sudah ada.`,{
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                }else{
                                    saver.saveFile(fileDetails4)
                                    ctx.reply(`✔️ Grup disimpan \n<b>Nama file:</b> ${fileDetails4.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_unique_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,{
                                        parse_mode: 'HTML',
                                        disable_web_page_preview: true,
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                    if(ctx.message.caption == undefined)                   
                                        return ctx.replyWithVideo(video.file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails4.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                            parse_mode:'HTML'
                                        })
                                        ctx.replyWithVideo(video.file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `${ctx.message.caption}\n\n✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails4.file_name}\n<b>Size:</b> ${video.file_size} B\n<b>ID file:</b> ${video.file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                            parse_mode:'HTML'
                                        })
                                }
                            })
                        }
                    }
                }
            }
            
        //}
        //catch(error){
        //    ctx.reply(`${messagebotnoaddgroup(ctx)}`)
        //}
    }

})

//photo files
bot.on('photo', async(ctx, next) => {
    await new Promise((resolve, reject) =>{
        setTimeout(()=>{
            return resolve("Result");
        }, 5_000);
    });
    await next();
    if(ctx.chat.type == 'private') {
        photo = ctx.message.photo
        
        if(ctx.message.media_group_id == undefined){
            if(photo[1].file_name == undefined){
                fileDetails1 = {
                    file_name: today2(ctx),
                    userId:ctx.from.id,
                    file_id: photo[1].file_id,
                    caption: ctx.message.caption,
                    file_size: photo[1].file_size,
                    uniqueId: photo[1].file_unique_id,
                    type: 'photo'
                }
            }else{
                var exstension = photo[1].file_name;
                var regex = /\.[A-Za-z0-9]+$/gm
                var photext = exstension.replace(regex, '');
                fileDetails2 = {
                    file_name: photext,
                    userId:ctx.from.id,
                    file_id: photo[1].file_id,
                    caption: ctx.message.caption,
                    file_size: photo[1].file_size,
                    uniqueId: photo[1].file_unique_id,
                    type: 'photo'
                }
            }
        }else{
            if(photo[1].file_name == undefined){
                fileDetails3 = {
                    file_name: today2(ctx),
                    userId:ctx.from.id,
                    file_id: photo[1].file_id,
                    mediaId: ctx.message.media_group_id,
                    caption: ctx.message.caption,
                    file_size: photo[1].file_size,
                    uniqueId: photo[1].file_unique_id,
                    type: 'photo'
                }
            }else{
                var exstension2 = photo[1].file_name;
                var regex2 = /\.[A-Za-z0-9]+$/gm
                var photext2 = exstension2.replace(regex2, '');
                fileDetails4 = {
                    file_name: photext2,
                    userId:ctx.from.id,
                    file_id: photo[1].file_id,
                    mediaId: ctx.message.media_group_id,
                    caption: ctx.message.caption,
                    file_size: photo[1].file_size,
                    uniqueId: photo[1].file_unique_id,
                    type: 'photo'
                }
            }
        }
    }

    if(ctx.from.id == process.env.ADMIN || ctx.from.id == process.env.ADMIN1 || ctx.from.id == process.env.ADMIN2){
        if(ctx.message.media_group_id == undefined){
            if(photo[1].file_name == undefined){
                if(ctx.chat.type == 'private'){
                    await saver.checkFile(`${photo[1].file_unique_id}`).then((res) => {
                        //console.log(res);
                        if(res == true) {
                            ctx.reply(`File sudah ada.`,{
                                reply_to_message_id: ctx.message.message_id
                            })
                        }else{
                            saver.saveFile(fileDetails1)
                            ctx.reply(`✔️ Photo disimpan \n<b>Nama file:</b> ${fileDetails1.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_unique_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}`,{
                                parse_mode: 'HTML',
                                disable_web_page_preview: true,
                                reply_to_message_id: ctx.message.message_id
                            })
                            if(ctx.message.caption == undefined)
                                return ctx.replyWithPhoto(photo[1].file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `✔️ Photo disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails1.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}`,
                                    parse_mode:'HTML'
                                })
                                ctx.replyWithPhoto(photo[1].file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `${ctx.message.caption}\n\n✔️ Photo disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails1.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}`,
                                    parse_mode:'HTML'
                                })
                        }
                    })
                }
            }else{
                if(ctx.chat.type == 'private'){
                    await saver.checkFile(`${photo[1].file_unique_id}`).then((res) => {
                        //console.log(res);
                        if(res == true) {
                            ctx.reply(`File sudah ada.`,{
                                reply_to_message_id: ctx.message.message_id
                            })
                        }else{
                            saver.saveFile(fileDetails2)
                            ctx.reply(`✔️ Photo disimpan \n<b>Nama file:</b> ${fileDetails2.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_unique_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}`,{
                                parse_mode: 'HTML',
                                disable_web_page_preview: true,
                                reply_to_message_id: ctx.message.message_id
                            })
                            if(ctx.message.caption == undefined)
                                return ctx.replyWithPhoto(photo[1].file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `✔️ Photo disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails2.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}`,
                                    parse_mode:'HTML'
                                })
                                ctx.replyWithPhoto(photo[1].file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `${ctx.message.caption}\n\n✔️ Photo disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails2.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}`,
                                    parse_mode:'HTML'
                                })
                        }
                    })
                }
            }
        }else{
            if(photo[1].file_name == undefined){
                if(ctx.chat.type == 'private') {
                    await saver.checkFile(`${photo[1].file_unique_id}`).then((res) => {
                        //console.log(res);
                        if(res == true) {
                            ctx.reply(`File sudah ada.`,{
                                reply_to_message_id: ctx.message.message_id
                            })
                        }else{
                            saver.saveFile(fileDetails3)
                            ctx.reply(`✔️ Grup disimpan \n<b>Nama file:</b> ${fileDetails3.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_unique_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,{
                                parse_mode: 'HTML',
                                disable_web_page_preview: true,
                                reply_to_message_id: ctx.message.message_id
                            })
                            if(ctx.message.caption == undefined)                   
                                return ctx.replyWithPhoto(photo[1].file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails3.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                    parse_mode:'HTML'
                                })
                                ctx.replyWithPhoto(photo[1].file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `${ctx.message.caption}\n\n✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails3.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${photo[1].file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                    parse_mode:'HTML'
                                })
                        }
                    })
                }
            }else{
                if(ctx.chat.type == 'private') {
                    await saver.checkFile(`${photo[1].file_unique_id}`).then((res) => {
                        //console.log(res);
                        if(res == true) {
                            ctx.reply(`File sudah ada.`,{
                                reply_to_message_id: ctx.message.message_id
                            })
                        }else{
                            saver.saveFile(fileDetails4)
                            ctx.reply(`✔️ Grup disimpan \n<b>Nama file:</b> ${fileDetails4.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_unique_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,{
                                parse_mode: 'HTML',
                                disable_web_page_preview: true,
                                reply_to_message_id: ctx.message.message_id
                            })
                            if(ctx.message.caption == undefined)                   
                                return ctx.replyWithPhoto(photo[1].file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails4.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                    parse_mode:'HTML'
                                })
                                ctx.replyWithPhoto(photo[1].file_id, {
                                    chat_id: process.env.LOG_CHANNEL,
                                    caption: `${ctx.message.caption}\n\n✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails4.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                    parse_mode:'HTML'
                                })
                        }
                    })
                }
            }
        }
    }else{
        //try{
            var botStatus = await bot.telegram.getChatMember(channelId, ctx.botInfo.id)
            var member = await bot.telegram.getChatMember(channelId, ctx.from.id)
            //console.log(member);
            if(member.status == 'restricted' || member.status == 'left' || member.status == 'kicked'){
                const profile2 = await bot.telegram.getUserProfilePhotos(ctx.from.id)
                await saver.checkBan(`${ctx.from.id}`).then((res) => {
                    //console.log(res);
                    if(res == true) {
                        if(ctx.chat.type == 'private') {
                            ctx.reply(`${messagebanned(ctx)}`)
                        }
                    }else{
                      if(ctx.chat.type == 'private') {
                        if(!profile2 || profile2.total_count == 0)
                            return ctx.reply(`<a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${welcomejoin(ctx)}`,{
                                parse_mode:'HTML',
                                disable_web_page_preview: true,
                                reply_markup:{
                                    inline_keyboard:inKey2
                                }
                            })
                            ctx.replyWithPhoto(profile2.photos[0][0].file_id,{caption: `<a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${welcomejoin(ctx)}`,
                                parse_mode:'HTML',
                                disable_web_page_preview: true,
                                reply_markup:{
                                    inline_keyboard:inKey2
                                }
                            })
                       }
                    }
                })
            }else{
                if(ctx.chat.type == 'private') {
                    photo = ctx.message.photo

                    if(ctx.message.media_group_id == undefined){
                        if(photo[1].file_name == undefined){
                            fileDetails1 = {
                                file_name: today2(ctx),
                                userId:ctx.from.id,
                                file_id: photo[1].file_id,
                                caption: ctx.message.caption,
                                file_size: photo[1].file_size,
                                uniqueId: photo[1].file_unique_id,
                                type: 'photo'
                            }
                        }else{
                            var exstension = photo[1].file_name;
                            var regex = /\.[A-Za-z0-9]+$/gm
                            var photext = exstension.replace(regex, '');
                            fileDetails2 = {
                                file_name: photext,
                                userId:ctx.from.id,
                                file_id: photo[1].file_id,
                                caption: ctx.message.caption,
                                file_size: photo[1].file_size,
                                uniqueId: photo[1].file_unique_id,
                                type: 'photo'
                            }
                        }
                    }else{
                        if(photo[1].file_name == undefined){
                            fileDetails3 = {
                                file_name: today2(ctx),
                                userId:ctx.from.id,
                                file_id: photo[1].file_id,
                                mediaId: ctx.message.media_group_id,
                                caption: ctx.message.caption,
                                file_size: photo[1].file_size,
                                uniqueId: photo[1].file_unique_id,
                                type: 'photo'
                            }
                        }else{
                            var exstension2 = photo[1].file_name;
                            var regex2 = /\.[A-Za-z0-9]+$/gm
                            var photext2 = exstension2.replace(regex2, '');
                            fileDetails4 = {
                                file_name: photext2,
                                userId:ctx.from.id,
                                file_id: photo[1].file_id,
                                mediaId: ctx.message.media_group_id,
                                caption: ctx.message.caption,
                                file_size: photo[1].file_size,
                                uniqueId: photo[1].file_unique_id,
                                type: 'photo'
                            }
                        }
                    }
                }

                if(ctx.message.media_group_id == undefined){
                    if(photo[1].file_name == undefined){
                        if(ctx.chat.type == 'private'){
                            await saver.checkFile(`${photo[1].file_unique_id}`).then((res) => {
                                //console.log(res);
                                if(res == true) {
                                    ctx.reply(`File sudah ada.`,{
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                }else{
                                    saver.saveFile(fileDetails1)
                                    ctx.reply(`✔️ Photo disimpan \n<b>Nama file:</b> ${fileDetails1.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_unique_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}`,{
                                        parse_mode: 'HTML',
                                        disable_web_page_preview: true,
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                    if(ctx.message.caption == undefined)
                                        return ctx.replyWithPhoto(photo[1].file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `✔️ Photo disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails1.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}`,
                                            parse_mode:'HTML'
                                        })
                                        ctx.replyWithPhoto(photo[1].file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `${ctx.message.caption}\n\n✔️ Photo disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails1.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}`,
                                            parse_mode:'HTML'
                                        })
                                }
                            })
                        }
                    }else{
                        if(ctx.chat.type == 'private'){
                            await saver.checkFile(`${photo[1].file_unique_id}`).then((res) => {
                                //console.log(res);
                                if(res == true) {
                                    ctx.reply(`File sudah ada.`,{
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                }else{
                                    saver.saveFile(fileDetails2)
                                    ctx.reply(`✔️ Photo disimpan \n<b>Nama file:</b> ${fileDetails2.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_unique_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}`,{
                                        parse_mode: 'HTML',
                                        disable_web_page_preview: true,
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                    if(ctx.message.caption == undefined)
                                        return ctx.replyWithPhoto(photo[1].file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `✔️ Photo disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails2.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}`,
                                            parse_mode:'HTML'
                                        })
                                        ctx.replyWithPhoto(photo[1].file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `${ctx.message.caption}\n\n✔️ Photo disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails2.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}`,
                                            parse_mode:'HTML'
                                        })
                                }
                            })
                        }
                    }
                }else{
                    if(photo[1].file_name == undefined){
                        if(ctx.chat.type == 'private') {
                            await saver.checkFile(`${photo[1].file_unique_id}`).then((res) => {
                                //console.log(res);
                                if(res == true) {
                                    ctx.reply(`File sudah ada.`,{
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                }else{
                                    saver.saveFile(fileDetails3)
                                    ctx.reply(`✔️ Grup disimpan \n<b>Nama file:</b> ${fileDetails3.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_unique_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,{
                                        parse_mode: 'HTML',
                                        disable_web_page_preview: true,
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                    if(ctx.message.caption == undefined)                   
                                        return ctx.replyWithPhoto(photo[1].file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails3.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                            parse_mode:'HTML'
                                        })
                                        ctx.replyWithPhoto(photo[1].file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `${ctx.message.caption}\n\n✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails3.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${photo[1].file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                            parse_mode:'HTML'
                                        })
                                }
                            })
                        }
                    }else{
                        if(ctx.chat.type == 'private') {
                            await saver.checkFile(`${photo[1].file_unique_id}`).then((res) => {
                                //console.log(res);
                                if(res == true) {
                                    ctx.reply(`File sudah ada.`,{
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                }else{
                                    saver.saveFile(fileDetails4)
                                    ctx.reply(`✔️ Grup disimpan \n<b>Nama file:</b> ${fileDetails4.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_unique_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,{
                                        parse_mode: 'HTML',
                                        disable_web_page_preview: true,
                                        reply_to_message_id: ctx.message.message_id
                                    })
                                    if(ctx.message.caption == undefined)                   
                                        return ctx.replyWithPhoto(photo[1].file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails4.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                            parse_mode:'HTML'
                                        })
                                        ctx.replyWithPhoto(photo[1].file_id, {
                                            chat_id: process.env.LOG_CHANNEL,
                                            caption: `${ctx.message.caption}\n\n✔️ Grup disimpan \n<b>Dari:</b> ${ctx.from.id}\n<b>Nama:</b> <a href="tg://openmessage?user_id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Nama file:</b> ${fileDetails4.file_name}\n<b>Size:</b> ${photo[1].file_size} B\n<b>ID file:</b> ${photo[1].file_id}\n<b>ID grup:</b> ${ctx.message.media_group_id}\n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo[1].file_unique_id}\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${ctx.message.media_group_id}`,
                                            parse_mode:'HTML'
                                        })
                                }
                            })
                        }
                    }
                }
            }
            
        //}
        //catch(error){
        //    ctx.reply(`${messagebotnoaddgroup(ctx)}`)
        //}
    }

})

bot.command('stats',async(ctx)=>{
    stats = await saver.getUser().then((res)=>{
        if(ctx.from.id == process.env.ADMIN || ctx.from.id == process.env.ADMIN1 || ctx.from.id == process.env.ADMIN2){
            ctx.reply(`📊 Total pengguna: <b>${res.length}</b>`,{parse_mode:'HTML'})
        }
        
    })
    stats = await saver.getMedia().then((res)=>{
        if(ctx.from.id == process.env.ADMIN || ctx.from.id == process.env.ADMIN1 || ctx.from.id == process.env.ADMIN2){
            ctx.reply(`📊 Total media: <b>${res.length}</b>`,{parse_mode:'HTML'})
        }

    })
    stats = await saver.getBan().then((res)=>{
        if(ctx.from.id == process.env.ADMIN || ctx.from.id == process.env.ADMIN1 || ctx.from.id == process.env.ADMIN2){
            ctx.reply(`📊 Total pengguna melanggar: <b>${res.length}</b>`,{parse_mode:'HTML'})
        }
        
    })
    stats = await saver.getGroup().then((res)=>{
        if(ctx.from.id == process.env.ADMIN || ctx.from.id == process.env.ADMIN1 || ctx.from.id == process.env.ADMIN2){
            ctx.reply(`📊 Total grup terdaftar: <b>${res.length}</b>`,{parse_mode:'HTML'})
        }
        
    })
})
 
//heroku config
domain = `${process.env.DOMAIN}.herokuapp.com`
bot.launch({
    webhook:{
       domain:domain,
        port:Number(process.env.PORT) 
    }
})
