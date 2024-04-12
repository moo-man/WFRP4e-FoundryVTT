  if (["orc", "ork", "goblin", "hobgoblin", "snotling", "greenskin"].includes(args.opposedTest.defender.details.species.value.toLowerCase()))
    {
      args.addImpact = true
      args.opposedTest.result.other.push("<b>Rune of Goblin Bane</b>: Impact Added")
    }