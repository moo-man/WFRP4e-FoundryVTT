const roll = new Roll("1d2")
await roll.evaluate()

if (roll.total == 1)
  args.fields.hitLocation = "lLeg"
else
  args.fields.hitLocation = "rLeg"

args.fields.modifier += 20;