if (Number(this.actor.system.details.age.value) > 870) {
  if (["t", "i", "fel"].includes(args.characteristic))
    args.fields.slBonus -=  3;
  if (["ws", "bs", "s"].includes(args.characteristic))
    args.fields.slBonus -=  2;
} else if (Number(this.actor.system.details.age.value) > 350) {
  if (["t", "i"].includes(args.characteristic))
    args.fields.slBonus -=  2;
  if (["fel"].includes(args.characteristic))
    args.fields.slBonus -=  1;
} else {
  if (["t", "i"].includes(args.characteristic))
    args.fields.slBonus -=  1;
}