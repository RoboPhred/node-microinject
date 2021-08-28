import { expect } from "chai";
import { Container } from "../container";
import { injectable, injectParam } from "../injection";
import { ParameterNotSuppliedError } from "../errors";
import { Context, Identifier } from "..";

describe("Parameters", function () {
  describe("container.get()", function () {
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

    it("injects the param on the created instance", function () {
      const paramValue = 42;
      const instance = container.get(ParamReceiver, {
        [paramName]: paramValue,
      });
      expect(instance.param).to.equal(paramValue);
    });

    it("when a non-optional parameter is not supplied it throws an error", function () {
      const create = () => container.get(ParamReceiver);
      expect(create).throws(ParameterNotSuppliedError, /Param1/);
    });

    it("when an optional parameter is not supplied it injects undefined", function () {
      const instance = container.get(OptionalParamReceiver);
      expect(instance.param).to.be.undefined;
    });
  });

  describe("container.create()", function () {
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

    it("injects the param on the created instance", function () {
      const instance = container.create(ParamReceiver, {
        [param1]: param1Value,
      });
      expect(instance.param1).to.equal(param1Value);
    });

    it("when a non-optional parameter is not supplied it throws an error", function () {
      const create = () => container.create(ParamReceiver);
      expect(create).throws(ParameterNotSuppliedError, /Param1/);
    });

    it("when an optional parameter is not supplied it injects undefined", function () {
      const instance = container.create(OptionalParamReceiver);
      expect(instance.param1).to.be.undefined;
    });
  });

  describe("factory.get()", function () {
    let container: Container;
    let FactoryIdentifier: Identifier<ParamReceiver> = "factory";
    let ReceiverIdentifier: Identifier<ParamReceiver> = "receiver";
    const paramFromContainer = "ParamFromContainer";
    const paramFromFactory = "ParamFromFactory";
    const paramFromContainerValue = "from-container";
    const paramFromFactoryValue = "from-factory";

    function factory(context: Context) {
      return context.get(ReceiverIdentifier, {
        [paramFromFactory]: paramFromFactoryValue,
      });
    }

    @injectable()
    class ParamReceiver {
      constructor(
        @injectParam(paramFromContainer) public paramFromContainer: string,
        @injectParam(paramFromFactory) public paramFromFactory: string
      ) {}
    }

    beforeEach(() => {
      container = new Container();
      container.bind(FactoryIdentifier).toFactory(factory);
      container.bind(ReceiverIdentifier).to(ParamReceiver);
    });

    it("Receives the container get parameter", function () {
      const receiver = container.get(FactoryIdentifier, {
        [paramFromContainer]: paramFromContainerValue,
      });
      expect(receiver.paramFromContainer).to.equal(paramFromContainerValue);
    });

    it("Receives the factory get parameter", function () {
      const receiver = container.get(FactoryIdentifier, {
        [paramFromContainer]: paramFromContainerValue,
      });
      expect(receiver.paramFromFactory).to.equal(paramFromFactoryValue);
    });
  });
});
