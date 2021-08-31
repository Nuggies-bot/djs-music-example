const prefix = '&';

module.exports = async (client, message) => {
	if (message.author.bot || !message.channel.type.toLowerCase().startsWith('guild')) return;

	if (!message.content.startsWith(prefix)) return;
	const [commandName, ...args] = message.content.slice(prefix.length).split(' ');

	const command = client.commands.get(commandName);
	if (!command) return;

	command.run(client, message, args);
};