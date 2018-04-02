
import { expect } from "chai";

import {
    Identifier,
    Container,
    injectable,
    singleton,
} from "../..";

describe("Singleton", function() {
    interface TestSingleton {
        getInstanceId(): number;
    }
    const TestSingleton = Symbol("TestSingleton") as Identifier<TestSingleton>;

    let container: Container;
    before(function() {

        @injectable(TestSingleton)
        @singleton()
        class TestSingletonImpl implements TestSingleton {
            private static nextInstanceId = 1;
            private _instanceId: number;
    
            constructor() {
                this._instanceId = TestSingletonImpl.nextInstanceId++;
            }
    
            getInstanceId() {
                return this._instanceId;
            }
        }

        container = new Container();
        container.bind(TestSingletonImpl);
    });

    it("generates a single instance for all requests", function() {
        const singleton = container.get(TestSingleton);
        const otherRequests = Array.from(new Array(3), () => container.get(TestSingleton));

        for(let other of otherRequests) {
            expect(other).to.equal(singleton);
        }
    });
});