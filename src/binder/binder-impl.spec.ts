import { expect } from "chai";

import { Identifier } from "../interfaces";

import { injectable, inject } from "../injection";

import { Scope, SingletonScope, inScope, asScope } from "../scope";

import { BinderImpl } from "./binder-impl";

import { Binding } from "./binding";

import { BindingConfigurationError } from "./errors";

describe("@BinderImpl", function() {
  // Tests for explicit function calls on the binding.
  const identifier = Symbol("test-identifier") as Identifier;

  describe("binding", function() {
    describe("auto-bind", function() {
      it("throws if the target is not a function or class", function() {
        const testValues = [
          42,
          "test-string",
          Symbol("test-symbol"),
          { name: "test-obect" }
        ];

        function tryBindValue(value: any) {
          const binder = new BinderImpl(value);
          return binder._getBinding();
        }

        testValues.forEach(value => {
          expect(() => tryBindValue(value)).to.throw(BindingConfigurationError);
        });
      });

      it("throws if the target is a non-injectable class", function() {
        class TestBlankClass {}
        const binder = new BinderImpl(TestBlankClass);

        expect(() => binder._getBinding()).to.throw(BindingConfigurationError);
      });

      describe("with an @injectable class identifier", function() {
        @injectable(identifier)
        class TestAutoBindClass {}

        let binding: Binding;
        before(function() {
          const binder = new BinderImpl(TestAutoBindClass);
          binding = binder._getBinding();
        });

        it("generates a constructor binding", function() {
          expect(binding)
            .property("type")
            .equals("constructor");
        });

        it("sets binding.ctor to the constructor", function() {
          expect(binding)
            .property("ctor")
            .equals(TestAutoBindClass);
        });
      });
    });

    describe(".to()", function() {
      class TestBlankClass {}

      let binding: Binding;
      before(function() {
        const binder = new BinderImpl(identifier);
        binder.to(TestBlankClass);
        binding = binder._getBinding();
      });

      it("generates a constructor binding", function() {
        expect(binding)
          .property("type")
          .equals("constructor");
      });

      it("sets binding.ctor to the provided constructor", function() {
        expect(binding)
          .property("ctor")
          .equals(TestBlankClass);
      });
    });

    describe(".toSelf()", function() {
      class TestBlankClass {}

      let binding: Binding;
      before(function() {
        const binder = new BinderImpl(TestBlankClass);
        binder.toSelf();
        binding = binder._getBinding();
      });

      it("generates a constructor binding", function() {
        expect(binding)
          .property("type")
          .equals("constructor");
      });

      it("sets binding.ctor to the identifier constructor", function() {
        expect(binding)
          .property("ctor")
          .equals(TestBlankClass);
      });
    });

    describe(".toDynamicValue()", function() {
      function testFactory() {}

      let binding: Binding;
      before(function() {
        const binder = new BinderImpl(identifier);
        binder.toDynamicValue(testFactory);
        binding = binder._getBinding();
      });

      it("generates a factory binding", function() {
        expect(binding)
          .property("type")
          .equals("factory");
      });

      it("sets binding.factory to the provided factory", function() {
        expect(binding)
          .property("factory")
          .equals(testFactory);
      });
    });

    describe(".toConstantValue()", function() {
      const boundValue = 42;

      let binding: Binding;
      before(function() {
        const impl = new BinderImpl(identifier);
        impl.toConstantValue(boundValue);
        binding = impl._getBinding();
      });

      it("generates a value binding", function() {
        expect(binding)
          .property("type")
          .equals("value");
      });

      it("sets binding.value to the provided value", function() {
        expect(binding)
          .property("value")
          .equals(boundValue);
      });
    });
  });

  describe("scoping", function() {
    class TestBlankClass {}

    const AutoBoundScope = "auto-bound-scope" as Scope;
    @injectable()
    @inScope(AutoBoundScope)
    class TestAutoBoundClass {}

    it("defaults binding.createInScope to null", function() {
      const binder = new BinderImpl(identifier);
      binder.to(TestBlankClass);

      let binding = binder._getBinding();

      expect(binding).property("createInScope").to.be.null;
    });

    describe("auto-bind", function() {
      it("uses the scope specified by the @inScope decorator", function() {
        const binder = new BinderImpl(TestAutoBoundClass);
        let binding = binder._getBinding();
        expect(binding)
          .property("createInScope")
          .equals(AutoBoundScope);
      });
    });

    describe(".toSingletonScope()", function() {
      it("sets binding.createInScope to the singleton scope", function() {
        const binder = new BinderImpl(identifier);
        binder.to(TestBlankClass);
        binder.inSingletonScope();

        let binding = binder._getBinding();

        expect(binding)
          .property("createInScope")
          .equals(SingletonScope);
      });

      it("overrides the @isScope decorator", function() {
        const binder = new BinderImpl(identifier);
        binder.to(TestAutoBoundClass);
        binder.inSingletonScope();

        let binding = binder._getBinding();

        expect(binding)
          .property("createInScope")
          .equals(SingletonScope);
      });

      it("throws if the scope is already configured", function() {
        const binder = new BinderImpl(identifier);
        binder.to(TestBlankClass);
        binder.inScope("PreviouslyBoundScope");

        expect(() => binder.inSingletonScope()).to.throw(
          BindingConfigurationError
        );
      });

      it("throws if used on a value binding", function() {
        const binder = new BinderImpl(identifier);
        binder.toConstantValue(42);

        expect(() => binder.inSingletonScope()).to.throw(
          BindingConfigurationError
        );
      });
    });

    describe(".toTransientScope()", function() {
      it("sets binding.createInScope to null", function() {
        const binder = new BinderImpl(identifier);
        binder.to(TestBlankClass);
        binder.inTransientScope();

        let binding = binder._getBinding();

        expect(binding).property("createInScope").to.be.null;
      });

      it("overrides the @isScope decorator", function() {
        const binder = new BinderImpl(identifier);
        binder.to(TestAutoBoundClass);
        binder.inTransientScope();

        let binding = binder._getBinding();

        expect(binding).property("createInScope").to.be.null;
      });

      it("throws if the scope is already configured", function() {
        const binder = new BinderImpl(identifier);
        binder.to(TestBlankClass);
        binder.inScope("PreviouslyBoundScope");

        expect(() => binder.inTransientScope()).to.throw(
          BindingConfigurationError
        );
      });

      it("throws if used on a value binding", function() {
        const binder = new BinderImpl(identifier);
        binder.toConstantValue(42);

        expect(() => binder.inTransientScope()).to.throw(
          BindingConfigurationError
        );
      });
    });

    describe(".createInScope()", function() {
      const scope: Scope = "test-scope";

      it("sets binding.createInScope to the scope", function() {
        const binder = new BinderImpl(identifier);
        binder.to(TestBlankClass);
        binder.inScope(scope);

        let binding = binder._getBinding();

        expect(binding)
          .property("createInScope")
          .equals(scope);
      });

      it("overrides the @inScope decorator", function() {
        const binder = new BinderImpl(identifier);
        binder.to(TestAutoBoundClass);
        binder.inScope(scope);

        let binding = binder._getBinding();

        expect(binding)
          .property("createInScope")
          .equals(scope);
      });

      it("throws if the scope is already configured", function() {
        const binder = new BinderImpl(identifier);
        binder.to(TestBlankClass);
        binder.inScope("PreviouslyBoundScope");

        expect(() => binder.inScope("new-scope")).to.throw(
          BindingConfigurationError
        );
      });

      it("throws if used on a value binding", function() {
        const binder = new BinderImpl(identifier);
        binder.toConstantValue(42);

        expect(() => binder.inScope(scope)).to.throw(BindingConfigurationError);
      });
    });
  });

  describe(".asScope()", function() {
    class TestBlankClass {}

    const AutoBoundScope = "auto-bound-scope" as Scope;
    @injectable()
    @asScope(AutoBoundScope)
    class TestAutoBoundClass {}

    it("defaults binding.definesScope to null", function() {
      const binder = new BinderImpl(identifier);
      binder.to(TestBlankClass);

      let binding = binder._getBinding();

      expect(binding).property("definesScope").to.be.null;
    });

    it("throws if used on a value binding", function() {
      const binder = new BinderImpl(identifier);
      binder.toConstantValue(42);

      expect(() => binder.asScope("some-scope")).to.throw(
        BindingConfigurationError
      );
    });

    it("throws if a scope has already been defined", function() {
      const binder = new BinderImpl(identifier);
      binder.to(TestBlankClass);
      binder.asScope("previous-scope");

      expect(() => binder.asScope("some-scope")).to.throw(
        BindingConfigurationError
      );
    });

    describe("auto-bind", function() {
      it("uses the scope specified by the @asScope decorator", function() {
        const binder = new BinderImpl(TestAutoBoundClass);
        let binding = binder._getBinding();
        expect(binding)
          .property("definesScope")
          .equals(AutoBoundScope);
      });
    });

    describe("with a specified scope", function() {
      const scope: Scope = "test-scope";

      it("sets binding.definesScope to the specified scope", function() {
        const binder = new BinderImpl(identifier);
        binder.to(TestBlankClass);
        binder.asScope(scope);

        const binding = binder._getBinding();

        expect(binding)
          .property("definesScope")
          .equals(scope);
      });

      it("overrides the asScope decorator", function() {
        const binder = new BinderImpl(identifier);
        binder.to(TestAutoBoundClass);
        binder.asScope(scope);

        const binding = binder._getBinding();

        expect(binding)
          .property("definesScope")
          .equals(scope);
      });
    });

    describe("with no scope specified", function() {
      it("sets binding.definesScope to the binding identifier", function() {
        const binder = new BinderImpl(identifier);
        binder.to(TestBlankClass);
        binder.asScope();

        const binding = binder._getBinding();

        expect(binding)
          .property("definesScope")
          .equals(identifier);
      });

      it("overrides the asScope decorator", function() {
        const binder = new BinderImpl(identifier);
        binder.to(TestAutoBoundClass);
        binder.asScope();

        const binding = binder._getBinding();

        expect(binding)
          .property("definesScope")
          .equals(identifier);
      });
    });
  });
});
