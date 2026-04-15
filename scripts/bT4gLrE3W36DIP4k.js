if (args.applyAP && args.modifiers.ap.metal && args.alreadyPenetrating) 
  {
      args.modifiers.ap.ignored += 1
      args.modifiers.ap.details.push("<strong>" + this.effect.name + "</strong>: Ignore +1 Metal Armour");
      args.modifiers.ap.metal--;
  }