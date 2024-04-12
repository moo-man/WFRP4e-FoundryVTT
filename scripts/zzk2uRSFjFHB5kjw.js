
   let roll = Math.ceil(CONFIG.Dice.randomUniform() * 10)
   if (args.test.isFumble && roll == 1 && !args.test.result.misfire)
  {
          args.test.result.misfire = game.i18n.localize("Misfire") + " (Rolled 1)"
          args.test.result.misfireDamage = eval(parseInt(args.test.result.roll.toString().split('').pop()) + args.test.item.Damage)
  }
  else if (args.test.isFumble && roll != 1)
      args.test.result.other.push("Misfire Roll: " + roll)