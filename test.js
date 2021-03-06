import { suite, run } from 'flitch';
import { strict as assert } from 'assert';
import { store, computed } from './dist/vyce.js';

const test = suite('Vyce Tests');

test('store get and set with primitives', () => {
    const s = store(1);

    // init
    assert.equal(s.get(), 1);

    s.set(2);
    assert.equal(s.get(), 2);

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
});

test('store get and set with null and undefined', () => {
    const s = store();
    assert.equal(s.get(), undefined);

    s.set(10);
    s.set();
    assert.equal(s.get(), undefined);

    s.set(null);
    assert.equal(s.get(), null);
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

test('subscriptions with initial calculation disabled', () => {
    const s = store({ a: 2 });
    let watching;

    let unsub = s.sub(v => watching = v, false); // should not execute
    assert.equal(watching, undefined);

    s.set(p => ({ ...p, b: 3 }));
    assert.deepEqual(watching, { a: 2, b: 3 });

    unsub();
    s.set({ c: 10 });
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

test('computed with many stores', () => {
    const s = store({ num: 10 });
    const t = computed([s], x => ({ ...x, num: x.num + 10 }));
    const u = computed([t], x => ({ ...x, num: x.num * 2 }));

    assert.deepEqual(s.get(), { num: 10 });
    assert.deepEqual(t.get(), { num: 20 });
    assert.deepEqual(u.get(), { num: 40 });

    s.set(prev => ({ ...prev, num: prev.num * 10 }));
    assert.deepEqual(s.get(), { num: 100 });
    assert.deepEqual(t.get(), { num: 110 });
    assert.deepEqual(u.get(), { num: 220 });

    let noOfTimesComputedFnRan = 0;
    const foo = computed([s, t, u], (x, y, z) => {
        noOfTimesComputedFnRan += 1;
        return x.num + y.num + z.num;
    });

    // computed function should only run ONCE to get initial calculation
    assert.equal(noOfTimesComputedFnRan, 1);
    assert.equal(foo.get(), 430);
});

test('defaultClone utility', () => {
    const s = store({ boxes: { a: { v: 10 }, b: { v: 20 } } });
    let tmp = s.get();

    assert.notEqual(tmp, s.get());
    assert.notEqual(tmp.boxes, s.get().boxes);
    assert.notEqual(tmp.boxes.a, s.get().boxes.a);
    assert.deepEqual(tmp, s.get());

    // test setting
    s.set(prev => {
        prev.boxes.a.v = 20;
        assert.notEqual(s.get().boxes.a.v, 20);
        return prev;
    });

    assert.equal(s.get().boxes.a.v, 20);

    // test subs
    s.sub((current) => {
        current.boxes.a.v = 100;
        assert.notEqual(s.get(), current);
        assert.notEqual(s.get().boxes.a, current.boxes.a);
    });

    assert.equal(s.get().boxes.a.v, 20);
});

test('using a custom clone utility', () => {
    // this clone utility... doesn't clone at all! it just returns the same reference
    const s = store({ boxes: { a: { v: 10 } } }, (x) => x);
    let tmp = s.get();

    // in this case, the references should be equal
    assert.equal(tmp, s.get());
    assert.equal(tmp.boxes, s.get().boxes);
    assert.equal(tmp.boxes.a, s.get().boxes.a);

    // this clone is just a shallow copy of objects and arrays
    const shallowClone = x => {
        if (Array.isArray(x)) return [...x];
        if (x && Object.getPrototypeOf(x) == Object.prototype) return {...x};
        return x;
    };

    const t = store({ boxes: { a: { v: 10 } }, foo: [{ b: 20 }] }, shallowClone);

    tmp = t.get();
    assert.notEqual(tmp, t.get()); // only the top level obj is cloned
    assert.equal(tmp.boxes, t.get().boxes);
    assert.equal(tmp.foo, t.get().foo);
    assert.equal(tmp.foo[0], t.get().foo[0]);

    const u = store(10, shallowClone);
    assert.equal(10, u.get());
})

run();