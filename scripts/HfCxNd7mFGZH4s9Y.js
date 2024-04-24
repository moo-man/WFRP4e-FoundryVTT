// An opponent that takes more than a single Wound from a Warp Blade strike 
// in melee combat must make an Average (+20) Endurance Test 
// or take a Stunned Condition


if (args.totalWoundLoss > 1) {
    let test = await args.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields : {difficulty : "average"}, skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
    await test.roll();
    if(test.failed)
    {
        await args.actor.addCondition("stunned");
    }
}