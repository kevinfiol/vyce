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

    const combined = computed(() => {
        return s() + t();
    });

    assert.equal(combined(), 30);

    s(40);
    assert.equal(combined(), 60);

    t(10);
    assert.equal(combined(), 50);

    const second = computed(() => {
        return combined() + t();
    });

    assert.equal(second(), 60);

    t.end(); // detach all subscribers
    t(100);
    assert.equal(combined(), 50); // combined is no longer subbed to t

    // second is also no longer subbed to t
    assert.equal(second(), 60);
});

test('computed with many stores', () => {
    const s = store({ num: 10 });
    const t = computed(() => ({ ...s(), num: s().num + 10 }));
    const u = computed(() => ({ ...t(), num: t().num * 2 }));

    assert.deepEqual(s(), { num: 10 });
    assert.deepEqual(t(), { num: 20 });
    assert.deepEqual(u(), { num: 40 });

    s(prev => ({ ...prev, num: prev.num * 10 }));
    assert.deepEqual(s(), { num: 100 });
    assert.deepEqual(t(), { num: 110 });
    assert.deepEqual(u(), { num: 220 });

    let noOfTimesComputedFnRan = 0;
    const foo = computed(() => {
        noOfTimesComputedFnRan += 1;
        return s().num + t().num + u().num;
    });

    // computed function should only run ONCE to get initial calculation
    assert.equal(noOfTimesComputedFnRan, 1);
    assert.equal(foo(), 430);
});

test('store.end test 2', () => {
    const foo = store(10);
    const bar = store(20);

    const rum = computed(() => foo() + bar()); // 30
    const ham = computed(() => rum() + bar()); // 50

    assert.equal(rum(), 30);
    assert.equal(ham(), 50);

    rum.end(); // breaks all listeners (ham)

    foo(20);
    // since foo -> rum -/> ham, ham does not update, but rum does
    assert.equal(ham(), 50);
    assert.equal(rum(), 40);

    // will update ham, and ham will *see* the latest rum value
    bar(100);
    assert.equal(ham(), bar() + rum());
});

test('detect circular dependencies', () => {
    let error = false;
    const a = store(10);

    const b = computed(() => a() + 10);

    try {
        const c = computed(() => a(b()));
    } catch (e) {
        error = true;
    }

    assert.ok(error);
});

run();