if (args.totalWoundLoss > args.actor.characteristics.t.bonus)
{
  args.actor.setupSkill(game.i18n.localize("NAME.Endurance")).then(async test => {
    await test.roll()
    if (test.failed) {
      let disease = await fromUuid("Compendium.wfrp4e-core.items.M8XyRs9DN12XsFTQ")
      disease = disease.toObject()
      disease.system.duration.active = true
      args.actor.createEmbeddedDocuments("Item", [disease])
    }
  })
}