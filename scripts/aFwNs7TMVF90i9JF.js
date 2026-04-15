let tireless = this.item.Advances + 1
let fatigued = this.actor.hasCondition("fatigued").conditionValue
if (args.flags?.tireless == undefined) {
  args.fields.modifier += 10 * (Math.min(tireless, fatigued));
  args.flags.tireless = true
}