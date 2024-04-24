if (args.totalWoundLoss > 0) 
{
    args.actor.setupCharacteristic("t", {skipTargets: true, appendTitle :  ` - ${this.effect.name}`, fields: { difficulty: "difficult" } }).then(async test => {
        await test.roll();
        if (test.failed) 
        {
           await args.actor.addCondition("poisoned")
            this.script.scriptMessage(await args.actor.applyBasicDamage(3, {suppressMsg : true, damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL }))
        }
    })
}