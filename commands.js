const config = require('./config.js');
const functions = require('./functions.js');

const Players = functions.getPlayers;
const Manager = functions.getManager;

const cmds = [];

cmds.ping = {
    name: `ping`,
    help: `Just a test command to see if the bot is online.`,
    trigger: ({ client, msg, params, raw, clean }) => {
        let ms = 0;
        let mscount = setInterval(() => { ms++; }, 1);
        msg.channel.send('Pinging').then((m) => { m.edit('Pong : **' + ms + 'ms**'); clearInterval(mscount); });
    }
};

cmds.play = {
    name: `play`,
    help: `Play some music using a youtube link.`,
    trigger: ({ client, msg, params, raw, clean }) => {
        functions.summon(msg).then(Player => {
            if (!msg.member.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `You must be in a voice channel to use the play command`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
            
            functions.fetchLink(raw).then(link => {
                functions.queueAdd({ Player, link, msg }).then((que) => {
                    if (Player.playing == null) {
                        functions.playNext({ Player, client }).catch(err => {
                            if (err.message && err.message == "no_track") {
                                return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `Sorry but that track could not be found, we're sorry for the trouble`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
                            }
    
                            console.error(`Error executing playNext function - Error: ${err}`);
                            return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `Well, that was unexpected. Sorry about that something broke. Please try again later`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
                        });
                    } else {
                        if (que.type != "playlist") {
                            msg.channel.send({ embed: { title: `Song added to queue`, color: 255, description: `That song has been added to the queue, view the queue with \`${config.discord.prefix}queue\``, fields: [ { name: `Title`, value: `[${que.info.title}](${que.info.url})` }, { name: `Author`, value: `[${que.info.author.name}](${que.info.author.url})` }, { name: `Service`, value: (que.info.service == "youtube" ? `[YouTube](https://YouTube.com)` : `[SoundCloud](https://SoundCloud.com)`) }, { name: `Requested By`, value: `${que.user.tag}` } ], footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
                        }
                    }
                }).catch(err => {
                    console.error(`Error on play command in ${msg.guild.name} - Error: ${err}`);
                    return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `I was unable to fetch a song with that query, please try again`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
                });
        
            }).catch(err => {
                if (err.message && err.message == "no_tracks") {
                    return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `I was unable to find a song with that query, please try again`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
                } else if (err.message && err.message == "not_supported") {
                    return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `Sorry that provider is not yet support on Illusion Music`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
                } else {
                    console.error(`Error fetching link from ${raw} - Error: ${err}`);
                    return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `I was unable to find a song due to an unexpected error, please try again later`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
                }
            });
        }).catch(err => {
            console.error(`Error on play command in ${msg.guild.name} - Error: ${err}`);
            return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `I was unable to play a song due to an unexpected error, please try again later`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        });
    }
};

cmds.stop = {
    name: `stop`,
    help: `Make the bot stop playing music and disconnect from the channel.`,
    trigger: ({ client, msg, params, raw, clean }) => {
        let Player = Players().get(msg.guild.id);
        if (!Player) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `I'm currently not playing in this server, play something with \`${config.discord.prefix}play <YouTube Link>\` and try again`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (!msg.guild.me.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `Something went wrong, I cannot detect my current voice channel, try again later`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (!msg.member.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `You must be in a voice channel to use the play command`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (msg.member.voice.channel != msg.guild.me.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `You must be in my current voice channel to use the play command`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });

        Player.player.stop();
        Manager().leave(Player.guild.id);
        Players().delete(Player.guild.id);
        Player.player.disconnect(`stopped`);

        return msg.channel.send({ embed: { title: `Illusion Music`, color: 65280, description: `Music stoppped, bot disconnected`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
    }
};

cmds.volume = {
    name: `volume`,
    help: `Change the current volume that the music is playing on.`,
    trigger: ({ client, msg, params, raw, clean }) => {
        let volume = parseInt(raw.replace(/%/g, ''));
        let Player = Players().get(msg.guild.id);
        if (!Player) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `I'm currently not playing in this server, play something with \`${config.discord.prefix}play <YouTube Link>\` and try again`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (!msg.guild.me.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `Something went wrong, I cannot detect my current voice channel, try again later`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (!msg.member.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `You must be in a voice channel to use the play command`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (msg.member.voice.channel != msg.guild.me.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `You must be in my current voice channel to use the volume command`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        
        if (isNaN(volume) || !volume) {
            return msg.channel.send({ embed: { title: "Current Volume", color: 4748292, description: `To change the volume use the command \`${config.discord.prefix}volume <Number>\``, fields: [ { name: 'Volume Level 🔈', value: `${Player.volume.percent}%` } ], footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        }

        if (Math.floor(volume) > 100 || Math.floor(volume) < 1) {
            return msg.channel.send({ embed: { title: "Error", color: 16711680, description: `You can only use the volume command with a number between 1-100%, please check your command and try again.`, timestamp: new Date(), footer: { text: "Illusion Music", icon_url: client.user.avatarURL() } } });
        }

        Player.player.volume(volume);

        return msg.channel.send({ embed: { title: `Volume Adjusted`, color: 581923, fields: [ { name: 'Volume Level 🔈', value: `${Player.volume.percent}%` }, { name: 'Adjusted Volume 🔈', value: `${Math.floor(volume)}%` } ], timestamp: new Date(), footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() } } });
    }
};

cmds.pause = {
    name: `pause`,
    help: `Pause the current playing song.`,
    trigger: ({ client, msg, params, raw, clean }) => {
        let Player = Players().get(msg.guild.id);
        if (!Player) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `I'm currently not playing in this server, play something with \`${config.discord.prefix}play <YouTube Link>\` and try again`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (!msg.guild.me.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `Something went wrong, I cannot detect my current voice channel, try again later`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (!msg.member.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `You must be in a voice channel to use the play command`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (msg.member.voice.channel != msg.guild.me.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `You must be in my current voice channel to use the pause command`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        
        if (Player.player.paused) {
            return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `The player is already paused, if you're trying to resume it type \`${config.discord.prefix}resume\``, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        }

        Player.player.pause(true);

        return msg.channel.send({ embed: { title: `Player Paused`, color: 581923, description: `Player is now paused, to resume it type \`${config.discord.prefix}resume\``, timestamp: new Date(), footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() } } });
    }
};

cmds.resume = {
    name: `resume`,
    help: `Resume the music playing if you paused it.`,
    trigger: ({ client, msg, params, raw, clean }) => {
        let Player = Players().get(msg.guild.id);
        if (!Player) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `I'm currently not playing in this server, play something with \`${config.discord.prefix}play <YouTube Link>\` and try again`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (!msg.guild.me.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `Something went wrong, I cannot detect my current voice channel, try again later`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (!msg.member.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `You must be in a voice channel to use the play command`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (msg.member.voice.channel != msg.guild.me.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `You must be in my current voice channel to use the resume command`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        
        if (!Player.player.paused) {
            return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `The player is not currently paused, if you're trying to pause it type \`${config.discord.prefix}pause\``, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        }

        Player.player.pause(false);

        return msg.channel.send({ embed: { title: `Player Paused`, color: 581923, description: `Player successfully resumed, to pause it again type \`${config.discord.prefix}pause\``, timestamp: new Date(), footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() } } });
    }
};

cmds.queue = {
    name: `queue`,
    help: `Get a list of the songs currently in the queue.`,
    trigger: ({ client, msg, params, raw, clean }) => {
        let Player = Players().get(msg.guild.id);
        if (!Player) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `I'm currently not playing in this server, play something with \`${config.discord.prefix}play <YouTube Link>\` and try again`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (!msg.guild.me.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `Something went wrong, I cannot detect my current voice channel, try again later`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (!msg.member.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `You must be in a voice channel to use the play command`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (msg.member.voice.channel != msg.guild.me.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `You must be in my current voice channel to use the play command`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (Player.queue.length <= 0) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `The queue is currently empty, add some songs with \`${config.discord.prefix}play <YouTube Link>\``, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });

        let items = Player.queue.map((item, index) => `**#${index+1}:** **${item.title.substring(0, 24)}** - ${item.author.name} (Added by: ${item.user.tag})`);

        if (items.length > 20) {
            text = `${items.slice(0, 20).join('\n')}\n\n**and ${items.length-20} more**`;
        } else {
            text = `${items.join('\n')}`;
        }

        return msg.channel.send({ embed: { title: `Current queue`, color: 16744448, description: text, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
    }
};

cmds.skip = {
    name: `skip`,
    help: `Skip the current song.`,
    trigger: ({ client, msg, params, raw, clean }) => {
        let Player = Players().get(msg.guild.id);
        if (!Player) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `I'm currently not playing in this server, play something with \`${config.discord.prefix}play <YouTube Link>\` and try again`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (!msg.guild.me.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `Something went wrong, I cannot detect my current voice channel, try again later`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (!msg.member.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `You must be in a voice channel to use the play command`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (msg.member.voice.channel != msg.guild.me.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `You must be in my current voice channel to use the play command`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });

        if (Player.playing != null) {
            Player.player.stop();
            Player.playing = null;
            return msg.channel.send({ embed: { title: `Song skipped`, color: 16744448, description: `Song was skipped`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        }
    }
};

cmds.shuffle = {
    name: `shuffle`,
    help: `Shuffle the current queue.`,
    trigger: ({ client, msg, params, raw, clean }) => {
        let Player = Players().get(msg.guild.id);
        if (!Player) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `I'm currently not playing in this server, play something with \`${config.discord.prefix}play <YouTube Link>\` and try again`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (!msg.guild.me.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `Something went wrong, I cannot detect my current voice channel, try again later`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (!msg.member.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `You must be in a voice channel to use the play command`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (msg.member.voice.channel != msg.guild.me.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `You must be in my current voice channel to use the play command`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (Player.queue.length < 2) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `The queue only has one item in it, add more to shuffle`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });

        msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `Shuffling the current queue, gimme a minute`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } }).then(m => {
            functions.shuffle({ array: Player.queue, times: 5 }).then(queue => {
                Player.queue = queue;
                m.edit({ embed: { title: `Illusion Music`, color: 16711680, description: `Shuffled the queue successfully`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
            });
        });
    }
};

cmds.remove = {
    name: `remove`,
    help: `Remove a song from the queue.`,
    trigger: ({ client, msg, params, raw, clean }) => {
        // Remove Command //
    }
};

cmds.repeat = {
    name: `repeat`,
    help: `Make the bot repeat the current song until you turn it off.`,
    trigger: ({ client, msg, params, raw, clean }) => {
        let Player = Players().get(msg.guild.id);
        if (!Player) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `I'm currently not playing in this server, play something with \`${config.discord.prefix}play <YouTube Link>\` and try again`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (!msg.guild.me.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `Something went wrong, I cannot detect my current voice channel, try again later`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (!msg.member.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `You must be in a voice channel to use the play command`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        if (msg.member.voice.channel != msg.guild.me.voice.channel) return msg.channel.send({ embed: { title: `Illusion Music`, color: 16711680, description: `You must be in my current voice channel to use the play command`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        
        if (!Player.repeat) {
            Player.repeat = true;
            return msg.channel.send({ embed: { title: `Illusion Music`, color: 8388736, description: `Successfully enabled repeat for ${Player.playing.title}\n\nYou can turn this off by running \`${config.discord.prefix}repeat\` again`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() } } });
        } else {
            Player.repeat = false;
            return msg.channel.send({ embed: { title: `Illusion Music`, color: 8388736, description: `Successfully disabled repeat\n\nYou can turn this on by running \`${config.discord.prefix}repeat\` again`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() } } });
        }
    }
};

cmds.help = {
    name: `help`,
    help: `Returns with a list of commands for the bot.`,
    trigger: ({ client, msg, params, raw, clean }) => {
        // Help Command //
    }
};

module.exports = cmds;