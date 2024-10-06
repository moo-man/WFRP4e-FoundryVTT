let holed = this.actor.appliedEffects.filter(e => e.name.includes("Holed"));

for (let effect of holed) {
  await effect.update({name: effect.name.replace(/\d+/, rating => parseInt(rating) * 2)});
}

this.script.notification(`Holed Ratings of ${this.actor.name} have been doubled.`);