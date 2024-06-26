let fatigued = args.actor.hasCondition("fatigued")
if (fatigued)
    foundry.utils.setProperty(fatigued, "flags.wfrp4e.scriptData", foundry.utils.getProperty(fatigued, "flags.wfrp4e.scriptData").filter(s => s.trigger != "dialog"))