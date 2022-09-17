import { suite, run } from 'flitch';
import { strict as assert } from 'assert';
import { store, computed } from './dist/vyce.js';

const test = suite('Vyce Tests');

test('store get and set with primitives', () => {
    const s = store(1);

    // init
    assert.equal(s(), 1);

    s(2);
    assert.equal(s(), 2);

    s(p => p + 1);
    assert.equal(s(), 3);
});

test('store get and set with object', () => {
    const s = store({});

    // init
    assert.deepEqual(s(), {});

    s({ a: 2 });
    assert.deepEqual(s(), { a: 2 });

    s(p => ({...p, b: 3}));
    assert.deepEqual(s(), { a: 2, b: 3 });

    s(p => {
        p.a = 4;
        delete p.b;
        return p;
    });

    assert.deepEqual(s(), { a: 4 });
});

test('store get and set with array', () => {
    const s = store([]);

    assert.deepEqual(s(), []);

    s([1, 2, 3]);
    assert.deepEqual(s(), [1, 2, 3]);

    s(p => [...p, 4, 5]);
    assert.deepEqual(s(), [1, 2, 3, 4, 5]);

    s(p => {
        p.pop();
        p[0] = 'a';
        return p;
    });
    assert.deepEqual(s(), ['a', 2, 3, 4]);
});

test('store get and set with null and undefined', () => {
    const s = store();
    assert.equal(s(), undefined);

    s(10);
    s();
    assert.equal(s(), 10);

    s(undefined)
    assert.equal(s(), undefined);

    s(null);
    assert.equal(s(), null);
});

test('subscriptions', () => {
    const s = store({ a: 2 });
    let watching;

    let unsub = s.sub(v => watching = v); // should execute initially
    assert.deepEqual(watching, { a: 2 });

    s(p => ({ ...p, b: 3 }));
    assert.deepEqual(watching, { a: 2, b: 3 });

    unsub();
    s({ c: 10 });
    assert.deepEqual(s(), { c: 10 });
    assert.deepEqual(watching, { a: 2, b: 3 });
});

test('subscriptions with initial calculation disabled', () => {
    const s = store({ a: 2 });
    let watching;

    let unsub = s.sub(v => watching = v, false); // should not execute
    assert.equal(watching, undefined);

    s(p => ({ ...p, b: 3 }));
    assert.deepEqual(watching, { a: 2, b: 3 });

    unsub();
    s({ c: 10 });
    assert.deepEqual(watching, { a: 2, b: 3 });
});

test('computed utility', () => {
    const s = store(10);
    const t = store(20);

    const combined = computed([s, t], (first, second) => {
        return first + second;
    });

    assert.equal(combined(), 30);

    s(40);
    assert.equal(combined(), 60);

    t(10);
    assert.equal(combined(), 50);

    const second = computed([combined, t], (first, second) => {
        return first + second;
    });

    assert.equal(second(), 60);

    combined.end();
    t(100);
    assert.equal(combined(), 50); // combined is no longer subbed to t

    combined(0);
    // since combined broke all subs, it didn't update combined when we set to 0
    // however, t is still sending updates to second
    assert.equal(second(), 150);
});

test('computed with many stores', () => {
    const s = store({ num: 10 });
    const t = computed([s], x => ({ ...x, num: x.num + 10 }));
    const u = computed([t], x => ({ ...x, num: x.num * 2 }));

    assert.deepEqual(s(), { num: 10 });
    assert.deepEqual(t(), { num: 20 });
    assert.deepEqual(u(), { num: 40 });

    s(prev => ({ ...prev, num: prev.num * 10 }));
    assert.deepEqual(s(), { num: 100 });
    assert.deepEqual(t(), { num: 110 });
    assert.deepEqual(u(), { num: 220 });

    let noOfTimesComputedFnRan = 0;
    const foo = computed([s, t, u], (x, y, z) => {
        noOfTimesComputedFnRan += 1;
        return x.num + y.num + z.num;
    });

    // computed function should only run ONCE to get initial calculation
    assert.equal(noOfTimesComputedFnRan, 1);
    assert.equal(foo(), 430);
});

test('defaultClone utility', () => {
    const s = store({ boxes: { a: { v: 10 }, b: { v: 20 } } });
    let tmp = s();

    assert.notEqual(tmp, s());
    assert.notEqual(tmp.boxes, s().boxes);
    assert.notEqual(tmp.boxes.a, s().boxes.a);
    assert.deepEqual(tmp, s());

    // test setting
    s(prev => {
        prev.boxes.a.v = 20;
        assert.notEqual(s().boxes.a.v, 20);
        return prev;
    });

    assert.equal(s().boxes.a.v, 20);

    // test subs
    s.sub((current) => {
        // current should !== s() on every sub call
        current.boxes.a.v = 100;
        assert.notEqual(s(), current);
        assert.notEqual(s().boxes.a, current.boxes.a);
    });

    s(s());

    assert.equal(s().boxes.a.v, 20);
});

test('using a custom clone utility', () => {
    // this clone utility... doesn't clone at all! it just returns the same reference
    const s = store({ boxes: { a: { v: 10 } } }, (x) => x);
    let tmp = s();

    // in this case, the references should be equal
    assert.equal(tmp, s());
    assert.equal(tmp.boxes, s().boxes);
    assert.equal(tmp.boxes.a, s().boxes.a);

    // this clone is just a shallow copy of objects and arrays
    const shallowClone = x => {
        if (Array.isArray(x)) return [...x];
        if (x && Object.getPrototypeOf(x) == Object.prototype) return {...x};
        return x;
    };

    const t = store({ boxes: { a: { v: 10 } }, foo: [{ b: 20 }] }, shallowClone);

    tmp = t();
    assert.notEqual(tmp, t()); // only the top level obj is cloned
    assert.equal(tmp.boxes, t().boxes);
    assert.equal(tmp.foo, t().foo);
    assert.equal(tmp.foo[0], t().foo[0]);

    const u = store(10, shallowClone);
    assert.equal(10, u());
});

test('should not update if strictly equal', () => {
    let count = 0;

    const s = store(0);
    s.sub(() => count += 1);

    assert.equal(count, 1);
    s(0);
    assert.equal(count, 1);
    s(1);
    assert.equal(count, 2);
});

run();