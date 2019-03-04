# Illusion Music Bot

## Created by Tetrabyte#4866

---

### If you need help you can DM Tetrabyte#4866 on Discord or submit an issue with what you're having trouble with

---

## Setup Instructions

### Config setup

To setup the config just copy `config.js.example` to `config.js`

Open the config.js file up and add your Discord ID into the array where it says `'YOUR ID HERE'` making sure to leave the quotes around the ID.

Once you done that it should look like this

```js
admins: [
    '9568954894986444' // Your ID Here
]
```

You can also add multple admins that are allowed to run eval commands and certain admin commands by adding more id's to the admins array in the config which would look like this, just remember to add a comma after every ID except the last one.

```js
admins: [
    '9568954894986444',
    '21938912830912038',
    '23910239011231232'
]
```

You can change the prefix the bot uses right above that by changing the `!` to anything making sure to leave the quotes around it.

Wanna change the default volume the bot connects with? Well you can do that in the config as well just by changing the `defaultVolume` option to any percent you'd like

---

### Creating discord bot

To create your discord bot application go to https://discordapp.com/developers/applications and make sure you're signed in

Click the "Create an application" button and then fill out a name and and optionally upload an avatar on the first page, don't forget to click save.

Go to the bot tab on the left side of the page and click "Add Bot" on the right side

Then you can set the same name here or a different name (This will be the name of the bot that is in your server)

You can upload that same avatar here again that you set before if you did set one before.

Click the copy button under token and next to regenerate and paste that into your config where it says `"BotTokenHere"`

---

### Inviting the bot to your server

On the application page where you made the discord bot on the right you can click the OAuth2 page

Under the OAuth2 URL generator section you can select bot then press copy on the URL

Open that URL in your browser and you'll be able to select your server then click authorize.

If you'd like to invite the bot with permissions like administrator you can select bot then scroll down to the permissions section and select what you'd like then copy the link and visit it again.

---

### Lavalink configuration

You'll see in the config file that there is a section for lavalink, this is the system this bot uses for it's music processing, you run a lavalink server which you can find [here](https://github.com/Frederikam/Lavalink)

If you go to that github page for Lavalink and go near the bottom you'll see a link that says "CI Server"

Go to that link and once it loads you'll see some files on the left side click on the `Lavalink.jar` and it should start to download

If you don't have Java 10 installed on your system please refer to the next section about installing Java 10 on windows

Next you'll wanna download [this file](https://raw.githubusercontent.com/Frederikam/Lavalink/master/LavalinkServer/application.yml.example), this is an example application.yml configuration for the Lavalink.jar

Just download this and put it in a seperate folder along with Lavalink.jar rename it to `application.yml` and open it up then you can change the password to anything you'd like, you should keep this secure though.

Once you change the password in the application file you can now go and put that same password in the config.js for the bot under nodes and rest so the bot can connect to the lavalink instance.

Then you can open a terminal in the Lavalink folder and type `java -jar Lavalink.jar` and it will start launching the lavalink instance, you'll need this running when you wanna use the bot.

---

### Installing Java 10 on Windows

Installing Java 10 on windows is easier then installing it on debian or ubuntu.

To Install it on Windows just go [here](https://www.oracle.com/technetwork/java/javase/downloads/jdk10-downloads-4416644.html) accept the license agreement and download the Windows JDK near the bottom

Once that is downloaded just run it and it will start installing, once that is installed you're ready to start lavalink

---

### Todo List before public

- [x] Setup base bot project
- [x] Setup command handler
- [x] Add ping command
- [x] Add play command
- [x] Add stop command
- [x] Add volume command
- [x] Add pause/resume command
- [x] Add queue command
- [ ] Add help command
- [x] Add shuffle command
- [ ] Add remove command
- [x] Add repeat command
