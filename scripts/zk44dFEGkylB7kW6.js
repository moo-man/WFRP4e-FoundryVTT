        let modifier; let target = args.data.targets[0]
        if (target.actor.details.size.value == "tiny")
            modifier = 30
        if (target.actor.details.size.value == "ltl")
            modifier = 20
        if (target.actor.details.size.value == "sml")
            modifier = 10
	
        args.fields.modifier += (modifier || 0); // Offset size modifier 