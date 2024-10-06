let broken = this.actor.hasCondition("broken");
let item = await fromUuid("Compendium.wfrp4e-core.items.Item.IAWyzDfC286a9MPz");

if (broken && !broken.getFlag("wfrp4e", "blasted-mind") && !this.actor.has(item.name))
{
    await broken.delete();
    this.actor.createEmbeddedDocuments("Item", [item], {fromEffect: this.effect.id})
    this.script.notification(`Removed ${broken.name}, added ${item.name} (${Math.ceil(CONFIG.Dice.randomUniform() * 10)} Rounds)`)
}