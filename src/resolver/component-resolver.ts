
import {
    Identifier
} from "../interfaces";

import {
    ConstDependencyNode,
    ConstructorDependencyNode,
    DependencyNode,
    FactoryDependencyNode,
    InjectedArgumentValue
} from "../planner";

import {
    DependencyResolutionError
} from "../errors";

import {
    DependencyGraphResolver
} from "./interfaces";


export interface ComponentResolvers {
    const(identifier: Identifier, creator: ConstDependencyNode, childResolver: DependencyGraphResolver): any;
    factory(identifier: Identifier, creator: FactoryDependencyNode, childResolver: DependencyGraphResolver): any;
    ctor(identifier: Identifier, creator: ConstructorDependencyNode, childResolver: DependencyGraphResolver): any;
}

export const defaultComponentResolvers: ComponentResolvers = {
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
                throwCyclicDependency(node.identifier, childResolver);
            }
            return childResolver.resolveInstance(node);
        }

        function resolveInjectedArg(injection: InjectedArgumentValue): any {
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

function throwCyclicDependency(cyclicIdentifier: Identifier, childResolver: DependencyGraphResolver): never {
    const identifierStack = childResolver.getResolveStack().map(x => x.identifier);
    identifierStack.push(cyclicIdentifier);
    throw new DependencyResolutionError(cyclicIdentifier, identifierStack, `Cannot resolve cyclic dependency.`);
}