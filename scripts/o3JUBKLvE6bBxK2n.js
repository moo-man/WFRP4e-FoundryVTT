let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), { fields: { difficulty: "average" } })
await test.roll();
if (test.failed) 
{
    await this.actor.addCondition("prone")
    let injury = await fromUuid("Compendium.wfrp4e-core.items.ZhMADOqoo0y8Q9bx");
    injury = injury.toObject()
    let toes = Math.clamp(Math.abs(test.result.SL) + 1, 1, 5)
    injury.system.location.key = this.item.system.location.key[0] + injury.system.location.value
    if (injury.system.location.key[0] == "r")
    {
        injury.system.location.value = `${toes} Right ${injury.system.location.value}s`
    }
    else if (injury.system.location.key[0] == "l")
    {
        injury.system.location.value = `${toes} Left ${injury.system.location.value}s`
    }
    foundry.utils.setProperty(injury, "system.wfrp4e.count", toes)
    this.actor.createEmbeddedDocuments("Item", [injury])
}