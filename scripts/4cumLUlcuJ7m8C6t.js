let item = args.actor.items.find(i => i.name.includes("Smoothing"));
let smoothing = item?.effects.find(e => e.name === "Smoothing");
if (smoothing)
  smoothing.disabled = true;