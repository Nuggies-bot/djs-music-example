const { Client } = require('discord.js');
const fs = require('fs');

class ExtendedClient extends Client {
	constructor(...options) {
		super(...options);

		this.commands = new Map();
		this.events = new Map();

		this.queue = new Map();

		this.utils = {};
	}

	setup(token = process.env.TOKEN) {
		if (!token) throw Error('No token');
		this.login(token)
			.then(() => console.log(`Logged in as ${this.user.tag}`))
			.catch((r) => console.log(r));

		this.loadHandlers();

		return this;
	}

	loadHandlers() {
		const handlers = fs.readdirSync('./src/handlers');

		handlers.forEach((handler) => {
			const files = fs.readdirSync(`./src/${handler.split('.')[0]}`);

			files.forEach((file) => {
				const data = require(`../${handler.split('.')[0]}/${file}`);

				this[handler.split('.')[0]].set(data.config?.name || file.split('.')[0], data);

			});
		});

		this.events.forEach((event, eventName) => {
			this.on(eventName, event.bind(null, this));
		});

		return this;
	}
}

module.exports = ExtendedClient;