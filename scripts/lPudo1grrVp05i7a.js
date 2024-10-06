let loc = Math.floor(CONFIG.Dice.randomUniform() * 2) == 0 ? "head" : "body"
let damage = this.actor.system.characteristics.s.bonus + 6

    this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {skipTargets: true, appendTitle :  " - " + this.effect.name}).then(async test => {
           await test.roll();
           if(test.failed)
           {
               await this.actor.addCondition("stunned")
               this.script.message(await this.actor.applyBasicDamage(damage, {loc, damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP, suppressMsg: true}))
           }
    })