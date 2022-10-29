let comps = [],
    defaultClone = v => {
      let out = v,
          k,
          tmp,
          setProp = _ => out[k] = (tmp = v[k]) && typeof tmp === 'object' ? defaultClone(tmp) : tmp;

      if (Array.isArray(v)) {
        out = [], k = v.length;
        while (k--) setProp();
      }

      if (v && Object.getPrototypeOf(v) === Object.prototype) {
        out = {};
        for (k in v) setProp();
      }

      return out;
    },
    clone = defaultClone;

store.setClone = f => clone = f || defaultClone;

export function store(init) {
  let x = init,
      subs = [],
      $ = function (y) {
        if (!arguments.length) {
          let comp = comps[comps.length - 1];
          comp && $.sub(comp, false);
          return clone(x);
        }

        if (y !== x) {
          x = typeof y === 'function' ? y(clone(x)) : y;
          let z = clone(x);
          for (let i = 0; i < subs.length; i++) subs[i](z);
        }
      };

  $.sub = (f, run = true) => {
    run && f(clone(x));
    !~subs.indexOf(f) && subs.push(f);
    return _ => {
      let idx = subs.indexOf(f);
      if (~idx) subs.splice(idx, 1);
    };
  };

  $.end = _ => subs = [];

  return $;
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