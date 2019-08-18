## Getting Started

### Create the container

To use microinject, you must first create a container. When configured with bindings, the container will construct object graphs and track object instances.

```js
import { Container } from "microinject";

const container = new Container();
```

### Create a simple binding

Bindings tell microinject how to resolve identifiers into components. Every object resolution starts with a binding, and may involve multiple bindings if the requested value itself requires other values.

There are two ways to configure bindings: through decorators, or through the container.bind() function. For now, we will stick to the bind() function.

Binding an identifier through the bind() function is a two step process. The bind() function takes the identifier, and returns a binding object which then must be configured to choose the value provided when the identifier is requested.

There are multiple strategies a binding may use to generate its value, but for now we will use the simplest available: `toConstantValue`. As the name suggests, this configures the binding to return the supplied value.

```js
import { Identifier } from "microinject";

// Create an identifier for Name.
//  The `Identifier` type is optional, and is used to
//  allow container.get() to return a strongly typed value.
const Name: Identifier<string> = "Name";

// Bind the Name identifier to the string "Alan Turing".
container.bind(Name).toConstantValue("Alan Turing");

// Get the name given the identifier.
//  Thanks to the Identifier typing above, typescript correctly determines the return type is a string in this instance.
const myName = container.get(Name);
console.log("Hello", myName);
```

### Creating a class instance

While constant values are useful for configuration, the primary use of microinject is to instantiate classes.

To bind an identifier to a class, we can use the `to()` configuration method on the binder. Take note that the class must be marked `@injectable()` in order to be accepted as a valid
class.

```js
// Create an identifier and an interface for our Greeter class.
// Note that typescript allows an interface and a constant to share the same name.
//  This is a good design pattern to get into, as it connects the identifier with its required contract.
const Greeter: Identifier<Greeter> = "Greeter";
interface Greeter {
  greet(): void;
}

// Mark the class as injectable to allow the container to make use of it.
@injectable()
class GenericGreeter implements Greeter {
  greet() {
    console.log("Hello World");
  }
}

// Bind the Greeter identifier to our GenericGreeter class.
container.bind(Greeter).to(GenericGreeter);

// Request a Greeter.  This will create a new instance of the GenericGreeter class and return it to us.
const greeter = container.get(Greeter);
greeter.greet();
```

### Injecting identifiers by class constructor

Now that we have a class being instantiated, it's time to apply some true dependency injection and request some identifiers from the class itself. This is done with the `@inject()` decorator.

Note that this example makes use of the Name binding from the simple binding example.

```js
import { Identifier, injectable, inject } from "microinject";

@injectable()
class NamedGreeter implements Greeter {

  // We can request other values through our constructor.
  // In this case, we want to have the value of the Name identifier injected into a private property `_name`
  constructor(
    @inject(Name) private _name: string
  ) { }

  greet() {
    console.log("Hello", this._name);
  }
}

container.bind(Greeter).to(NamedGreeter);

const greeter = container.get(Greeter);
greeter.greet();
```

### Injecting identifiers by properties

In addition to constructor injections, property injections are also supported.

```js
import { Identifier, injectable, inject } from "microinject";

@injectable()
class NamedGreeter implements Greeter {

  @inject(Name)
  private _name: string;

  greet() {
    console.log("Hello", this._name);
  }
}

container.bind(Greeter).to(NamedGreeter);

const greeter = container.get(Greeter);
greeter.greet();
```

### Singleton bindings

By default, microinject will create a new instance of a class when requested. However, this behavior can be changed so that the same instance is always returned. This is called a singleton pattern.
To make a binding into a singleton, we can call `.inSingletonScope()` after choosing the binding target

```js
@injectable()
class CountingGreeter implements Greeter {
  private _count: number = 0;

  greet() {
    console.log("Hello", this._count++);
  }
}

// Bind our CountingGreeter as a singleton, so the same instance is reused whenever it is requested.
container.bind(Greeter).to(CountingGreeter).inSingletonScope();

const firstGreeter = container.get(Greeter);
firstGreeter.greet();

const secondGreeter = container.get(Greeter);
secondGreeter.greet();

console.log("Greeters are same?", firstGreeter === secondGreeter);
```

### Configuring bindings using decorators

One issue with using the traditional binding syntax is it seperates the classes from their configuration. Microinject works around this by also providing decorators that can
store the binding configuration onto the class in question.

When a class is passed as the identifier to the `bind()` function, it will check to see if configuration decorators have been applied to the class. If so, it will
preconfigure its binding based on the decorators. Any attempt to use the binding configuration functions on the resultant binding will override the decorator settings.

Here is the CountingGreeter again, this time configured with decorators.

```js
import { injectable, singleton, provides } from "microinject";

// Mark the class as injectable, so it can be used by the container
@injectable()
// Mark the class as a singleton, so a single instance is created and shared.
@singleton()
// Mark this class as identified by the Greeter identifier.
@provides(Greeter)
class CountingGreeter implements Greeter {
  private _count: number = 0;

  greet() {
    console.log("Hello", this._count++);
  }
}

// Call bind() on the class to read its decorators and create the appropriate binding.
container.bind(CountingGreeter);

const greeter = container.get(Greeter);
greeter.greet();
```
