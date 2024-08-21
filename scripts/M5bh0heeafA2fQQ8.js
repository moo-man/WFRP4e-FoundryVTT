if (args.test.spell?.getFlag("wfrp4e", "boonOfTzeentch"))
{
    if (args.test.result.minormis || args.test.result.majormis || args.test.result.catastrophicmis)
    {
        this.script.message(`<strong>${this.effect.name}</strong> quits your mind in disgust and erases itself from your grimoire!`)
        this.effect.sourceItem.delete();
    }
}