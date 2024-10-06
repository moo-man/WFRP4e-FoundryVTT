if ((args.opposedTest.attackerTest.item && args.opposedTest.attackerTest.item.isMelee) || (args.opposedTest.attackerTest.item && !args.opposedTest.attackerTest.item.name.includes("Ranged")))
{
    let choice = await Dialog.wait({
        title: this.effect.name,
        content: `<p>Apply damage with <strong>${this.effect.name}</strong> to attacker?`,
        buttons: {
            yes: {
                label: "Yes",
                callback: () => {
                    return true;
                }
            },
            no: {
                label: "No",
                callback: () => {
                    return false;
                }
            }
        }
    })

    if (choice)
    {
        this.script.message(await args.attacker.applyBasicDamage(this.actor.system.characteristics.wp.bonus, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP, suppressMsg : true}));
    }
}