"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
exports.defaultComponentResolvers = {
    factory(identifier, creator, childResolver) {
        return creator.factory();
    },
    ctor(identifier, creator, childResolver) {
        const args = creator.args.map(x => {
            if (childResolver.isResolving(x)) {
                const identifierStack = childResolver.getResolveStack().map(x => x.identifier);
                identifierStack.push(x.identifier);
                throw new errors_1.DependencyResolutionError(identifier, identifierStack, `Cannot resolve cyclic dependency.`);
            }
            return childResolver.resolveInstance(x);
        });
        return new creator.ctor(...args);
    },
    value(identifier, creator, childResolver) {
        return creator.value;
    }
};
//# sourceMappingURL=component-resolver.js.map