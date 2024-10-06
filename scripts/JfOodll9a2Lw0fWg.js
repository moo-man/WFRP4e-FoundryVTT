let blinded = args.actor.hasCondition("blinded")
if (blinded)
{
    blinded.system.scriptData = blinded.system.scriptData.filter(s => s.trigger != "dialog")
    blinded.system._scripts = null;
}