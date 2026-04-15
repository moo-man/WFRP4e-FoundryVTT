if (game.combat.combatant?.actor?.uuid == this.actor.uuid)
{
  
this.script.message(await this.actor.applyBasicDamage(2, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg : true}))
}