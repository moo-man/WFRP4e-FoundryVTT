this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`, fields: {difficulty : "average"}}).then(async test =>
{
     await test.roll()
     if (test.failed)
     {
         let char = Math.ceil(CONFIG.Dice.randomUniform() * 2) == 2 ? "s" : "t";
         this.script.message(`<strong>${this.actor.name}</strong> lost 1 point of ${game.wfrp4e.config.characteristics[char]}`)
         this.actor.update({[`system.characteristics.${char}.initial`] : this.actor.system.characteristics[char].initial - 1})
     }
})