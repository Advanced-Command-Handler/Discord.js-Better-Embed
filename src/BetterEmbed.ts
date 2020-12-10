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
		this.checkSize();
	}
	
	checkSize() {
		if (this.title && this.title.length > BetterEmbed.limits.title) throw new RangeError(`embed.title is too long (${BetterEmbed.limits.title}).`);
		if (this.author?.name && this.author.name.length > BetterEmbed.limits.author.name) throw new RangeError(`embed.author.name is too long (${BetterEmbed.limits.author.name}).`);
		if (this.description && this.description.length > BetterEmbed.limits.description) throw new RangeError(`embed.description is too long (${BetterEmbed.limits.description}).`);
		if (this.title && this.title.length > BetterEmbed.limits.title) throw new RangeError(`embed.title is too long (${BetterEmbed.limits.title}).`);
		if (this.fields?.length > BetterEmbed.limits.fields.size) throw new RangeError(`Too much fields is too long (${BetterEmbed.limits.fields.size}).`);
		this.fields.forEach(field => {
			if (field.name?.length > BetterEmbed.limits.fields.name) throw new RangeError(`embed.fields[${this.fields.indexOf(field)}].name is too long (${BetterEmbed.limits.fields.name}).`);
			if (field.value?.length > BetterEmbed.limits.fields.value) throw new RangeError(`embed.fields[${this.fields.indexOf(field)}].value is too long (${BetterEmbed.limits.fields.value}).`);
		});
	}
}
