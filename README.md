# vyce

A tiny store you can subscribe to and combine.

```js
import { store } from 'vyce';

const authors = store([
    { name: 'haruki', age: 25 },
    { name: 'james', age: 32 },
    { name: 'agatha', age: 62 }
]);

let youngAuthors;
const unsub = authors.sub(list => {
    youngAuthors = list.filter(author => author.age < 40);
});

authors.set(prev => [
    ...prev,
    { name: 'david', age: 28 },
    { name: 'lovecraft', age: 57 }
]);

// youngAuthors
// [
//   { name: 'haruki', age: 25 },
//   { name: 'james', age: 32 },
//   { name: 'david', age: 28 }
// ]
```

Use `combine` to build stores with tidy relationships.
```js
import { store, combine } from 'vyce';

const revenue = store(1000);
const donations = store(500);

const total = combine((x, y) => x + y, [revenue, donations]);
total.get(); // 1500

revenue.set(1500);
total.get(); // 2000

const taxes = store(250);
const afterTaxes = combine((x, y) => x - y, [total, taxes]);
afterTaxes.get(); // 1750
```