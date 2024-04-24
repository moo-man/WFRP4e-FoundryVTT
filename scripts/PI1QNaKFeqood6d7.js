if (args.attackerTest.weapon && args.defenderTest.weapon)
{

   let attackerReach = game.wfrp4e.config.reachNum[args.attackerTest.weapon.reach.value]
   let defenderReach = game.wfrp4e.config.reachNum[args.defenderTest.weapon.reach.value]
   
   if (attackerReach == defenderReach)
      attackerReach = attackerReach < 7 ? attackerReach + 1 : attackerReach

   attackerReach = game.wfrp4e.utility.findKey(attackerReach, game.wfrp4e.config.reachNum)
   defenderReach = game.wfrp4e.utility.findKey(defenderReach, game.wfrp4e.config.reachNum)

  args.attackerTest.weapon.reach.value = attackerReach
  args.defenderTest.weapon.reach.value = defenderReach
}