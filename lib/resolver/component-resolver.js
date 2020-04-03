"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const planner_1 = require("../planner");
const errors_1 = require("../errors");
exports.defaultComponentResolvers = {
    const(node, _childResolver) {
        return node.value;
    },
    factory(node, _childResolver) {
        // Stub out Context.
        //  Cannot make a context or resolve plans without
        //  knowing our container or planner.
        // Previously, we treated factory as a function with arbitrary
        //  arguments, but now that FactoryDependencyNode pulls in
        //  FactoryBinding, we are contracted to the Context argument.
        return node.factory({
            get container() {
                throw new Error("Property not implemented.");
            },
            get parameters() {
                return Object.seal({});
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
    ctor(node, childResolver, opts) {
        const args = node.ctorInjectionNodes.map(inj => resolveInjectedArg(childResolver, inj, opts));
        return new node.ctor(...args);
    },
    postInstantiate(creator, resolver, instance, opts) {
        if (creator.type === "constructor") {
            for (let [propName, injection] of creator.propInjectionNodes) {
                const injectedValue = resolveInjectedArg(resolver, injection, opts);
                instance[propName] = injectedValue;
            }
        }
    }
};
function resolveInjectionInstance(resolver, node, opts) {
    if (resolver.isInstantiating(node)) {
        // Only identifier nodes can cause cyclinc dependencies.
        throwCyclicDependency(node.identifier, resolver);
    }
    return resolver.resolveInstance(node, opts);
}
function resolveInjectedArg(resolver, injection, opts) {
    if (injection == null) {
        return null;
    }
    else if (Array.isArray(injection)) {
        return injection.map(inj => resolveInjectionInstance(resolver, inj, opts));
    }
    else {
        return resolveInjectionInstance(resolver, injection, opts);
    }
}
function throwCyclicDependency(cyclicIdentifier, childResolver) {
    const identifierStack = childResolver
        .getResolveStack()
        .map(planner_1.getDependencyNodeIdentifier);
    identifierStack.push(cyclicIdentifier);
    throw new errors_1.DependencyResolutionError(cyclicIdentifier, identifierStack, `Cannot resolve cyclic dependency.`);
}
//# sourceMappingURL=component-resolver.js.map