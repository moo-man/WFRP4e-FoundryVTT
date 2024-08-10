let test = await this.actor.setupSkill('Endurance',  {
  appendTitle: ` – ${this.effect.name}`,
  skipTargets: true,
  fields: {difficulty: 'easy'},
  characteristic: 't',
  context: {failure: "Mast shattered!"}
});
await test.roll();

if (test.failed) {
  let crit = await fromUuid("Item.d4bCnR1zINTNF9VC");
  await this.actor.createEmbeddedDocuments("Item", [crit]);
  this.effect.update({disabled: true});
}