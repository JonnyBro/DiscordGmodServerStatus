import { Client, GatewayIntentBits, Partials, EmbedBuilder } from "discord.js";
import { GameDig } from "gamedig";
import config from "./config.json" with { type: "json" };

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
	partials: [Partials.Channel],
});

client.on("clientReady", async () => {
	console.log(`Logged in as ${client.user.tag}`);

	for (const channelId of config.channelIds) {
		const channel = await client.channels.fetch(channelId);
		const msg = await channel.send("Fetching server statuses...");

		const updateStatus = async () => {
			const embed = new EmbedBuilder()
				.setTitle("Server Status")
				.setColor("#5ad65c")
				.setTimestamp();

			for (const server of config.servers) {
				const [ip, portStr] = server.split(":");
				const port = Number(portStr);

				try {
					const state = await GameDig.query({
						type: "garrysmod",
						host: ip,
						port: port,
					});

					let playerList = " - There is no one on the server...";
					if (state.players.length > 0) {
						playerList = state.players
							.map(p => p.name || "*Connecting ...*")
							.map(s => ` - ${s}`)
							.join("\n");
					}

					embed.addFields([
						{
							name: `${state.name} (${ip}:${port})`,
							value: `Map: \`${state.map}\`\nPlayers: \`${state.numplayers}/${state.maxplayers}\`\n${playerList}\n\`steam://connect/${ip}:${port}\``,
						},
					]);
				} catch (err) {
					console.log(err);
					embed.addFields([{ name: `Server ${ip}:${port}`, value: "Server offline..." }]);
				}
			}

			embed.addFields({
				name: "Last check",
				value: `<t:${Math.round(Date.now() / 1000)}:R>`,
			});

			await msg.edit({ content: null, embeds: [embed] });
		};

		updateStatus();
		setInterval(updateStatus, 60000);
	}
});

client.login(config.token);
