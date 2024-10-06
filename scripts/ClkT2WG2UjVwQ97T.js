if (args.actor.has("Daemonic")) {
  args.totalWoundLoss += 3;
  args.modifiers.other.push({label: this.effect.name, value: 3});
}

let test = await args.actor.setupSkill("Endurance", {
  appendTitle: ` – ${this.effect.name}`,
  skipTargets: true,
  characteristic: 't',
  context: {
    failure: "Received 1 Blinded Condition"
  }
});
await test.roll();

if (test.failed) {
  args.actor.addCondition("blinded");
}