export declare const authResolvers: {
    Mutation: {
        login: (_: unknown, { email, password }: {
            email: string;
            password: string;
        }) => Promise<{
            token: string;
            user: {
                id: any;
                email: any;
            };
        }>;
    };
};
//# sourceMappingURL=auth.d.ts.map