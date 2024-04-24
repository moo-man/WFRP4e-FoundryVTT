let fatigued = args.actor.hasCondition("fatigued")
if (fatigued)
    setProperty(fatigued, "flags.wfrp4e.scriptData", getProperty(fatigued, "flags.wfrp4e.scriptData").filter(s => s.trigger != "dialog"))