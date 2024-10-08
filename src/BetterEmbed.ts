import type {APIEmbed} from 'discord-api-types/v10';
import {AttachmentBuilder, Embed, EmbedBuilder} from 'discord.js';
import {AnyObject, CheckSizeContent, CheckSizeKey, Template, TemplatesValues} from './types';

export const templates: TemplatesValues = {
	basic: {
		footer: {
			text: '${client.user.username}',
			iconURL: '${client.user.displayAvatarURL()}',
		},
		timestamp: new Date(),
	},
	color: {
		color: '#4b5afd',
	},
	// @ts-ignore
	get complete() {
		return {
			...this.basic,
			...this.color,
			description: '${description}',
			title: '${title}',
		};
	},
	get image() {
		return {
			...this.complete,
			image: {
				url: '${url}',
			},
		};
	},
};

export const limits = {
	author: {
		name: 256,
	},
	title: 256,
	description: 4096,
	footer: {
		text: 2048,
	},
	fields: {
		size: 25,
		name: 256,
		value: 1024,
	},
};

export type Templates = typeof templates;
type ValuesFromTemplateKey<T extends string, P = Templates[T]> = P extends Template<infer V> ? V : {};
type Values<T extends string | Template> = T extends Template<infer V> ? V : T extends string ? ValuesFromTemplateKey<T> : AnyObject | undefined;

// @ts-ignore
export class BetterEmbed extends EmbedBuilder {
	public static LENGTH_LIMITS = limits;
	public static TEMPLATES = templates;

	public constructor(data?: APIEmbed | Template) {
		super(data);
		this.checkSize();
	}

	get author() {
		return this.data.author as Embed['author'];
	}

	get color() {
		return this.data.color;
	}

	get description() {
		return this.data.description;
	}

	get fields() {
		return this.data.fields as Embed['fields'];
	}

	get footer() {
		return this.data.footer as Embed['footer'];
	}

	get image() {
		return this.data.image as Embed['image'];
	}

	get thumbnail() {
		return this.data.thumbnail as Embed['thumbnail'];
	}

	get title() {
		return this.data.title;
	}

	get timestamp() {
		return this.data.timestamp;
	}

	get url() {
		return this.data.url;
	}

	public static isTemplate(key: string): key is keyof Templates & string {
		return templates[key] !== undefined;
	}

	public static fromTemplate<T extends (keyof Templates & string) | Template, V extends AnyObject | undefined = Values<T>>(template: T, values?: V): BetterEmbed {
		if (typeof template === 'string') {
			if (templates[template]) {
				template = templates[template] as T;
			} else {
				throw new Error(`Template '${template}' not found.`);
			}
		}

		template = JSON.parse(JSON.stringify(template));

		function setValues(object: AnyObject, values: AnyObject = {}): Template {
			for (const [name, value] of Object.entries(object)) {
				if (!object.hasOwnProperty(name)) continue;

				if (Array.isArray(value)) object[name] = value.map(v => setValues(v, values));
				if (typeof value === 'number') {
					object[name] = value;
					continue;
				}
				if (typeof value === 'object') {
					object[name] = setValues(value, values);
					continue;
				}

				const code = value.replace(/\$\{([^}]+)\}/gu, (_: any, value: string) => (values.hasOwnProperty(value.split('.')[0]) ? `\${values.${value}}` : value));
				object[name] = eval(`\`${code}\``);
			}

			return object;
		}

