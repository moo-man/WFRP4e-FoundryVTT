if (args.test.characteristicKey == "wp" && args.test.failed && args.test.result.SL <= -3)
{
    this.script.scriptNotification("Adding Prone");
    this.actor.addCondition("prone")
}