# vyce

A tiny store you can use to build tidy relationships.

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
/*
[
 { name: 'haruki', age: 25 },
 { name: 'james', age: 32 },
 { name: 'david', age: 28 }
]
*/
```

## Install

```bash
npm install vyce
```

## Usage

See [index.d.ts](/index.d.ts) for type definitions.

To begin using, import `store` and/or `computed` from `'vyce'`. Below is a description of a store's built-in methods.

### `Store.get`
```js
import { store } from 'vyce';

const state = store({ name: 'denam' });
state.get(); // { name: 'denam' }
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