import {MessageEmbed, MessageEmbedOptions} from 'discord.js';

export default class BetterEmbed extends MessageEmbed {
	public static limits = {
		author:      {
			name: 256,
		},
		title:       256,
		description: 2048,
		footer:      {
			text: 2048,
		},
		fields:      {
			size:  25,
			name:  256,
			value: 1024,
		},
	};
	
	public static templates = {
		basic: {
			footer:    {
				text:    '${client.user.username}',
				iconURL: '${client.user.displayAvatarURL()}',
			},
			timestamp: new Date(),
		},
		color: {
			color: '#4b5afd',
		},
		get complete() {
			return {
				...this.basic,
				...this.color,
				title:       '${title}',
				description: '${description}',
			};
		},
		get image() {
			return {
				...this.complete,
				image: {
					url: '${image}',
				},
			};
		},
	};
	
	public constructor(data?: MessageEmbed | MessageEmbedOptions) {
		super(data);
	}
}
