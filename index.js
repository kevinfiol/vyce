let count = 1,
    deps = {},
    defaultClone = v => {
      let out = v,
          k,
          tmp,
          setProp = _ => out[k] = (tmp=v[k]) && typeof tmp == 'object' ? defaultClone(tmp) : tmp;

      if (Array.isArray(v)) {
        out = [], k = v.length;
        while (k--) setProp();
      }

      if (v && Object.getPrototypeOf(v) == Object.prototype) {
        out = {};
        for (k in v) setProp();
      }

      return out;
    };

export function store(init, clone = defaultClone) {
  let x = init,
      id = count,
      subs = [];

  return {
    get: _ => clone(x),
    sub: (f, run = count) => (run && f(clone(x)), subs.push(f)) && (_ => subs = subs.filter(g => g != f)),
    set: y => {
      x = typeof y == 'function' ? y(clone(x)) : y;
      subs.map(f => f(x));
    },
    end: _ => {
      subs = [];
      deps[id] && (deps[id].map(u => u()), delete deps[id]);
    }
  };
};

export function computed(xs, f) {
  let calc = _ => f(...xs.map(x => x.get())),
      comb = store(calc());

  deps[count++] = [];

  xs.map(x =>
    deps[count-1].push(
      x.sub(_ => comb.set(calc()), false)
    )
  );

  return comb;
};