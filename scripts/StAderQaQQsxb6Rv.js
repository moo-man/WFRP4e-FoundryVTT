let target = await game.wfrp4e.tables.rollTable("fixations")
if (target)
{
    this.script.notification(target.result);
    let hatred = this.actor.items.find(i => i.getFlag("wfrp4e", "fromEffect") == this.effect.id)
    if (hatred)
    {
        hatred.update({"system.specification.value" : target.result})
    }
}