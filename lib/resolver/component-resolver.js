"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultComponentResolvers = void 0;
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
            },
        });
    },
    ctor(node, childResolver, opts) {
        const args = node.ctorInjectionNodes.map((inj) => resolveInjectedArg(childResolver, inj, opts));
        return new node.ctor(...args);
    },
    parentIdentifier(node, opts) {
        throw new Error("Method not implemented.");
    },
    postInstantiate(creator, resolver, instance, opts) {
        if (creator.type === "constructor") {
            for (let [propName, injection] of creator.propInjectionNodes) {
                const injectedValue = resolveInjectedArg(resolver, injection, opts);
                instance[propName] = injectedValue;
            }
        }
    },
};
function resolveInjectedArg(resolver, injection, opts) {
    if (injection == null) {
        return null;
    }
    else if (Array.isArray(injection)) {
        return injection.map((inj) => resolver.resolveInstance(inj, opts));
    }
    else {
        return resolver.resolveInstance(injection, opts);
    }
}
//# sourceMappingURL=component-resolver.js.map