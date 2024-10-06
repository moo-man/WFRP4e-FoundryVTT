let fatigued = args.actor.hasCondition("fatigued")
if (fatigued)
{
    fatigued.system.scriptData = fatigued.system.scriptData.filter(s => s.trigger != "dialog")
    fatigued.system._scripts = null;
}