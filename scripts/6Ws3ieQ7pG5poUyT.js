if (isNaN(parseInt(this.item.system.specification.value)))
{
    let value = await ValueDialog.create({text : "Enter Spellcasting Lore", title : this.effect.name}, "", Object.values(game.wfrp4e.config.magicLores));
    if (value)
    {
     this.item.updateSource({"system.specification.value" : value});
    }
}