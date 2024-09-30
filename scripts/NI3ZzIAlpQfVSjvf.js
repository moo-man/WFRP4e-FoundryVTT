if (isNaN(parseInt(this.item.system.specification.value)))
{
    let value = await ValueDialog.create({text : "Enter Fear value", title : this.effect.name});
    if (value)
    {
     this.item.updateSource({"system.specification.value" : value});
    }
}