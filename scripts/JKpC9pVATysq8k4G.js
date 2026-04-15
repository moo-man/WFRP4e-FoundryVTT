let damage = this.effect.sourceItem.system.Damage;
const flying = this.actor.has(game.i18n.localize("NAME.Flight"));

if (flying) damage++;

await this.actor.applyDamage(damage, {
  loc: "roll",
  createMessage: this.script.getChatData(),
});

const test = await this.actor.setupSkill(
  game.i18n.localize("NAME.Athletics"),
  {
    fields: {
      slBonus: flying ? -1 : 0,
      difficulty: "average"
    },
    skipTargets: true,
    appendTitle: ` — ${this.effect.name}`,
  },
);

await test.roll();

this.effect.setFlag("wfrp4e", "failed", !!test.failed);