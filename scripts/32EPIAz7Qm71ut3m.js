if (Number(this.actor.system.details.age.value) > 870) {
  if (["t", "wp", "fel"].includes(args.characteristic))
    args.fields.slBonus -=  3;
  if (["ag", "dex", "int"].includes(args.characteristic))
    args.fields.slBonus -=  2;
} else if (Number(this.actor.system.details.age.value) > 350) {
  if (["t", "wp"].includes(args.characteristic))
    args.fields.slBonus -=  2;
  if (["fel"].includes(args.characteristic))
    args.fields.slBonus -=  1;
} else {
  if (["t", "wp"].includes(args.characteristic))
    args.fields.slBonus -=  1;
}