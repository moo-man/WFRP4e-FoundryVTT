if (args.opposedTest.attackerTest.trait.name === "Breath (Brimstone Fire)") {
  await args.actor.addCondition("ablaze");
  await args.actor.addCondition("blinded");
  await args.actor.addCondition("poisoned", 2);
}