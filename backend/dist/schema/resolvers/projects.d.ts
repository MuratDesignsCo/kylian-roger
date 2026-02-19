import { type GqlContext } from '../../auth.js';
export declare const projectsResolvers: {
    Query: {
        projects: (_: unknown, { category, published }: {
            category?: string;
            published?: boolean;
        }) => Promise<any[]>;
        project: (_: unknown, { slug }: {
            slug: string;
        }) => Promise<any>;
        projectById: (_: unknown, { id }: {
            id: string;
        }) => Promise<any>;
    };
    Project: {
        gallery_rows: (parent: {
            id: string;
        }) => Promise<any[]>;
        hero_slides: (parent: {
            id: string;
        }) => Promise<any[]>;
        blocks: (parent: {
            id: string;
        }) => Promise<any[]>;
    };
    ProjectGalleryRow: {
        images: (parent: {
            id: string;
        }) => Promise<any[]>;
    };
    ProjectBlock: {
        images: (parent: {
            id: string;
        }) => Promise<any[]>;
    };
    Mutation: {
        createProject: (_: unknown, { input }: {
            input: Record<string, unknown>;
        }, context: GqlContext) => Promise<any>;
        updateProject: (_: unknown, { id, input }: {
            id: string;
            input: Record<string, unknown>;
        }, context: GqlContext) => Promise<any>;
        deleteProject: (_: unknown, { id }: {
            id: string;
        }, context: GqlContext) => Promise<boolean>;
        saveGalleryRows: (_: unknown, { projectId, rows: rowInputs }: {
            projectId: string;
            rows: Array<Record<string, unknown>>;
        }, context: GqlContext) => Promise<any[]>;
        saveHeroSlides: (_: unknown, { projectId, slides }: {
            projectId: string;
            slides: Array<Record<string, unknown>>;
        }, context: GqlContext) => Promise<any[]>;
        saveProjectBlocks: (_: unknown, { projectId, blocks }: {
            projectId: string;
            blocks: Array<Record<string, unknown>>;
        }, context: GqlContext) => Promise<any[]>;
    };
};
//# sourceMappingURL=projects.d.ts.map