let count = 1,
    comps = [],
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
      subs = [],
      unsubs = [],
      $ = function (y) {
        if (!arguments.length) {
          let comp = comps[comps.length - 1];
          comp && unsubs.push($.sub(comp, false));
          return clone(x);
        }

        if (y !== x) {
          x = typeof y == 'function' ? y(clone(x)) : y;
          let z = clone(x);
          subs.map(f => f(z));
        }
      };

  $.sub = (f, run = count) => {
    run && f(clone(x));
    !~subs.indexOf(f) && subs.push(f);
    return _ => subs = subs.filter(g => g != f)
  };

  $.end = _ => {
    subs = [];
    unsubs.map(u => u());
  };

  return $;
};

export function computed(f) {
  let comb = store(),
      calc = _ => (comps.push(calc), comb(f()), comps.pop());
  calc();
  return comb;
};