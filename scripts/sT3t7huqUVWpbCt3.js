if (Number(this.actor.system.details.age.value) > 870) {
  args.fields.slBonus -= 4;
} else if (Number(this.actor.system.details.age.value) > 350) {
  args.fields.slBonus -= 3;
} else {
  args.fields.slBonus -= 2;
}