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

[Try on Flems.io](https://flems.io/#0=N4IgZglgNgpgziAXAbVAOwIYFsZJAOgAsAXLKEAGhAGMB7NYmBvAHigjQGsACAJxigBeADog4xAJ6w4hGDGKjuhfmBEgSxAA5xEAel0BXNJs4BzfHSy64GTgd4YLcOLurPrt+47dxFkzTBqjAAexK7OogB8lGICMNTEEPQIiCAADIgAnGkgAL4U6Ni4qfgAVghUdAxMxHhV4tzA3OK0-Ny53ILcAG4S1DAA3MJow-XEzcQYjJ0TrTAAFE10RsSI3GntAJRDaGPcHNT8OAwz85udkRNTMPhw8vOa-N0X3IvcywxrjzDdFrQr3AA1NwAIxbbajZLjAAm8SONVO50El3E11u92+z2RryW-0+3ExfwBAFpQeCdsNUYxbgYAEbzaj2fgnbHAYbcbjQ2iM47EfC02jQiT4DhoGC8AASABUALIAGRmAAN2RzuCxCCDIgBhPGMXgsXQayIqjnqgBMkQAJMBGbxmXyPsRcgbCBaTWraQZiMR6Nx6NR2NROGoDvCGGcoqGYLyDZ7vfRjWhVR6vT6k-7A8HRLDDtGahGQJEc2HiLHUwmVYqdrltjE7rAEkk0CkQJlEAAOPIFECYHB4JwVGj0RjMVJ5AC6VHYXBSqB7RTwvX6MXs5FSGm0ekMxjMfysS5gAAE0vgzfg0rpoRBxLoD-gsBwyoP-MUxIcIJparlx7kgA).

## Usage

See [index.d.ts](/index.d.ts) for type definitions.

To begin using vyce, import `store` and/or `computed`.

### `Store.get`
```js
import { store } from 'vyce';

const state = store({ name: 'denam' });
state.get(); // `{ name: 'denam' }`
```

### `Store.set`
```js
import { store } from 'vyce';

const state = store({ name: 'denam' });
state.set(); // store is not changed
state.get(); // `{ name: 'denam' }`

state.set({ age: 18 }); // store is overwritten
state.get(); // `{ age: 18 }`

state.set(prev => ({ ...prev, name: 'catiua' }));
state.get(); // `{ age: 18, name: 'catiua' }`
```

### `Store.listen`
```js
import { store } from 'vyce';

const state = store(10);
const unsub = state.listen(value => console.log(value)); // listener function is not called yet

state.set(20); // logs `20`
unsub();
state.set(30); // does not log anything
```

### `Store.sub`
Same as `Store.listen`, except the subscriber function is called upon subscribing.
```js
import { store } from 'vyce';

const state = store(10);
const unsub = state.sub(value => console.log(value)); // logs `10`

state.set(20); // logs `20`
unsub();
state.set(30); // does not log anything
```

### `Store.end`
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

Inspired by [flyd](https://github.com/paldepind/flyd), and [Svelte Stores](https://svelte.dev/docs#run-time-svelte-store).