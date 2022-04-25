let arr = Array.isArray,
    obj = x => x != null && typeof x == 'object',
    freeze = Object.freeze,
    count = 1,
    deps = {},
    get = x => arr(x) ? freeze([...x]) : obj(x) ? freeze({...x}) : x;

export function store(init) {
  let $,
      x = get(init),
      id = count,
      subs = [];

  return $ = {
    get: _ => get(x),
    listen: f => subs.push(f) && (() => subs = subs.filter(g => g != f)),
    sub: f => (f(x) || 1) && $.listen(f),
    set: (y = x) => {
      x = typeof y == 'function' ? y(x) : y;
      subs.map(f => f(x));
    },
    end: _ => {
      subs = [];
      deps[id] && (deps[id].map(u => u()), delete deps[id]);
    }
  };
};

export function computed(xs, f) {
  let comb = store(),
      calc = _ => f(...xs.map(x => x.get()));
  deps[count++] = [];
  xs.map(x =>
    deps[count-1].push(
      x.sub(_ => comb.set(calc()))
    )
  );
  return comb;
};
