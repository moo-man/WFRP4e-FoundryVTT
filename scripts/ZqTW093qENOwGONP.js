let msg = ""

let SL = parseInt(this.effect.sourceTest.result.SL);

for(let i = 0; i < SL; i++)
{
    msg += `<p>${await this.actor.applyBasicDamage(3, {suppressMsg : true, damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP})}</p>`
}

this.script.message(msg);