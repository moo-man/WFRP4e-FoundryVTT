this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {appendTitle : ` - ${this.effect.name}`}).then(async test =>
{
     await test.roll()
     if (test.failed)
     {
         this.actor.addCondition("fatigued")    
     }
})