if (args.test.succeeded)
    return

if (args.test.characteristicKey == "wp")
     this.actor.addCondition("broken")