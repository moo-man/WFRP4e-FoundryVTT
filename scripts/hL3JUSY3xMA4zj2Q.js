if (this.sourceActor.uuid === this.actor.uuid) return;

const test = await this.actor.setupCharacteristic("t", {
  skipTargets: true, 
  appendTitle:  ` — ${this.effect.name}`, 
  fields: {
    difficulty: "difficult"
  },
  context: {
    success: "Is able to stand!",
    failure: "Fallen Prone!",
  }
});

await test.roll();
if (test.failure) {
  await this.actor.addCondition("prone");
}