		return new BetterEmbed(setValues(template as AnyObject, values));
	}

	public checkSize(field: 'fields'):
		| ({
				index: number;
				limit: number;
		  } & (
				| {
						name: boolean;
				  }
				| {
						value: boolean;
				  }
		  ))
		| boolean;
	public checkSize(field: keyof Template): boolean;
	public checkSize(): {
		[k in CheckSizeKey]: {
			content: CheckSizeContent;
			limit: number;
		};
	};
	public checkSize(field?: keyof Template) {
		if (!field) {
			const fields: {
				[k in CheckSizeKey]: {
					content: CheckSizeContent;
					limit: number;
				};
			} = {};

			function addField(name: CheckSizeKey, content: CheckSizeContent, limit: number) {
				fields[name] = {
					content,
					limit,
				};
			}

			if (this.title && this.title.length > limits.title) addField('title', this.title, limits.title);
			if (this.author?.name && this.author.name.length > limits.author.name) addField('author', this.author.name, limits.author.name);
			if (this.description && this.description.length > limits.description) addField('description', this.description, limits.description);
			if (this.fields?.length > limits.fields.size) addField('fields', this.fields, limits.fields.size);
			this.fields.forEach((field, index) => {
				if (field.name?.length > limits.fields.name) addField(`field[${index}]`, field.name, limits.fields.name);
				if (field.value?.length > limits.fields.value) addField(`field[${index}]`, field.value, limits.fields.value);
			});

			return fields;
		}

		switch (field) {
			case 'fields':
				if (this.fields?.length) {
					return this.fields.length > limits.fields.size;
				} else {
					for (const field of this.fields) {
						const index = this.fields.indexOf(field);
						if (field.name.length > limits.fields.name) {
							return {
								index,
								name: true,
								limit: limits.fields.name,
							};
						} else if (field.value.length > limits.fields.value) {
							return {
								index,
								value: true,
								limit: limits.fields.value,
							};
						}
					}
					return false;
				}
			case 'footer':
				return this.footer?.text ? this.footer.text.length > limits.footer.text : true;
			case 'title':
				return this.title ? this.title?.length > limits.title : true;
			case 'author':
				return this.author?.name ? this.author.name.length > limits.author.name : true;
			case 'description':
				return this.description ? this.description.length > limits.description : true;
			default:
				return true;
		}
	}

	public setImageFromFile(attachment: AttachmentBuilder) {
		this.setImage(`attachment://${attachment.name}`);
	}

	public setThumbnailFromFile(attachment: AttachmentBuilder) {
		this.setThumbnail(`attachment://${attachment.name}`);
	}

	public throwIfTooLong(field: keyof Template): void;
	public throwIfTooLong(field?: keyof Template) {
		if (field) {
			const tooLong = this.checkSize(field);
			if (!tooLong) return;
			switch (field) {
				case 'title':
				case 'author':
				case 'description':
					if (field === 'author' ? !this.author?.name?.length : !this[field]?.length) return;
					const name = field === 'author' ? 'author.name' : field;

					const limit = field === 'author' ? limits.author.name : limits[field];
					const length = field === 'author' ? this.author!.name!.length : this[field]!.length;
					throw new RangeError(`'embed.${name}' is too long: ${length} (max: ${limit}).`);
				case 'fields':
					const tooLongFields = this.checkSize(field);
					if (typeof tooLongFields === 'boolean') {
						throw new RangeError(`Too much fields (${limits.fields.size}).`);
					} else {
						const name = 'name' in tooLongFields ? 'value' : 'name';
						throw new RangeError(
							`'embed.fields[${tooLongFields.index}].${name}' is too long: ${this.fields[tooLongFields.index][name].length} (max: ${tooLongFields.limit})`,
						);
					}
			}
		}

		if (this.title && this.title.length > limits.title) throw new RangeError(`'embed.title' is too long: ${this.title.length} (max: ${limits.title}).`);
		if (this.author?.name && this.author.name.length > limits.author.name) {
			throw new RangeError(`'embed.author.name' is too long: ${this.author.name.length} (max: ${limits.author.name}).`);
		}
		if (this.description && this.description.length > limits.description) {
			throw new RangeError(`'embed.description' is too long: ${this.description.length} (max: ${limits.description}).`);
		}
		if (this.fields?.length > limits.fields.size) throw new RangeError(`Too much fields (${limits.fields.size}).`);
		this.fields.forEach(field => {
			if (field.name?.length > limits.fields.name) {
				throw new RangeError(`'embed.fields[${this.fields.indexOf(field)}].name' is too long: ${field.name.length} (max: ${limits.fields.name}).`);
			}
			if (field.value?.length > limits.fields.value) {
				throw new RangeError(`'embed.fields[${this.fields.indexOf(field)}].value' is too long: ${field.value.length} (max: ${limits.fields.value}).`);
			}
		});
	}

	public cutIfTooLong() {
		function cutWithLength(text: string, maxLength: number) {
			return text.length > maxLength ? `${text.substring(0, maxLength - 3)}...` : text;
		}

		if (this.author?.name) this.author.name = cutWithLength(this.author.name, limits.author.name);
		if (this.description) this.setDescription(cutWithLength(this.description, limits.description));
		if (this.title) this.setTitle(cutWithLength(this.title, limits.title));
		if (this.fields) {
			if (this.fields.length > limits.fields.size) this.setFields(this.fields.slice(0, limits.fields.size) ?? []);
			this.fields.forEach(field => {
				field.name = cutWithLength(field.name ?? '', limits.fields.name);
				field.value = cutWithLength(field.value ?? '', limits.fields.value);
			});
		}
	}
}
