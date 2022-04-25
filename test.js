import { test, run } from 'flitch';
import { strict as assert } from 'assert';
import { store, computed } from './dist/vyce.js';

test('store get and set with primitives', () => {
    const s = store(1);

    // init
    assert.equal(s.get(), 1);

    s.set(2);
    assert.equal(s.get(), 2);

    s.set();
    assert.equal(s.get(), 2); // unchanged

    s.set(p => p + 1);
    assert.equal(s.get(), 3);
});

test('store get and set with object', () => {
    const s = store({});

    // init
    assert.deepEqual(s.get(), {});

    s.set({ a: 2 });
    assert.deepEqual(s.get(), { a: 2 });

    s.set(p => ({...p, b: 3}));
    assert.deepEqual(s.get(), { a: 2, b: 3 });

    s.set(p => {
        p.a = 4;
        delete p.b;
        return p;
    });
    assert.deepEqual(s.get(), { a: 4 });

    // attempting to modify object fails
    let failed = false;
    try {
        let foo = s.get();
        foo.a = 5;
    } catch (e) {
        failed = true;
    }

    assert.ok(failed);
});

test('store get and set with array', () => {
    const s = store([]);

    assert.deepEqual(s.get(), []);

    s.set([1, 2, 3]);
    assert.deepEqual(s.get(), [1, 2, 3]);

    s.set(p => [...p, 4, 5]);
    assert.deepEqual(s.get(), [1, 2, 3, 4, 5]);

    s.set(p => {
        p.pop();
        p[0] = 'a';
        return p;
    });
    assert.deepEqual(s.get(), ['a', 2, 3, 4]);

    // attempting to modify array fails
    let failed = false;
    try {
        let foo = s.get();
        foo[0] = 5;
    } catch (e) {
        failed = true;
    }

    assert.ok(failed);
});

test('store get and set with null and undefined', () => {
    const s = store();
    assert.equal(s.get(), undefined);

    s.set(10);
    s.set();
    assert.equal(s.get(), 10);

    s.set(undefined);
    assert.equal(s.get(), 10);

    s.set(null);
    assert.equal(s.get(), null);
});

test('listen method', () => {
    const s = store(4);
    let listening = s.get();

    let unsub = s.listen(v => listening = (v * 2));
    assert.equal(listening, 4); // should be the same

    s.set(10);
    assert.equal(listening, 20);

    s.set();
    assert.equal(listening, 20); // unchanged

    unsub();
    s.set(1);

    assert.equal(s.get(), 1);
    assert.equal(listening, 20);
});

test('subscriptions', () => {
    const s = store({ a: 2 });
    let watching;

    let unsub = s.sub(v => watching = v); // should execute initially
    assert.deepEqual(watching, { a: 2 });

    s.set(p => ({ ...p, b: 3 }));
    assert.deepEqual(watching, { a: 2, b: 3 });

    unsub();
    s.set({ c: 10 });
    assert.deepEqual(s.get(), { c: 10 });
    assert.deepEqual(watching, { a: 2, b: 3 });
});

test('computed utility', () => {
    const s = store(10);
    const t = store(20);

    const combined = computed([s, t], (first, second) => {
        return first + second;
    });

    assert.equal(combined.get(), 30);

    s.set(40);
    assert.equal(combined.get(), 60);

    t.set(10);
    assert.equal(combined.get(), 50);

    const second = computed([combined, t], (first, second) => {
        return first + second;
    });

    assert.equal(second.get(), 60);

    combined.end();
    t.set(100);
    assert.equal(combined.get(), 50); // combined is no longer subbed to t

    combined.set(0);
    // since combined broke all subs, it didn't update combined when we set to 0
    // however, t is still sending updates to second
    assert.equal(second.get(), 150);
});

run();