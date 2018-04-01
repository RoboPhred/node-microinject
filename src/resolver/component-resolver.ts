
import {
    Identifier
} from "../interfaces";

import {
    ConstDependencyNode,
    FactoryDependencyNode,
    ConstructorDependencyNode,
    DependencyInjection
} from "../planner";

import {
    DependencyResolutionError
} from "../errors";

import {
    DependencyGraphResolver
} from "./interfaces";


export interface ComponentResolvers {
    const: (identifier: Identifier, creator: ConstDependencyNode, childResolver: DependencyGraphResolver) => any;
    factory: (identifier: Identifier, creator: FactoryDependencyNode, childResolver: DependencyGraphResolver) => any;
    ctor: (identifier: Identifier, creator: ConstructorDependencyNode, childResolver: DependencyGraphResolver) => any;
}

export const defaultComponentResolvers: ComponentResolvers = {
    const(identifier, creator, childResolver) {
        return creator.value;
    },
    factory(identifier, creator, childResolver) {
        // Stub out Context.
        //  Cannot make a context or resolve plans without knowing our container.
        return creator.factory({
            get container(): any {
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
        function resolveInjectionInstance(node: DependencyNode): any {
            if (childResolver.isResolving(node)) {
                const identifierStack = childResolver.getResolveStack().map(x => x.identifier);
                identifierStack.push(node.identifier);
                throw new DependencyResolutionError(identifier, identifierStack, `Cannot resolve cyclic dependency.`);
            }
            return childResolver.resolveInstance(node);
        }

        function resolveInjectedArg(injection: DependencyInjection): any {
            // TODO: resolve single vs all, handle optional.
        }
        
        const args = creator.injectionNodes.map(resolveInjectedArg);
        return new creator.ctor(...args);
    }
}