const ablaze = Number(args.opposedTest.result.differenceSL) + 1
args.actor.addCondition("ablaze", ablaze)
args.extraMessages.push(
  "<strong>" + this.effect.name + "</strong>: "
  + ablaze + " @Condition[Ablaze] Conditions")