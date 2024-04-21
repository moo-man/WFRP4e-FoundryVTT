let SL = args.opposedTest.attackerTest.result.SL - args.opposedTest.attackerTest.item.cn.value
let difficulty = "challenging"
if (SL >= 1)
   difficulty = "difficult"
if (SL >= 2)
   difficulty = "hard"
if (SL >= 3)
   difficulty = "vhard"
   

let test = await args.actor.setupCharacteristic("wp", {fields: {difficulty}, skipTargets: true, appendTitle :  " - " + this.effect.name, context : {failure: "Gain a Stunned Condition"}})
await test.roll();
if (test.failed)
{
    args.actor.addCondition("stunned");
}