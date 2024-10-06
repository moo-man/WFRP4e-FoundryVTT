let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {difficulty: "difficult"})
  await test.roll();
  if (!test.succeeded)
  {
    await this.actor.addCondition("poisoned");
  }