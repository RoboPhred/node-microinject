require("source-map-support").install({
    // Stop source-map-support killing mocha.
    handleUncaughtExceptions: false,
    // Since we are watching, code can change between operations.
    emptyCacheBetweenOperations: true
});