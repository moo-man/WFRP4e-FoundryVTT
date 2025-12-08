let addWounds = 0
switch (args.actor.system.details.size.value) {
  case "lrg": 
      addWounds = 5
      break
  case "enor":
      addWounds = 10
      break
  case "mnst":
      addWounds = 15
      break
}
if (addWounds > 0) {
  args.modifiers.other.push({label : this.effect.name, details : "Damage Increase", value : addWounds})
}