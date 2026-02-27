import { Client, Embed, EmbedBuilder, GatewayIntentBits, Partials } from "discord.js";
import { GameDig } from "gamedig";
import config from "./config.json" with { type: "json" };

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
	partials: [Partials.Channel],
});

client.on("clientReady", async () => {
	const channel = await client.channels.fetch(config.channelId);

	const status = await channel.send(":thinking:");

	const task = () => {
		GameDig.query({
			type: "garrysmod",
			host: config.ip,
			port: config.port,
		})
			.then(state => {
				let playerList = "";

				if (state.raw.numplayers == 0) {
					playerList = " * There is no one on the server...";
				}

				for (var i = 0; i < state.players.length; i++) {
					if (!state.players[i].name) {
						state.players[i].name = "*Connecting ...*";
					}

					playerList = playerList + "\n 🔹 " + state.players[i].name;
				}

				const embedSatus = new EmbedBuilder()
					.setTitle(state.name)
					.setColor("#5ad65c")
					.setDescription("------------------------\n\u200B")
					.setThumbnail(
						"https://image.gametracker.com/images/maps/160x120/garrysmod/" +
							state.map +
							".jpg",
					)
					.addFields(
						{
							name: "Map ",
							value: " 🔹 `" + state.map + "` \n\u200B",
						},
						{
							name:
								"Players connected `" +
								state.raw.numplayers +
								"/" +
								state.maxplayers +
								"`",
							value: playerList,
						},
						{
							name: "\u200B",
							value: "------------------------",
						},
						{
							name: "Join server",
							value: "**steam://connect/" + ip + ":" + port + "**",
						},
					)
					.setFooter({ text: "Updated at" })
					.setTimestamp();

				status.edit({ content: null, embeds: [embedSatus] });
			})
			.catch(e => {
				console.log(e)

				const embedSatusOff = new EmbedBuilder()
					.setTitle("Server offline...")
					.setColor("#d65a5a")
					.setFooter({ text: "Updated at" })
					.setTimestamp();

				status.edit({ content: null, embeds: [embedSatusOff] });
			});
	};

	task();
	setInterval(task, 60000);
});

client.login(config.token);
