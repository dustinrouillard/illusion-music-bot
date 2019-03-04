// Various NPM modules required for the functions to work //
const lavaLink = require('discord.js-lavalink');
const snek     = require('snekfetch');
const chalk    = require('chalk');

// YouTube Modules for searching //
const ytSearch = require('youtube-node');
const YouTube  = new ytSearch();

const config = require('./config.js');

// Players map to keep track of where the bot is playing //
const Players = new Map();

const funcs = [];

var Manager = null;

funcs.getPlayers = () => {
    return Players;
};

funcs.getManager = () => {
    return Manager;
};

funcs.run = (client) => {
    return new Promise((resolve, reject) => {
        Manager = new lavaLink.PlayerManager(client, [ config.lavalink.node ], { user: client.user.id, shards: 1 });
    });
};

funcs.summon = (msg) => {
    return new Promise((resolve, reject) => {
        let Player = Players.get(msg.guild.id);
        if (Player) {
            return resolve(Player);
        } else {
            let player = Manager.join({ guild: msg.guild.id, channel: msg.member.voice.channel.id, host: config.lavalink.node.host }, { selfdeaf: true });
            player.volume(config.options.defaultVolume);

            let obj = { volume: { int: 0.5, percent: config.options.defaultVolume }, repeat: false, playing: null, voice: msg.member.voice.channel, channel: msg.channel, guild: msg.guild, queue: [], player };
            Players.set(msg.guild.id, obj);

            resolve(Players.get(msg.guild.id));
        }
    });
};

funcs.fetchLink = (search) => {
    return new Promise((resolve, reject) => {
        let ytMatch = search.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/);

        if (ytMatch && ytMatch[2]) {
            YouTube.getById(ytMatch[2], (err, result) => {
                if (err) { return console.error(err); }

                if (!result) return reject({ error: true, message: `no_tracks` });
                resolve({ result: result.items[0], service: 'youtube' });
            });
        } else {
            reject({ error: true, message: `not_supported` });
        }
    });
};

funcs.queueAdd = ({ Player, link, msg }) => {
    return new Promise((resolve, reject) => {
        if (!link) return reject({ error: true, message: `no_link` });
        if (!Player) return reject({ error: true, message: `no_player` });

        if (Player.queue) {
            if (link.service == 'youtube') {
                let track = link.result;
                let song = { id: track.id, url: `https://youtu.be/${track.id}`, title: track.snippet.title, author: { name: track.snippet.channelTitle, id: track.snippet.channelId, url: `https://youtube.com/channel/${track.snippet.channelId}` }, date: new Date().getTime(), user: { id: msg.author.id, tag: msg.author.tag }, service: `youtube` };
                Player.queue.push(song);
                return resolve({ type: `song`, info: song, user: { id: msg.author.id, tag: msg.author.tag }, service: `youtube` });
            }
            return resolve(true);
        }
    });
};

funcs.playNext = ({ Player, client }) => {
    return new Promise((resolve, reject) => {
        if (!Player) return reject({ error: true, message: `no_player` });

        if (Player.queue.length >= 1) {
            // queue has atleast one
            let song = Player.queue[0];

            funcs.resolve(song.url).then(track => {
                if (track) {
                    song.lava = track.tracks[0].track;
                    Player.player.play(track.tracks[0].track);
                    Player.playing = song;

                    resolve(true);

                    console.log(`${chalk.green('[P]')} | ${chalk.cyan(`Playing ${song.title} from ${song.service} in ${Player.guild.name} requested by: ${song.user.tag}`)}`);
                    Player.channel.send({ embed: { title: `Illusion Music`, color: 255, fields: [ { name: `Title`, value: `[${song.title}](${song.url})` }, { name: `Author`, value: `[${song.author.name}](${song.author.url})` }, { name: `Service`, value: `[YouTube](https://YouTube.com)` }, { name: `Requested By`, value: `${song.user.tag}` } ], footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });

                    Player.player.once('end', data => {
                        if (data.reason && data.reason == "REPLACED") {
                            return;
                        }

                        Player.playing = null;

                        setTimeout(() =>{
                            if (!Player.repeat) {
                                Player.queue.shift();
                            }
                            setTimeout(() => {
                                funcs.playNext({ Player, client }).catch(reject);
                            }, 250);
                        }, 250);
                    });

                    Player.player.once('error', err => {
                        Player.player.stop();
                        funcs.getManager().leave(Player.guild.id);
                        funcs.getPlayers().delete(Player.guild.id);
                        Player.player.disconnect(`error`);
                        reject(err);
                    });
                } else {
                    funcs.getManager().leave(Player.guild.id);
                    Player.player.disconnect(`error`);
                    funcs.getPlayers().delete(Player.guild.id);
                    return reject({ error: true, message: `no_track` });
                }
            }).catch(reject);
        } else {            
            Player.player.stop();
            funcs.getManager().leave(Player.guild.id);
            funcs.getPlayers().delete(Player.guild.id);
            Player.player.disconnect(`queue_empty`);
            return Player.channel.send({ embed: { title: `Illusion Music`, color: 12394, description: `The queue is empty, disconnecting from the voice channel`, footer: { text: `Illusion Music`, icon_url: client.user.avatarURL() }, timestamp: new Date() } });
        }
    });
};

funcs.resolve = (link) => {
    return new Promise((resolve, reject) => {
        if (link) {
            snek.get(`http://${config.lavalink.rest.host}:${config.lavalink.rest.port}/loadtracks?identifier=${link}`).set('Authorization', config.lavalink.rest.password).then((track) => {
                if (track.body) {
                    return resolve(track.body);
                } else {
                    return reject({ error: true, message: `not_found` });
                }
            }).catch(reject);
        }
    });
};

funcs.mixArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
};

funcs.shuffle = ({ array, times }) => {
    return new Promise((resolve, reject) => {
        if (array) {
            for (let t = 0; t < times; t++) {
                let arr = funcs.mixArray(array);

                if (t >= times-1) {
                    return resolve(arr);
                }
            }
        }
    });
};

YouTube.setKey(config.api.youtube);

module.exports = funcs;