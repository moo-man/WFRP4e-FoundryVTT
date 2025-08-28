if (getProperty(args.data, "system.loaded.value") == true)
{
    let repeaterValue = Math.ceil(CONFIG.Dice.randomUniform() * 10);
    let qualities = foundry.utils.deepClone(this.item.system.qualities.value);
    let repeater = qualities.find(i => i.name == "repeater")
    if (repeater)
    {
        repeater.value = repeaterValue
    }
    else 
    {
        qualities.push({name : "repeater", value : repeaterValue})
    }
    foundry.utils.setProperty(args.data, "system.loaded.amt", repeaterValue)
    this.item.update({"system.qualities.value" : qualities});
    this.script.notification("Repeater " + repeaterValue);
}
else if (foundry.utils.getProperty(args.data, "system.loaded.value") == false)
{
   let qualities = foundry.utils.deepClone(this.item.system.qualities.value).filter(i => i.name != "repeater");
   this.item.update({"system.qualities.value" : qualities});
}