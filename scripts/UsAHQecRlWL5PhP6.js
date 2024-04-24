this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`, fields: {difficulty : "average"}}).then(async test =>
{
     await test.roll()
     if (test.failed)
     {
         this.actor.corruptionDialog("moderate")    
     }
})