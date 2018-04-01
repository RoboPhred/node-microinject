
import {
    Identifier
} from "../interfaces";

import {
    DependencyNode,
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
}