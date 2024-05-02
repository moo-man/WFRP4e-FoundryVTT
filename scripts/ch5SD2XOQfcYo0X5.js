if (args.sizeDiff <= -2 && args.opposedTest.attackerTest.result.critical)
        args.damageMultiplier = Math.abs(args.sizeDiff)

      let sBonusDiff = args.opposedTest.defenderTest.actor.characteristics.t.bonus - args.opposedTest.attackerTest.actor.characteristics.s.bonus
     let weapon = args.opposedTest.attackerTest.item
      if (sBonusDiff > 0 && weapon && weapon.damage.value.includes("SB"))
      {
        args.damage += sBonusDiff
        args.breakdown.other.push({label : this.effect.name, value : sBonusDiff});
      }