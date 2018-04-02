"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
exports.defaultComponentResolvers = {
    const(identifier, creator, childResolver) {
        return creator.value;
    },
    factory(identifier, creator, childResolver) {
        // Stub out Context.
        //  Cannot make a context or resolve plans without
        //  knowing our container or planner.
        // Previously, we treated factory as a function with arbitrary
        //  arguments, but now that FactoryDependencyNode pulls in
        //  FactoryBinding, we are contracted to the Context argument.
        return creator.factory({
            get container() {
                throw new Error("Property not implemented.");
            },
            has() {
                throw new Error("Method not implemented.");
            },
            get() {
                throw new Error("Method not implemented.");
            },
            getAll() {
                throw new Error("Method not implemented.");
            }
        });
    },
    ctor(identifier, creator, childResolver) {
        function resolveInjectionInstance(node) {
            if (childResolver.isResolving(node)) {
                const identifierStack = childResolver.getResolveStack().map(x => x.identifier);
                identifierStack.push(node.identifier);
                throw new errors_1.DependencyResolutionError(identifier, identifierStack, `Cannot resolve cyclic dependency.`);
            }
            return childResolver.resolveInstance(node);
        }
        function resolveInjectedArg(injection) {
            if (injection == null) {
                return null;
            }
            else if (Array.isArray(injection)) {
                return injection.map(resolveInjectionInstance);
            }
            else {
                return resolveInjectionInstance(injection);
            }
        }
        const args = creator.injectionNodes.map(resolveInjectedArg);
        return new creator.ctor(...args);
    }
};
//# sourceMappingURL=component-resolver.js.map