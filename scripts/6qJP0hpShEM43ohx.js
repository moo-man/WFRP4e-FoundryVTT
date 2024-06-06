const actor = args.actor;

if (actor.itemTypes.skill.find(s => s.name === "Lore (Oceans)")) {
  const loreTest = await actor.setupSkill('Lore (Oceans)',  {
    appendTitle: ` – ${this.effect.name}`,
    skipTargets: true,
    fields: {difficulty: 'hard'},
    characteristic: 'int',
  });
  await loreTest.roll();

  if (loreTest.succeeded) {
    loreTest.result.other.push(`<b>${actor.name}</b> recognizes lure of the Leviathan.`);
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
  test.result.other.push(`<b>${actor.name}</b> became @Condition[Stunned] by the sight.`);
  test.renderRollCard();
  actor.addCondition("stunned");
}