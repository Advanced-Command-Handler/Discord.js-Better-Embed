import type {Client, ColorResolvable, MessageEmbedOptions} from 'discord.js';

export type AnyObject = Record<string, any>;
export type Template<V extends AnyObject | undefined = AnyObject> = Partial<MessageEmbedOptions> & (V extends undefined ? {} : {values?: V});
export type CheckSizeKey = keyof Template | string;
export type CheckSizeContent = Template[keyof Template];

export type TemplatesValues = {
    basic: BasicTemplate;
    color: ColorTemplate;
    complete: CompleteTemplate;
    image: ImageTemplate;
    [k: string]: Template;
};

interface ColorTemplate extends Template<{color?: ColorResolvable}> {
    color: ColorResolvable;
}

interface BasicTemplate extends Template<{client: Client}> {
    footer: {
        text: string;
        iconURL: string;
    }
    timestamp: Date;
}

type CompleteTemplate = BasicTemplate & ColorTemplate & Template<{description?: string, title?: string}> & {
    description: string;
    title: string;
}

type ImageTemplate = CompleteTemplate & Template<{url?: string}> & {
    image: {
        url: string;
    }
}
