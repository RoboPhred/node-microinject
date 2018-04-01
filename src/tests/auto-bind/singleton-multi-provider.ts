
import { expect } from "chai";

import {
    Identifier,
    injectable,
    provides,
    singleton,
    Container
} from "../..";

describe("Integration", function() {
    describe("Singleton multi-provider", function() {
        interface LeftTarget { getLeft (): number};
        interface RightTarget { getRight (): number};
        const Left = Symbol("left") as Identifier<LeftTarget>;
        const Right = Symbol("right") as Identifier<RightTarget>;

        @injectable()
        @provides(Left)
        @provides(Right)
        @singleton()
        class LeftRightImpl implements LeftTarget, RightTarget {
            getLeft(): number {
                return -5;
            }
            getRight(): number {
                return 5;
            }
        }
        
        let left: LeftTarget;
        let right: RightTarget;
        before(function() {
            const container = new Container();
            container.bind(LeftRightImpl);
            left = container.get(Left);
            right = container.get(Right);
        });

        it("uses the same singleton for both services", function() {
            expect(left).equals(right);
        });
    });
});