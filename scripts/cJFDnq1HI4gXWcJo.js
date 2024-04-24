if (isNaN(parseInt(this.item.system.specification.value)))
{
    let value = await ValueDialog.create("Ward Value", "Enter the Ward value");
    if (value)
    {
     this.item.updateSource({"system.specification.value" : value});
    }
}