let {value} = this.effect.getFlag("wfrp4e-soc", "m4result") || {};

if (value === 0)
  args.actor.system.status.mood.value = 0;
else if (value !== undefined)
  args.actor.system.status.mood.value += value;