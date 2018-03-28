
import {
    ComponentCreator,
    ScopeableComponentCreator
} from "./interfaces";

export function isComponentScopable(component: ComponentCreator): component is ScopeableComponentCreator {
    return (component.type === "factory" || component.type === "constructor");
}