import { type GqlContext } from '../../auth.js';
declare function fetchHomepageData(): Promise<{
    heroImages: any[];
    featuredWorks: any[];
    hoverImages: any[];
    projects: any[];
}>;
export declare const homepageResolvers: {
    Query: {
        homepage: typeof fetchHomepageData;
    };
    HomepageFeaturedWork: {
        project: (parent: {
            project: unknown;
            project_id: string;
        }) => {} | null;
    };
    Mutation: {
        updateHomepage: (_: unknown, { input }: {
            input: Record<string, unknown>;
        }, context: GqlContext) => Promise<{
            heroImages: any[];
            featuredWorks: any[];
            hoverImages: any[];
            projects: any[];
        }>;
    };
};
export {};
//# sourceMappingURL=homepage.d.ts.map