let items = this.effect.itemTargets;
let msg = "";
for(let item of items)
{
    if (item.system.properties.qualities.durable)
    {
        await item.update({"system.qualities.value" : []});
        msg += `<p>${item.name} loses all Qualities</p>`
    }
    else 
    {
        msg += `<p>${item.name} crumbles into dust!</p>` 
        await item.update({name : item.name + " (Dust)"})
    }
}
if(msg)
{
    this.script.message(msg);
}