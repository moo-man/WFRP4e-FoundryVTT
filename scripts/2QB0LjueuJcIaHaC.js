if (isNaN(parseInt(this.item.system.specification.value)))
{
    let value = this.item.specifier;
    if (!value)
    {
        value = await ValueDialog.create("Enter Armour value", this.effect.name);
    }
    if (value)
    {
        this.item.updateSource({"system.specification.value" : value, name : this.item.baseName});
    }
}