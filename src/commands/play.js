// The most basic command, play
const Discord = require('discord.js');
const Voice = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const yt_sr = require('youtube-sr').default;

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {String[]} args
 */
module.exports.run = async (client, message, args) => {
	if (!message.member.voice.channel) return message.reply('You need to be in a voice channel.');

	let queue = client.queue.get(message.guild.id);

	if (ytdl.validateURL(args[0])) {
		return message.channel.send('soon:tm:');
	}
	else {
		// Searching
		const searching = await message.channel.send('Searching...');
		const search = args.join(' ');
		if (!search || !search.length) return message.reply('Provide a query');
		const res = await yt_sr.search(search, { 'limit': 4, 'type': 'video' });
		const rawData = res[0];
		rawData.url = `https://youtube.com/watch?v=${rawData.id}`;
		if (!rawData) return message.reply('Unable to find that video.');
		// return console.log(require('util').inspect(rawData, { depth: 0 }));
		const stream = await ytdl(rawData.url, { highWaterMark: 1 << 25, quality: 'highestaudio', type: 'opus', filter: 'audioonly' });

		// Joining
		const channel = message.guild.channels.cache.get(message.member.voice.channel.id);
		let connection = Voice.getVoiceConnection(message.guild.id);
		if (!connection) {
			connection = Voice.joinVoiceChannel({
				'adapterCreator': message.guild.voiceAdapterCreator,
				'channelId': channel.id,
				'guildId': message.guild.id,
				'selfDeaf': true,
			});
		}

		// Playing
		const player = Voice.createAudioPlayer();
		const resource = Voice.createAudioResource(stream);
		player.play(resource);


		// Queue system
		const basequeue = {
			id: message.guild.id,
			startedAt: Date.now(),
			voiceChannel: channel,
			textChannel: message.channel,
			player: player,
			connection: connection,
			songs: [],
			playing: true,
		};
		if (!queue) {
			queue = basequeue;
			client.queue.set(message.guild.id, basequeue);
		}

		if (queue.songs.length === 0) {
			queue.songs.push(rawData);
			connection.subscribe(player);
			player.on(Voice.AudioPlayerStatus.Idle, async () => {
				const newqueue = client.queue.get(message.guild.id);
				const removed = newqueue.songs.shift();

				if (!newqueue.songs.length) {
					newqueue.textChannel.send('The queue has ended!');
					newqueue.connection.destroy();
					player.stop();
					newqueue.playing = false;
				}
				else {
					if (!removed) return;
					newqueue.textChannel.send({ allowedMentions: { roles: [], parse: [], users: [] }, content: `The song \`${removed.title}\` has ended! Next up \`${newqueue.songs[0].title}\`` });
					const newresource = Voice.createAudioResource(await ytdl(newqueue.songs[0].url, { highWaterMark: 1 << 25, quality: 'highestaudio', type: 'opus', filter: 'audioonly' }));
					player.play(newresource);
				}
			});
		}
		else {
			queue.songs.push(rawData);
			player.stop();
		}

		await searching.delete();
	}
};

module.exports.config = {
	name: 'play',
	description: 'Just play songs',
};

/* - ytsr.Video
Video {
  id: 'dQw4w9WgXcQ',
  title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
  description: null,
  durationFormatted: '3:33',
  duration: 213000,
  uploadedAt: '11 years ago',
  views: 1033562194,
  thumbnail: [Thumbnail],
  channel: [Channel],
  likes: 0,
  dislikes: 0,
  live: false,
  private: false,
  tags: []
}
*/