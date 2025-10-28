if (args.test.isCritical && args.test.weapon.properties?.qualities?.impale) {
  let targets = args.test.targets.filter(t => t.system.details.move.value > 1);
  if (targets.length > 0) {
    targets.forEach(target => {
      target.applyEffect({effectData : [this.item.effects.contents[1].convertToApplied()]})
    });
    args.test.result.other.push (`<strong>${this.effect.name}:</strong> Target Move Reduced by 1`)
  }
}