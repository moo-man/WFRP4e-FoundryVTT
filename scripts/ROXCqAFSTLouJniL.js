if (args.test.spell.name == "Warp Lightning")
{
    if (args.test.result.minormis || args.test.result.majormis || args.test.result.catastrophicmis)
    {
        this.script.scriptMessage(`<strong>${this.item.name}</strong> Overloads!`)
    }
}