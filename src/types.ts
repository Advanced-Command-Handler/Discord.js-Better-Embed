import type {Client, ColorResolvable, EmbedData} from 'discord.js';

export type AnyObject = Record<string, any>;
// noinspection JSRemoveUnnecessaryParentheses
export type Template<V extends AnyObject | undefined = AnyObject> = Partial<EmbedData> &
	(V extends undefined
		? {}
		: {
				values?: V;
			});
export type CheckSizeKey = keyof Template | string;
export type CheckSizeContent = Template[keyof Template];

export type TemplatesValues = {
	basic: BasicTemplate;
	// @ts-ignore
	color: ColorTemplate;
	complete: CompleteTemplate;
	image: ImageTemplate;
	[k: string]: Template;
};

// @ts-ignore
interface ColorTemplate extends Template<{color?: ColorResolvable}> {
	color: ColorResolvable;
}

interface BasicTemplate extends Template<{client: Client}> {
	footer: {
		text: string;
		iconURL: string;
	};
	timestamp: Date;
}

type CompleteTemplate = BasicTemplate &
	ColorTemplate &
	Template<{description?: string; title?: string}> & {
		description: string;
		title: string;
	};

type ImageTemplate = CompleteTemplate &
	Template<{url?: string}> & {
		image: {
			url: string;
		};
	};
