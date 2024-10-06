        // Every living creature within 10 yards, other than the wielder of the hammer,
        // must make a Challenging (+0) Endurance Test 

        let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {
            skipTargets: true, appendTitle :  " - " + this.effect.name,
            fields: {difficulty: "challenging"}
        })
        
        await test.roll();
        if (test.failed)
        {
            // or gain a Deafened Condition 
            this.actor.addCondition("deafened");
            // and suffer 1d10 Wounds which bypass armour but not Toughness Bonus.
            let damage = (await new Roll("1d10").roll());
            await damage.toMessage(this.script.getChatData());
            this.script.message(await this.actor.applyBasicDamage(damage.total, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP, suppressMsg: true}))
        }