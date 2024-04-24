if (args.totalWoundLoss > 0)
{
    let test = await args.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {skipTargets: true, appendTitle :  " - " + this.effect.name})
    await test.roll();
    if (test.failed)
    {
        args.totalWoundLoss += 5;
        args.modifiers.other.push({label : this.effect.name, value : 5})
    }
}