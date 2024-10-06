    let stunned = args.actor.hasCondition("stunned")
    if (stunned)
    {
        stunned.system.scriptData = stunned.system.scriptData.filter(s => s.trigger != "dialog")
        stunned.system._scripts = null;
    }



    let poisoned = args.actor.hasCondition("poisoned")
    if (poisoned)
    {
        poisoned.system.scriptData = poisoned.system.scriptData.filter(s => s.trigger != "dialog")
        poisoned.system._scripts = null;
    }



    let deafened = args.actor.hasCondition("deafened")
    if (deafened)
    {
        deafened.system.scriptData = deafened.system.scriptData.filter(s => s.trigger != "dialog")
        deafened.system._scripts = null;
    }




    let entangled = args.actor.hasCondition("entangled")
    if (entangled)
    {
        entangled.system.scriptData = entangled.system.scriptData.filter(s => s.trigger != "dialog")
        entangled.system._scripts = null;
    }




    let fatigued = args.actor.hasCondition("fatigued")
    if (fatigued)
    {
        fatigued.system.scriptData = fatigued.system.scriptData.filter(s => s.trigger != "dialog")
        fatigued.system._scripts = null;
    }



    let blinded = args.actor.hasCondition("blinded")
    if (blinded)
    {
        blinded.system.scriptData = blinded.system.scriptData.filter(s => s.trigger != "dialog")
        blinded.system._scripts = null;
    }



    let broken = args.actor.hasCondition("broken")
    if (broken)
    {
        broken.system.scriptData = broken.system.scriptData.filter(s => s.trigger != "dialog")
        broken.system._scripts = null;
    }



    let prone = args.actor.hasCondition("prone")
    if (prone)
    {
        prone.system.scriptData = prone.system.scriptData.filter(s => s.trigger != "dialog")
        prone.system._scripts = null;
    }

