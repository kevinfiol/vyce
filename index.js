export const store = init => {
  let x = init;
  let subs = [];
  let unsubs = [];

  return {
    get: _ => x,
    sub: f => subs.push(f) && (() => subs = subs.filter(g => g != f)),
    dep: unsub => unsubs.push(unsub),
    set: (y = x) => {
      x = typeof y == 'function' ? y(x) : y;
      subs.map(f => f(x));
    },
    end: () => {
      subs = [];
      unsubs.map(u => !u());
      unsubs = [];
      x = undefined;
    }
  };
};

export const combine = (f, xs) => {
  let calc = _ => f(...xs);
  let rec = s(calc());
  xs.map(x =>
    rec.dep(
      x.sub(v => rec.set(calc()))
    )
  );
  return rec;
};
