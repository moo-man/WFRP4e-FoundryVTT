const actor = args.actor;

if (actor.itemTypes.skill.find(s => s.name === "Lore (Riverways)")) {
  const loreTest = await actor.setupSkill('Lore (Riverways)',  {
    appendTitle: ` – ${this.effect.name}`,
    skipTargets: true,
    fields: {difficulty: 'hard'},
    characteristic: 'int',
  });
  await loreTest.roll();

  if (loreTest.succeeded) {
    loreTest.result.other.push(`<b>${actor.name}</b> recognizes lures of Lurkerfish.`);
    loreTest.renderRollCard();
    return;
  } 
}

let test = await actor.setupSkill('Cool',  {
  appendTitle: ` – ${this.effect.name}`,
  skipTargets: true,
  fields: {difficulty: 'easy'},
  characteristic: 'wp',
});
await test.roll();

if (!test.succeeded) {
  test.result.other.push(`<b>${actor.name}</b> became beguiled by the sight and unable to perform any action except moving towards the light.`);
  test.renderRollCard();
  actor.addCondition("unconscious");
}