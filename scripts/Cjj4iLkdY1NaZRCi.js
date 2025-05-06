if ((args.opposedTest.attackerTest.item && args.opposedTest.attackerTest.item.isMelee) || (args.opposedTest.attackerTest.item && !args.opposedTest.attackerTest.item.name.includes("Ranged")))
{
    let choice = await foundry.applications.api.DialogV2.confirm({window : {title : this.effect.name}, content : `<p>Apply damage with <strong>${this.effect.name}</strong> to attacker?`})

    if (choice)
    {
        this.script.message(await args.attacker.applyBasicDamage(this.actor.system.characteristics.wp.bonus, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP, suppressMsg : true}));
    }
}