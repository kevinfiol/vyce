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

[Try on Flems.io](https://flems.io/#0=N4IgZglgNgpgziAXAbVAOwIYFsZJAOgAsAXLKEAGhAGMB7NYmBvAHigjQGsACAJxigBeADog4xAJ6w4hGDGKjuhfmBEgSxAA5xEAel0BXNJs4BzfHSy64GTgd4YLcOLurPrt+47dxFkzTBqjAAexK7OogB8IAC+FOjYuIgEAFYIVHQMTMR4meLcwNzitPzcMdyC3ABuEtQwANzCaE15xEXEGIwV7SUwABSFdEbEiNwADGUAlI1ordwc1Pw4DN19kxWR7Z39mvxVG9wD3EMMo7swVRa0w9wA1NwAjFPTLfT5ACYwizDLbZVrB3E2z6532gk2RxOI24oKuNwAtI9njMmkDGPg4AYAEZ9aj2fgrcEFJrcbjvWh4374LG0d4SfAcNAwXgACQAKgBZAAy3QABiTSdwWIQHpEAMLXLK8Fi6EWRAWk4UAJkiABJgHjeATiHCGDEZYQVQqhViDMRiPRuPRqOxqJw1Asltk1lFHT9sjLTeb6PK0IKTWaLX7rbb7aJPt9fi6QJEI06GJ7Az6BbyZjFppQxAIvsQIG88AAWRBKgCcsXiIEwODwTnSNHojGYyViAF0qOwuAgUAlq8kanVM-ZyMkNNo9IZjGYrlZ+zAAAJjfAANnwY107wg4l0s-wWA4+DSmf8STEiwgmhyVE0nWosi7yAfYyoxEEDyobeQ8LfIFoIA-37QP8KGQJ8QEEYA4iAz8AKg79fw-UDBECaI2weAsKDQjCAHYAFZsJwj8QKoSJgFgNpiHfYCvyoeDgJghCqAoVQYAoXhBF4ICHiw7CMIADl4vjeMIxDIjAZBiBbQQ+ig6if1gqhAIYsCYHEltJgAMnUzjuK4iglTGPD9II4CiJAGBaDAbgZLggB+NA+loSZEFo5AAJs2g+jQJzFOA0D6ggMBpNQpcMJCpUAGZDMi4SqECljrKoDUoHoGBEFUNAYnAmJ5PAQQXNAyZSNwNslSVDC33C3i8Mq4zHyoNj4o-WTNEECiIEEZAW3qfhiHsNBgFMeREGQwLeEmChMSxRA+hYlzv3aiiWs6igDEEMAjGoXN6BmwqAr6DBeFMAxfjgfBYDQUxiEIFgHkmHq+u4UbpjY0R1tmLbmjA1qJACCzuBgGz+iepyWM0XcME0GbwX6MbJhibr5AegwMWxKSWJ80zWsmcEgqouCcox0DNP6ICcLfB5KoocKSwE6mhJM0Cgb6WHKOgqgIByzQoNA-BNAMGQdu0nicPC9CRYLGKQD6F8ULx9nBA5-8r0ELmlPwSByFQ8m3xwkWKF18LJcmY3WdkuAhuQ4AXvADaPtEQRvt+yyAaZ2HhooCBwch5CYeNuImHeZIlZAZGA8EbmqEthKQEVuirwjsDluj2hkFVuPK2QWPTJbTTcbZn9U4JzOE5bcGgP4qnwv13Dq9q0z5BgKymrg1O1JibLg7QTO25WhOYhgCxOLwh4QqXJU3zHh5Jc2vN7MauXKxy-KqEKsi+HD1CdO4pcCwEnf6bqsy2jYmXo4x-GlL6fBr4HrAMCF3SlyXJ8n7GSWfej-BBpyS-jfG6O06uXZgnNazNOICUwkuLCJYKBQJLJLBGvVeB+mTgTBO4lbi3Ekp1B+28Syj3wZLL2UNZb5zmgpdBxAvylz5rgigWEHh4QYXXUCJCAEYnkDlLOrDeBrE4lXGBWECxPiEW-BmK8KAAEJbomwAVwvuFAB7FA4pvHiQjBEFngW2LMsAZ75mSGMRAWEsLhVbDEIAA).

## Usage

See [index.d.ts](/index.d.ts) for type definitions.

By default, stores created with vyce use a built-in deep clone function adapted from [klona](https://github.com/lukeed/klona). The default function is capable of cloning objects with JSON-valid data types. You may opt to use another deep clone utility by passing a second argument to `store` should you have the need to clone more complex data types. See below for an example using `klona/full`.

```js
import { store } from 'vyce';
import { klona } from 'klona/full';

const state = store({ name: 'denam' }, klona);
```

### API

#### `store()`
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

Note: by default, the subscriber function is called once upon subscribing. Pass a falsey value as a second argument to `store.sub` to disable the initial call.
```js
import { store } from 'vyce';

const state = store(10);
const unsub = state.sub(value => console.log(value), false); // does not log

state(20); // logs `20`
```

Note that setting a store will only update and update subscribers if the new value is different than the old value. Internally, this is determined by using the `===` operator, which means passing the same reference to an object twice will *not* trigger an update even if that object has changed properties. In these instances, you can force an update by passing a shallow copy.
```js
import { store } from 'vyce';

const obj = { lanselot: 1 };
const state = store(obj);
const unsub = state.sub(value => console.log(value)); // logs `{ lanselot: 1 }`

obj.warren = 2;
state(obj); // will not log
state({ ...obj }); // logs `{ lanselot: 1, warren: 2 }`
````

#### `store.end`
Calling `end` will release all subscriptions and clean up dependency stores, meaning subscriber functions will no longer be called upon updating the store.

```js
import { store, computed } from 'vyce';

const foo = store(10);
const bar = store(20);

const rum = computed([foo, bar], (x, y) => x + y); // 30
const ham = computed([rum, bar], (x, y) => x + y); // 50

rum.end(); // breaks all listeners (ham), and also stops listening to foo and bar

bar(100); // does not affect rum, but *does* affect ham
console.log(rum()); // logs `30`

rum(0); // does not affect ham
console.log(ham()); // logs `130`
```

## Credits

Inspired by [flyd](https://github.com/paldepind/flyd), [klona](https://github.com/lukeed/klona), and [Svelte Stores](https://svelte.dev/docs#run-time-svelte-store).
