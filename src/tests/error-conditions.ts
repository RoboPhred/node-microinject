import { expect } from "chai";

import {
  Container,
  DependencyResolutionError,
  inject,
  injectable,
  provides,
} from "..";
import { singleton } from "../scope";

describe("Error Conditions", function () {
  it("missing injections are handled", function () {
    const IdentifierA = Symbol("IdentifierA");
    const IdentifierB = Symbol("IdentifierB");

    @injectable()
    @provides(IdentifierA)
    class ClassA {
      constructor(@inject(IdentifierB) public b: any) {}
    }

    const container = new Container();
    container.bind(ClassA);

    expect(() => {
      container.get(IdentifierA);
    }).to.throw(DependencyResolutionError);
  });

  it("circular constructor dependencies throw DependencyResolutionError", function () {
    const IdentifierA = Symbol("IdentifierA");
    const IdentifierB = Symbol("IdentifierB");

    @injectable()
    @provides(IdentifierA)
    class ClassA {
      constructor(@inject(IdentifierB) public b: ClassB) {}
    }

    @injectable()
    @provides(IdentifierB)
    class ClassB {
      constructor(@inject(IdentifierA) public a: ClassA) {}
    }

    const container = new Container();
    container.bind(ClassA);
    container.bind(ClassB);

    expect(() => {
      container.get(IdentifierA);
    }).to.throw(DependencyResolutionError, /Circular/);
  });

  it("circular property dependencies throw DependencyResolutionError", function () {
    const IdentifierA = Symbol("IdentifierA");
    const IdentifierB = Symbol("IdentifierB");

    @injectable()
    @provides(IdentifierA)
    class ClassA {
      @inject(IdentifierB) public b!: ClassB;
    }

    @injectable()
    @provides(IdentifierB)
    class ClassB {
      @inject(IdentifierA) public a!: ClassA;
    }

    const container = new Container();
    container.bind(ClassA);
    container.bind(ClassB);

    expect(() => {
      container.get(IdentifierA);
    }).to.throw(DependencyResolutionError, /Circular/);
  });
});
