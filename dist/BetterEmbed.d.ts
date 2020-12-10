import { MessageEmbed, MessageEmbedOptions } from 'discord.js';
declare type AnyObject = {
    [k: string]: any;
};
declare const templates: {
    basic: {
        footer: {
            text: string;
            iconURL: string;
        };
        timestamp: Date;
    };
    color: {
        color: string;
    };
    readonly complete: {
        title: string;
        description: string;
        color: string;
        footer: {
            text: string;
            iconURL: string;
        };
        timestamp: Date;
    };
    readonly image: {
        image: {
            url: string;
        };
        title: string;
        description: string;
        color: string;
        footer: {
            text: string;
            iconURL: string;
        };
        timestamp: Date;
    };
};
declare class BetterEmbed extends MessageEmbed {
    constructor(data?: MessageEmbed | MessageEmbedOptions);
    static fromTemplate(template: keyof typeof templates | typeof templates | MessageEmbedOptions, values: AnyObject): BetterEmbed;
    checkSize(): void;
    cutIfTooLong(): void;
}
declare const _default: {
    BetterEmbed: typeof BetterEmbed;
    templates: {
        basic: {
            footer: {
                text: string;
                iconURL: string;
            };
            timestamp: Date;
        };
        color: {
            color: string;
        };
        readonly complete: {
            title: string;
            description: string;
            color: string;
            footer: {
                text: string;
                iconURL: string;
            };
            timestamp: Date;
        };
        readonly image: {
            image: {
                url: string;
            };
            title: string;
            description: string;
            color: string;
            footer: {
                text: string;
                iconURL: string;
            };
            timestamp: Date;
        };
    };
    limits: {
        author: {
            name: number;
        };
        title: number;
        description: number;
        footer: {
            text: number;
        };
        fields: {
            size: number;
            name: number;
            value: number;
        };
    };
};
export default _default;
