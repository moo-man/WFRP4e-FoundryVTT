if (args.totalWoundLoss <= 0) return;

// Poisoned handled by Venom trait

const test = await args.actor.setupSkill(game.i18n.localize("NAME.Cool"), {
  skipTargets: true,
  appendTitle: ` — ${this.effect.name}`,
  fields: {difficulty: "average"},
  context: {
    failure: `Gained 1 Corruption.`
  }
});

await test.roll();

if (test.failed && args.actor.type === "character")
  args.actor.update({"system.status.corruption.value": args.actor.system.status.corruption.value + 1});


await args.actor.applyEffect({effects : this.item.effects.getName("Bite of the Purple Skullback")})