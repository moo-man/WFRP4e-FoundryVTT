let stunned = args.actor.hasCondition("stunned")
if (stunned)
   setProperty(stunned, "flags.wfrp4e.scriptData", getProperty(stunned, "flags.wfrp4e.scriptData").filter(s => s.trigger != "dialog"))

let poisoned= args.actor.hasCondition("poisoned")
if (poisoned)
    setProperty(poisoned, "flags.wfrp4e.scriptData", getProperty(poisoned, "flags.wfrp4e.scriptData").filter(s => s.trigger != "dialog"))

let deafened = args.actor.hasCondition("deafened")
if (deafened)
    setProperty(deafened, "flags.wfrp4e.scriptData", getProperty(deafened, "flags.wfrp4e.scriptData").filter(s => s.trigger != "dialog"))

let entangled = args.actor.hasCondition("entangled")
if (entangled)
    setProperty(entangled, "flags.wfrp4e.scriptData", getProperty(entangled, "flags.wfrp4e.scriptData").filter(s => s.trigger != "dialog"))

let fatigued = args.actor.hasCondition("fatigued")
if (fatigued)
    setProperty(fatigued, "flags.wfrp4e.scriptData", getProperty(fatigued, "flags.wfrp4e.scriptData").filter(s => s.trigger != "dialog"))

let blinded = args.actor.hasCondition("blinded")
if (blinded)
    setProperty(blinded, "flags.wfrp4e.scriptData", getProperty(blinded, "flags.wfrp4e.scriptData").filter(s => s.trigger != "dialog"))

let broken = args.actor.hasCondition("broken")
if (broken)
    setProperty(broken, "flags.wfrp4e.scriptData", getProperty(broken, "flags.wfrp4e.scriptData").filter(s => s.trigger != "dialog"))

let prone= args.actor.hasCondition("prone")
if (prone)
    setProperty(prone, "flags.wfrp4e.scriptData", getProperty(prone, "flags.wfrp4e.scriptData").filter(s => s.trigger != "dialog"))