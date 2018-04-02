
declare module "require-dir" {
    interface RequireDirOpts {
        filter: (path: string) => boolean;
    }
    function requireDir(path: string, options?: RequireDirOpts): {[key: string]: any};
    export = requireDir;
}