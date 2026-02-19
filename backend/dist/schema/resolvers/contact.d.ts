import { type GqlContext } from '../../auth.js';
declare function fetchContactData(): Promise<{
    page: any;
    infoBlocks: any[];
    awards: any[];
    btsImages: any[];
    mediaKitButtons: any[];
}>;
export declare const contactResolvers: {
    Query: {
        contact: typeof fetchContactData;
    };
    Mutation: {
        updateContact: (_: unknown, { input }: {
            input: Record<string, unknown>;
        }, context: GqlContext) => Promise<{
            page: any;
            infoBlocks: any[];
            awards: any[];
            btsImages: any[];
            mediaKitButtons: any[];
        }>;
    };
};
export {};
//# sourceMappingURL=contact.d.ts.map