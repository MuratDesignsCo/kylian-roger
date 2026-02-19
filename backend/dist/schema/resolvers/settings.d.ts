import { type GqlContext } from '../../auth.js';
export declare const settingsResolvers: {
    Query: {
        settings: () => Promise<any>;
    };
    Mutation: {
        updateSettings: (_: unknown, { input }: {
            input: Record<string, unknown>;
        }, context: GqlContext) => Promise<any>;
    };
};
//# sourceMappingURL=settings.d.ts.map