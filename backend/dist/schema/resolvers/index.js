import { GraphQLScalarType, Kind } from 'graphql';
import { settingsResolvers } from './settings.js';
import { seoResolvers } from './seo.js';
import { projectsResolvers } from './projects.js';
import { homepageResolvers } from './homepage.js';
import { contactResolvers } from './contact.js';
import { authResolvers } from './auth.js';
function parseLiteralJSON(ast) {
    if (ast.kind === Kind.STRING)
        return JSON.parse(ast.value);
    if (ast.kind === Kind.INT)
        return parseInt(ast.value, 10);
    if (ast.kind === Kind.FLOAT)
        return parseFloat(ast.value);
    if (ast.kind === Kind.BOOLEAN)
        return ast.value;
    if (ast.kind === Kind.NULL)
        return null;
    if (ast.kind === Kind.LIST)
        return ast.values.map(parseLiteralJSON);
    if (ast.kind === Kind.OBJECT) {
        const obj = {};
        for (const field of ast.fields) {
            obj[field.name.value] = parseLiteralJSON(field.value);
        }
        return obj;
    }
    return null;
}
const JSONScalar = new GraphQLScalarType({
    name: 'JSON',
    description: 'Arbitrary JSON value',
    serialize: (value) => value,
    parseValue: (value) => value,
    parseLiteral: parseLiteralJSON,
});
function mergeResolvers(...resolverSets) {
    const merged = {};
    for (const set of resolverSets) {
        for (const [type, resolvers] of Object.entries(set)) {
            if (!merged[type])
                merged[type] = {};
            Object.assign(merged[type], resolvers);
        }
    }
    return merged;
}
const resolvers = {
    JSON: JSONScalar,
    ...mergeResolvers(settingsResolvers, seoResolvers, projectsResolvers, homepageResolvers, contactResolvers, authResolvers),
};
export default resolvers;
//# sourceMappingURL=index.js.map