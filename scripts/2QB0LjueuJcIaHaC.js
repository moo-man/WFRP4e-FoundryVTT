if (isNaN(parseInt(this.item.system.specification.value)))
{
    let value = this.item.specifier;
    if (!value)
    {
        value = await ValueDialog.create({text : "Enter Armour value", title : this.effect.name});
    }
    if (value)
    {
        this.item.updateSource({"system.specification.value" : value, name : this.item.baseName});
    }
}