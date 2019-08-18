"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
exports.defaultComponentResolvers = {
    const(_identifier, creator, _childResolver) {
        return creator.value;
    },
    factory(_identifier, creator, _childResolver) {
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
            create() {
                throw new Error("Method not implemented.");
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
        const args = creator.ctorInjectionNodes.map(inj => resolveInjectedArg(childResolver, inj));
        return new creator.ctor(...args);
    },
    postInstantiate(identifier, creator, resolver, instance) {
        if (creator.type === "constructor") {
            for (let [propName, injection] of creator.propInjectionNodes) {
                const injectedValue = resolveInjectedArg(resolver, injection);
                instance[propName] = injectedValue;
            }
        }
    }
};
function resolveInjectionInstance(resolver, node) {
    if (resolver.isInstantiating(node)) {
        throwCyclicDependency(node.identifier, resolver);
    }
    return resolver.resolveInstance(node);
}
function resolveInjectedArg(resolver, injection) {
    if (injection == null) {
        return null;
    }
    else if (Array.isArray(injection)) {
        return injection.map(inj => resolveInjectionInstance(resolver, inj));
    }
    else {
        return resolveInjectionInstance(resolver, injection);
    }
}
function throwCyclicDependency(cyclicIdentifier, childResolver) {
    const identifierStack = childResolver
        .getResolveStack()
        .map(x => x.identifier);
    identifierStack.push(cyclicIdentifier);
    throw new errors_1.DependencyResolutionError(cyclicIdentifier, identifierStack, `Cannot resolve cyclic dependency.`);
}
//# sourceMappingURL=component-resolver.js.map