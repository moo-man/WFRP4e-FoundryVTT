args.actor.addCondition("bleeding")

this.actor.setFlag("wfrp4e", "isAttached", args.actor.name)

this.script.scriptMessage(`Attaches to <strong>${args.actor.name}</strong>`)