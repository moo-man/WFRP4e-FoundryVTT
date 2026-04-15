if (args.totalWoundLoss <= 0) return;

const test = await this.actor.setupSkill(
  game.i18n.localize("NAME.Endurance"),
  {
    fields: {difficulty: "difficult"},
    skipTargets: true,
    appendTitle: ` — ${this.effect.name}`,
  },
);

await test.roll();

if (test.failed) {
  const item = await fromUuid("Compendium.wfrp4e-core.items.Item.kKccDTGzWzSXCBOb");
  const data = item.toObject();

  data.system.duration.active = true;

  args.actor.createEmbeddedDocuments("Item", [data]);
}