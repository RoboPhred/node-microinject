"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
exports.defaultComponentResolvers = {
    const(identifier, creator, childResolver) {
        return creator.value;
    },
    factory(identifier, creator, childResolver) {
        // Stub out Context.
        //  Cannot make a context or resolve plans without knowing our container.
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
            // Bit weird to have to de-array the array here,
            //  based on injection config, but it is a result
            //  of the decision to fuze DependencyNode with Binding
            //  and typescript getting angry when trying to widen
            //  DependencyNode.type to include array.
            // Array should probably be re-introduced as a DependencyNode type,
            //  and the typescript typings issue fixed or worked around.
            // Validation, optional, and so on should have been handled by the planner.
            const instances = injection.nodes.map(resolveInjectionInstance);
            if (injection.all) {
                return instances;
            }
            else if (injection.optional && instances.length === 0) {
                return null;
            }
            else {
                return instances[0];
            }
        }
        const args = creator.injectionNodes.map(resolveInjectedArg);
        return new creator.ctor(...args);
    }
};
//# sourceMappingURL=component-resolver.js.map