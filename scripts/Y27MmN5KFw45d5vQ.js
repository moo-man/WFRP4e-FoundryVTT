let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {difficulty: "challenging"})
await test.roll();
if (!test.succeeded)
{   
    let rollResult = await (await fromUuid("RollTable.GL7rKOEThauPUK0E")).roll({allowInteractive : false});
    let disease = await fromUuid(rollResult.results[0].documentUuid);
    obj = disease.toObject();
    this.actor.createEmbeddedDocuments("Item", [obj]);
}