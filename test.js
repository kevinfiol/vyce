import test from 'fantestic';
import { store, combine } from './dist/vyce.js';

test('store get and set', () => {
    const s = store(1);
    s.set(2);
    return [s.get(), 2];
});
