    let roll = await new Roll("1d10").roll();
    game.dice3d?.showForRoll(roll);
    this.script.message(await this.actor.applyBasicDamage(roll.total, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg : true}))
