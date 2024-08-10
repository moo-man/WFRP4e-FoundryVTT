if (isNaN(parseInt(this.item.system.specification.value)))
{
    let value = await ValueDialog.create("Enter Fear value", this.item.name);
    if (value)
    {
     this.item.updateSource({"system.specification.value" : value});
    }
}