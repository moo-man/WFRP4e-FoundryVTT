if (this.actor.hasCondition("entangled"))
{
     this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {fields : {difficulty : "average"}}).then(async test => {
        await test.roll();
        if (test.failed)
             this.actor.addCondition("fatigued")    
     })
}