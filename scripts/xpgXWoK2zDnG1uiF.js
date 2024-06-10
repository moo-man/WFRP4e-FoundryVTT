let stunned = args.actor.hasCondition("stunned")
if (stunned)
   foundry.utils.setProperty(stunned, "flags.wfrp4e.scriptData", foundry.utils.getProperty(stunned, "flags.wfrp4e.scriptData").filter(s => s.trigger != "dialog"))

let poisoned= args.actor.hasCondition("poisoned")
if (poisoned)
    foundry.utils.setProperty(poisoned, "flags.wfrp4e.scriptData", foundry.utils.getProperty(poisoned, "flags.wfrp4e.scriptData").filter(s => s.trigger != "dialog"))

let deafened = args.actor.hasCondition("deafened")
if (deafened)
    foundry.utils.setProperty(deafened, "flags.wfrp4e.scriptData", foundry.utils.getProperty(deafened, "flags.wfrp4e.scriptData").filter(s => s.trigger != "dialog"))

let entangled = args.actor.hasCondition("entangled")
if (entangled)
    foundry.utils.setProperty(entangled, "flags.wfrp4e.scriptData", foundry.utils.getProperty(entangled, "flags.wfrp4e.scriptData").filter(s => s.trigger != "dialog"))

let fatigued = args.actor.hasCondition("fatigued")
if (fatigued)
    foundry.utils.setProperty(fatigued, "flags.wfrp4e.scriptData", foundry.utils.getProperty(fatigued, "flags.wfrp4e.scriptData").filter(s => s.trigger != "dialog"))

let blinded = args.actor.hasCondition("blinded")
if (blinded)
    foundry.utils.setProperty(blinded, "flags.wfrp4e.scriptData", foundry.utils.getProperty(blinded, "flags.wfrp4e.scriptData").filter(s => s.trigger != "dialog"))

let broken = args.actor.hasCondition("broken")
if (broken)
    foundry.utils.setProperty(broken, "flags.wfrp4e.scriptData", foundry.utils.getProperty(broken, "flags.wfrp4e.scriptData").filter(s => s.trigger != "dialog"))

let prone= args.actor.hasCondition("prone")
if (prone)
    foundry.utils.setProperty(prone, "flags.wfrp4e.scriptData", foundry.utils.getProperty(prone, "flags.wfrp4e.scriptData").filter(s => s.trigger != "dialog"))