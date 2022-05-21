# vyce

A [tiny](https://bundlephobia.com/package/vyce) store you can use to build tidy relationships.

```js
import { store, computed } from 'vyce';

const authors = store([
    { name: 'haruki', age: 25 },
    { name: 'james', age: 32 },
    { name: 'agatha', age: 62 }
]);

const youngAuthors = computed([authors], xs =>
    xs.filter(author => author.age < 40)
);

authors.set(prev => [
    ...prev,
    { name: 'david', age: 28 },
    { name: 'lovecraft', age: 57 }
]);

youngAuthors.get()
// [
//  { name: 'haruki', age: 25 },
//  { name: 'james', age: 32 },
//  { name: 'david', age: 28 }
// ]
```

## Install

Node
```bash
npm install vyce
```

Deno
```js
import { store, computed } from 'https://deno.land/x/vyce/index.js';
```

Browser
```html
<script src="https://unpkg.com/vyce/dist/vyce.min.js"></script>
```

In the browser context, the default export name is `vyce`.

Browser (ESM)
```html
<script type="module">
  import { store, computed } from 'https://unpkg.com/vyce/dist/vyce.js';
</script>
```

[Try on Flems.io](https://flems.io/#0=N4IgZglgNgpgziAXAbVAOwIYFsZJAOgAsAXLKEAGhAGMB7NYmBvAHigjQGsACAJxigBeADog4xAJ6w4hGDGKjuhfmBEgSxAA5xEAel0BXNJs4BzfHSy64GTgd4YLcOLurPrt+47dxFkzTBqjAAexK7OogB8IAC+FOjYuIgEAFYIVHQMTMR4meLcwNzitPzcMdyC3ABuEtQwANzCaE15xEXEGIwV7SUwABSFdEbEiNwADGUAlI1ordwc1Pw4DN19kxWR7Z0w+HDyfZr8VRvcA9xDDKOHMFUWtMPcANTcAIxT0y30+QAmMIswyzalTWJ3E212+2ux0EmzOFxG3ChdweAFpXu8Zk0wYxdgYAEZ9aj2fgrGEFJrcbjfWhEwH4PG0b4SfAcNAwXgACQAKgBZAAy3QABhTKdwWIQXpEAML3LK8Fi6CWREWU8UAJkiABJgETeCTiMiGDEFYQNSqxXiDMRiPRuPRqOxqJw1Asltk1lFXQDsgrLdb6Mq0KKLVabUH7Y7naJfv9AR6QJEY26GL7QwGRYKZjFppQxAI-sQIF88C8AMyIF6xeIgTA4PBOdI0eiMZjJWIAXSo7C4CBQCTryRqdVz9nIyQ02j0hmMZjuViHMAAAmN8AA2fBjXTfCDiXQL-BYDj4NK5-xJMSLCCaHIxdsxIA).

## Usage

See [index.d.ts](/index.d.ts) for type definitions.

By default, stores created with vyce use a built-in deep clone function adapted from [klona](https://github.com/lukeed/klona). The default function is capable of cloning objects with JSON-valid data types. You may opt to use another deep clone utility should you have the need to clone more complex data types. See below for an example.

```js
import { store } from 'vyce';
import { klona } from 'klona/full';

const state = store({ name: 'denam' }, { clone: klona });
```

### API

#### `store.get`
```js
import { store } from 'vyce';

const state = store({ name: 'denam' });
state.get(); // `{ name: 'denam' }`
```

#### `store.set`
```js
import { store } from 'vyce';

const state = store({ name: 'denam' });

state.set({ age: 18 }); // store is overwritten
state.get(); // `{ age: 18 }`

state.set(prev => ({ ...prev, name: 'catiua' }));
state.get(); // `{ age: 18, name: 'catiua' }`
```

#### `store.sub`
Note: by default, the subscriber function is called once upon subscribing.
```js
import { store } from 'vyce';

const state = store(10);
const unsub = state.sub(value => console.log(value)); // logs `10`

state.set(20); // logs `20`
unsub();
state.set(30); // does not log anything
```

Pass a falsey value as a second argument to `store.sub` to disable the initial call.
```js
import { store } from 'vyce';

const state = store(10);
const unsub = state.sub(value => console.log(value), false); // does not log

state.set(20); // logs `20`
```

#### `store.end`
Calling `end` will release all subscriptions and clean up dependency stores, meaning subscriber functions will no longer be called upon updating the store.

```js
import { store, computed } from 'vyce';

const foo = store(10);
const bar = store(20);

const rum = computed([foo, bar], (x, y) => x + y); // 30
const ham = computed([rum, bar], (x, y) => x + y); // 50

rum.end(); // breaks all listeners (ham), and also stops listening to foo and bar

bar.set(100); // does not affect rum, but *does* affect ham
console.log(rum.get()); // logs `30`

rum.set(0); // does not affect ham
console.log(ham.get()); // logs `130`
```

## Credits

Inspired by [flyd](https://github.com/paldepind/flyd), [klona](https://github.com/lukeed/klona), and [Svelte Stores](https://svelte.dev/docs#run-time-svelte-store).
