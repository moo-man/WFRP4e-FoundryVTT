const bloodyFluxUUID = "Compendium.wfrp4e-core.items.Item.herUmN51D9TiL2Vn";

const test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {
  skipTargets: true,
  appendTitle: ` — ${this.effect.name}`,
  fields: {difficulty: "easy"},
  context: {
    success: `Butcher is healed.`,
    failure: `Butcher contracts @UUID[${bloodyFluxUUID}].`
  }
});

await test.roll();

if (test.failed) {
  await this.actor.addEffectItems(bloodyFluxUUID, this.effect);
} else {
  const SL = test.result.SL;
  const heal = 1 + SL;
  await this.actor.modifyWounds(heal);
  this.script.message(`Butcher healed ${heal} Wounds.`);
}