if (this.actor.has(game.i18n.localize("NAME.Undead")) && this.actor.has(game.i18n.localize("NAME.Ethereal")))
{
    this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {skipTargets: true, appendTitle :  " - " + this.effect.name}).then(async test => {
           await test.roll();
           if(test.failed)
               this.actor.addCondition("stunned")
    })
}