if (this.item.system.specification.value == "Size")
{
    let size = this.item.specifier;
    if (!size)
    {
        let choice = await ItemDialog.create(ItemDialog.objectToArray(game.wfrp4e.config.actorSizes, this.item.img), 1, "Choose Size");
        if (choice[0])
        {
            size = choice[0]?.name;
        }
    }
    this.item.updateSource({"system.specification.value" : size, name : this.item.baseName})
    this.effect.updateSource({name : this.effect.name + ` (${size})`})
}