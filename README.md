# vyce

A [tiny](https://bundlephobia.com/package/vyce) store you can use to build tidy relationships.

```js
import { store, computed } from 'vyce';

const authors = store([
    { name: 'haruki', age: 25 },
    { name: 'james', age: 32 },
    { name: 'agatha', age: 62 }
]);

const youngAuthors = computed(() =>
    authors().filter(author => author.age < 40)
);

authors(prev => [
    ...prev,
    { name: 'david', age: 28 },
    { name: 'lovecraft', age: 57 }
]);

youngAuthors();
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

[Try on Flems.io](https://flems.io/#0=N4IgZglgNgpgziAXAbVAOwIYFsZJAOgAsAXLKEAGhAGMB7NYmBvAHigjQGsACAJxigBeADog4xAJ6w4hGDGKjuhfmBEgSxAA5xEAel0BXNJs4BzfHSy64GTgd4YLcOLurPrt+47dxFkzTBqjAAexK7OogB8lGICMNTEEPQIiCAADIgAnGkgAL4U6Ni4qfgAVghUdAxMxHhV4tzA3OK0-BTclpoGjAAm3LncgtwAbhLUMADcwmjT9cTNxBiMgwutMAAUTXRGxIjcaf0AlFNoc9w9MLwQwzB9Q53dt+vrh4ORC0sbhxa0O9wAVNwAEzHWbJeYcaj8HAMFYvN4fRjrTT8YYIzYdX4MPYomDDH5-ADU3AAjEdQadwed4tCanDXoJ3uJPsjUeitljdtxcfjtrCALSk8knabMxj4OAGABG62o9n4sMZjWm3HOtDlMOI+CltB6EnwHDQlwAEgAVACyABkVgADFWq7gsQgkyIAYU5lxYumdkXtqqdQMiABJgHLeAqtXziLkvYRA37HZpIixxLx6KZIsEgXsQxcrjcei8Y9ZiGm0BmvUmEywpd1iPRuPRqOxqJw1JDaQwXlEOzBNV7a8R62hfWgHY7B8PG6cW23RBcoX2at2QJEF53iAO6-RR6qbSdcscYnA4gkkmgUiASQBWRAAZjyBRAmBweCcFRo9EYzFSeQAulQ7BcCkqDPkUeCjOMMT2OQqQaNoeiGMYZg-FYkEwAAAmk+CZPgQK6D0EDiLo6H4FgHBlB+-jFGIUIQJotS5H+uRAA).

## Usage

See [index.d.ts](/index.d.ts) for type definitions.

By default, stores created with vyce use a built-in deep clone function adapted from [klona](https://github.com/lukeed/klona). The default function is capable of cloning objects with JSON-valid data types. You may opt to use another deep clone utility by using `setClone` should you have the need to clone more complex data types. See below for an example using `klona/full`.

```js
import { store, setClone } from 'vyce';
import { klona } from 'klona/full';

setClone(klona);
const state = store({ name: 'denam' });
```

### API

#### `store(value?)`
```js
import { store } from 'vyce';

const state = store({ name: 'denam' });

// call your store without arguments to get the value
state(); // `{ name: 'denam' }`

// pass an argument to set its value
state({ age: 18 });

// or pass a function to set a value based on the previous value
state(prev => ({ ...prev, name: 'catiua' }));

state(); // `{ age: 18, name: 'catiua' }`
```

#### `store.sub`
```js
import { store } from 'vyce';

const state = store(10);
const unsub = state.sub(value => console.log(value)); // logs `10`

state(20); // logs `20`
unsub();
state(30); // does not log anything
```

Setting a store will only update its value and run subscribers if the new value is different than the old value. Internally, this is determined by using the `===` operator. Also note: by default, the subscriber function is called once upon subscribing. Pass a falsey value as a second argument to `store.sub` to disable the initial call.

```js
import { store } from 'vyce';

const state = store(10);
const unsub = state.sub(value => console.log(value), false); // does not log

state(20); // logs `20`
```

#### `store.end`
Calling `end` will detach all subscribers from a store.

```js
import { store, computed } from 'vyce';

const foo = store(10);
const bar = store(20);

const rum = computed(() => foo() + bar()); // 30
const ham = computed(() => rum() + bar()); // 50
const logger = rum.sub(console.log); // logs `30`

rum.end(); // breaks all listeners (ham, logger)

foo(20); // foo updates rum, but since ham is no longer listening to rum, it remains at 50
ham(); // 50
```

#### `computed`
As demonstrated above, you can use `computed` to create stores derived from parent stores. Dependencies are tracked automatically. Creation of circular dependencies will throw an error.
```js
import { store, computed } from 'vyce';

const a = store(10);
const b = computed(() => a() + 10);
const c = computed(() => a(b())); // throws `Circular Dependency` Error
```

## Credits

Inspired by [flyd](https://github.com/paldepind/flyd), [klona](https://github.com/lukeed/klona), and [trkl](https://github.com/jbreckmckye/trkl).
