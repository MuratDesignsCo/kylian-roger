import { type GqlContext } from '../../auth.js';
export declare const seoResolvers: {
    Query: {
        seoPages: () => Promise<any[]>;
        seoPage: (_: unknown, { slug }: {
            slug: string;
        }) => Promise<any>;
    };
    Mutation: {
        upsertSeoPages: (_: unknown, { input }: {
            input: Array<Record<string, unknown>>;
        }, context: GqlContext) => Promise<any[]>;
    };
};
//# sourceMappingURL=seo.d.ts.map