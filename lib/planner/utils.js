"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isComponentScopable(component) {
    return (component.type === "factory" || component.type === "constructor");
}
exports.isComponentScopable = isComponentScopable;
//# sourceMappingURL=utils.js.map