let damage = this.effect.sourceTest.result.damage;
        
let loc = "head"
let APatLoc = this.actor.system.status.armour[loc];

let metalAP = APatLoc.layers.reduce((metal, layer) => metal += (layer.metal ? layer.value : 0), 0)

let APused = Math.max(0, APatLoc.value - metalAP); // remove metal AP at location;

damage -= (APused + this.actor.system.characteristics.t.bonus)

let msg = await this.actor.applyBasicDamage(damage, {suppressMsg : true, damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL});
msg += ` (ignored ${metalAP} metal AP on ${game.wfrp4e.config.locations[loc]})`
this.script.message(msg)
