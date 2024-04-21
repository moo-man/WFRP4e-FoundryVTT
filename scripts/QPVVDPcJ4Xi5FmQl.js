if(this.actor.hasCondition("fatigued") && args.opposedTest.result.hitloc.value == "head" && (args.opposedTest.attackerTest.result.critical || args.actor.status.wounds.value - args.totalWoundLoss < 0))
{
    let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), { fields: { difficulty: "average" }, skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
    await test.roll();
    if (test.failed)
    {
        this.actor.addCondition("unconscious")
    }
}