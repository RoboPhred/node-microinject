
import {
    Identifier
} from "../interfaces";

import {
    FactoryComponentCreator,
    ConstructorComponentCreator,
    ValueComponentCreator
} from "../planner";

import {
    DependencyResolutionError
} from "../errors";

import {
    DependencyGraphResolver
} from "./interfaces";


export interface ComponentResolvers {
    factory: (identifier: Identifier, creator: FactoryComponentCreator, childResolver: DependencyGraphResolver) => any;
    ctor: (identifier: Identifier, creator: ConstructorComponentCreator, childResolver: DependencyGraphResolver) => any;
    value: (identifier: Identifier, creator: ValueComponentCreator, childResolver: DependencyGraphResolver) => any;
}

export const defaultComponentResolvers: ComponentResolvers = {
    factory(identifier, creator, childResolver) {
        // TODO: Make a create-only container api for factory.
        return creator.factory();
    },
    ctor(identifier, creator, childResolver) {
        const args = creator.args.map(x => {
            if (childResolver.isResolving(x)) {
                const identifierStack = childResolver.getResolveStack().map(x => x.identifier);
                identifierStack.push(x.identifier);
                throw new DependencyResolutionError(identifier, identifierStack, `Cannot resolve cyclic dependency.`);
            }
            return childResolver.resolveInstance(x);
        });
        return new creator.ctor(...args);
    },
    value(identifier, creator, childResolver) {
        return creator.value;
    }
}