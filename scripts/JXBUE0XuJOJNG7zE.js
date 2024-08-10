if (args.totalWoundLoss <= 7) return;

let options = {
  appendTitle : " – " + this.effect.name,
  skipTargets: true,
  fields: {difficulty: 'average'},
  characteristic: 'wp',
}

let test = await args.actor.setupSkill('Cool', options);
await test.roll();

if (!test.succeeded) {
  const targetId = this.effect.getFlag("wfrp4e", "target");
  const target = canvas.scene.tokens.get(targetId);
  await this.effect.delete();
  args.extraMessages.push(`<b>${args.actor.name}</b> lost ${args.totalWoundLoss} Wounds to an attack, which caused it to let go of <b>${target.name}</b>.`);
}