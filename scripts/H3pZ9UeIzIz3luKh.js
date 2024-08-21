args.actor.addCondition("bleeding")

this.actor.setFlag("wfrp4e", "isAttached", args.actor.name)

this.script.message(`Attaches to <strong>${args.actor.name}</strong>`)