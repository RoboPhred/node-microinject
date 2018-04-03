/**
 * Gets a symbol unique to all instances of this library with the given id.
 * The returned symbol may be retrieved from a symbol cache, enabling
 * multiple copies of the library to interop.
 * @param id The ID of the symbol to get.
 */
export declare function getSymbol(id: string): symbol;
