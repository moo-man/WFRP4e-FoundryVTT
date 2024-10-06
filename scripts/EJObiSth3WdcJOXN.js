if (args.test.characteristicKey == "wp" && args.test.failed && args.test.result.SL <= -3)
{
    this.script.notification("Adding Prone");
    this.actor.addCondition("prone")
}