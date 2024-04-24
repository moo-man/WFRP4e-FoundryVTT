let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
await test.roll();
if (test.failed) 
{
    let add = 0

    if (test.result.roll % 11 == 0 || test.result.roll == 100) 
    {
        add = 1 // can't use isFumble if no hit location
    }

     await this.actor.addCondition("stunned", Math.max(1, Math.abs(test.result.SL)) + add)
     await this.actor.addCondition("blinded", Math.max(1, Math.abs(test.result.SL)))

}