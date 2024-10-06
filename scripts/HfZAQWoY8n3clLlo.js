if (!args.itemCreated) return;
if (args.itemCreated.type !== "critical") return;
if (args.itemCreated.system.location.value.toLowerCase() !== "head") return;
if (Number(args.itemCreated.system.wounds.value) > 0) {
  this.script.message(game.i18n.format("SCRIPT.Sallet", {name: args.itemCreated.parent.name, wounds: args.itemCreated.system.wounds.value}))
}