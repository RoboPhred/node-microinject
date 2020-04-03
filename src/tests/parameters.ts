import { expect } from "chai";
import { Container } from "../container";
import { injectable, injectParam, inject } from "../injection";
import { ParameterNotSuppliedError } from "../errors";
import { Identifier } from "../interfaces";

describe("Parameters", function() {
  describe("container.get()", function() {
    const paramName = "Param1";

    class ParamReceiver {
      constructor(@injectParam(paramName) public param: any) {}
    }

    class OptionalParamReceiver {
      constructor(
        @injectParam(paramName, { optional: true }) public param: any
      ) {}
    }

    let container: Container;
    beforeEach(() => {
      container = new Container();
      container.bind(ParamReceiver).toSelf();
      container.bind(OptionalParamReceiver).toSelf();
    });

    it("injects the param on the created instance", function() {
      const paramValue = 42;
      const instance = container.get(ParamReceiver, {
        [paramName]: paramValue
      });
      expect(instance.param).to.equal(paramValue);
    });

    it("when a non-optional parameter is not supplied it throws an error", function() {
      const create = () => container.get(ParamReceiver);
      expect(create).throws(ParameterNotSuppliedError, /Param1/);
    });

    it("when an optional parameter is not supplied it injects null", function() {
      const instance = container.get(OptionalParamReceiver);
      expect(instance.param).to.be.null;
    });
  });

  describe("container.create()", function() {
    let container: Container;
    const param1 = "Param1";
    const param1Value = 1;

    @injectable()
    class ParamReceiver {
      constructor(@injectParam(param1) public param1: number) {}
    }

    @injectable()
    class OptionalParamReceiver {
      constructor(
        @injectParam(param1, { optional: true }) public param1: number | null
      ) {}
    }

    beforeEach(() => {
      container = new Container();
    });

    it("injects the param on the created instance", function() {
      const instance = container.create(ParamReceiver, {
        [param1]: param1Value
      });
      expect(instance.param1).to.equal(param1Value);
    });

    it("when a non-optional parameter is not supplied it throws an error", function() {
      const create = () => container.create(ParamReceiver);
      expect(create).throws(ParameterNotSuppliedError, /Param1/);
    });

    it("when an optional parameter is not supplied it injects null", function() {
      const instance = container.create(OptionalParamReceiver);
      expect(instance.param1).to.be.null;
    });
  });
});
