
import { expect } from "chai";

import {
    inject,
    injectable,
    Container
} from "../.."

describe("Multi Injection", function () {
    const InjectedService = Symbol("InjectedService");

    @injectable(InjectedService)
    class TestInjectA { }
    @injectable(InjectedService)
    class TestInjectB { }

    @injectable()
    class TestTarget {
        constructor(
            @inject(InjectedService, { all: true }) public injected: any[]
        ) { }
    }

    let instance: TestTarget;
    before(function () {
        const container = new Container();
        container.bind(TestInjectA);
        container.bind(TestInjectB);
        container.bind(TestTarget);

        instance = container.get(TestTarget);
    });

    it("receives all bindings for the injected service", function () {
        expect(instance.injected.length).equals(2);
        
        // Want a more elegant way to test this...
        const first = instance.injected[0];
        const hasA = first instanceof TestInjectA || first instanceof TestInjectB;
        expect(hasA).to.be.true;

        const second = instance.injected[1];
        const hasB = second instanceof TestInjectA || second instanceof TestInjectB;
        expect(hasB).to.be.true;
    });
});