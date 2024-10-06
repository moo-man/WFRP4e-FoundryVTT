let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields : {difficulty : "difficult"}, appendTitle : ` - ${this.effect.name}`})
await test.roll();
if (!test.succeeded)
{
    let plague = await fromUuid("Compendium.wfrp4e-core.items.Item.aKiuGzlVO51JvsjV")
    let obj = plague.toObject();
    await this.actor.createEmbeddedDocuments("Item", [obj]);
}

this.effect.delete();