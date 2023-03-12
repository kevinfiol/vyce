let comps = [],
  isFn = x => typeof x === 'function';

export function store(init) {
  let x = init,
      subs = [],
      todo = [],
      queue = calc => isFn(calc) ? (todo.push(calc)) : (todo = [calc]),
      runQueue = _ => {
        let i, tmp;

        for (i = 0; i < todo.length; i++) {
          tmp = todo[i];
          x = isFn(tmp) ? tmp(x) : tmp;
        }

        if (todo.length) todo = [];
      },
      $store = function (y) {
        if (!arguments.length) {
          let comp = comps[comps.length - 1];
          comp && $store.sub(comp, false);
          runQueue();
          return x;
        }

        queue(y);
        if (subs.length) runQueue();
        for (let i = 0; i < subs.length; i++) subs[i](x);
      };

  $store.sub = (f, run = true) => {
    run && f(x);
    !~subs.indexOf(f) && subs.push(f);
    return _ => {
      let idx = subs.indexOf(f);
      if (~idx) subs.splice(idx, 1);
    };
  };

  $store.end = _ => subs = [];

  return $store;
};

export function computed(f) {
  let comb = store(),
      calc = _ => {
        if (~comps.indexOf(calc)) throw Error('Circular Dependency');
        comps.push(calc);
        comb(f());
        comps.pop();
      };

  calc();
  return comb;
};