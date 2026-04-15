if (args.totalWoundLoss > 0)
{
    let test = await args.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
    await test.roll();
    if (test.failed && parseInt(args.sourceTest?.result.SL) > 0)
    {
        args.actor.addCondition("stunned", parseInt(args.sourceTest?.attackerTest.result.SL))
    }
}   