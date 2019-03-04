const chalk    = require('chalk');
const Discord  = require('discord.js');
const client   = new Discord.Client();

const functions = require('./functions.js');
const events    = require('./events.js');
const config    = require('./config.js');
const prefix    = config.discord.prefix;

// Ready Event //
client.on('ready', () => {
    client.generateInvite(8).then(invite => {
        functions.run(client);
        console.log(`${chalk.green(`[L]`)} | ${chalk.green(`Illusion Music Bot Ready! - Logged in as ${client.user.username} - Current prefix is: ${config.discord.prefix}\nInvite link: ${invite}\nCreated by Tetrabyte#4866 (@TheTetrabyte)`)}`);
        client.user.setPresence({ status: `online`, activity: { name: `Illusion Music Bot v1.0` } });
    });
});

// Error Event //
client.on('error', err => { console.log(`${chalk.green('[E]')} | ${chalk.red(`Error, please report this on the github - ${err}`)}`); });

// Disconnect Event //
client.on(`disconnected`, () => { console.log(`${chalk.green('[E]')} | ${chalk.yellow(`It seems we've disconnected from discord and can't reconnect, please try restarting the bot and check your credentials`)}`); });

// Message Event //
client.on(`message`, msg => { events.msg(msg, client); });

// Login to the client //
client.login(config.discord.token);