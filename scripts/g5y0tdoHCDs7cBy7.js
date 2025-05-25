return !["NAME.Endurance", "NAME.Cool"].map(i => game.i18n.localize(i)).includes(args.skill?.name) 
  || !this.actor.sameSideAs(this.effect.sourceActor)
  || this.actor.system.details.status.tier !== "b"