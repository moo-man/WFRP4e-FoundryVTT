if (this.actor.has("Undead") && this.actor.has("Ethereal"))
{
    this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {skipTargets: true, appendTitle :  " - " + this.effect.name}).then(async test => {
           await test.roll();
           if(test.failed)
               this.actor.addCondition("stunned")
    })
}