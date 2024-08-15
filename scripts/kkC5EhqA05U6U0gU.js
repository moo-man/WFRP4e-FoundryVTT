let test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
await test.roll();

// Kind of insane but whatever
let opposedResult = test.opposedMessages[0]?.system.opposedHandler?.resultMessage?.system.opposedTest?.result

if (opposedResult?.winner == "attacker")
{
    if (opposedResult.differenceSL < 6)
    {
        this.actor.addCondition("fatigued", Math.floor(opposedResult.differenceSL / 2))
    }
    else if (opposedResult.differenceSL >= 6)
    {
        this.actor.addCondition("broken");
    }
}