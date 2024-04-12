let test = await args.actor.setupCharacteristic("wp", {appendTitle : " - " + this.effect.name, context : {failure: "Gained a Stunned Condition"}})
await test.roll();
if (test.failed)
{
    args.actor.addCondition("stunned")
}

