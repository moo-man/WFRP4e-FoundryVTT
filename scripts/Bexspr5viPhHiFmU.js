let fatigued = this.actor.hasCondition("fatigued");
let value = fatigued?.conditionValue || 0;
args.fields.modifier += value * 10;