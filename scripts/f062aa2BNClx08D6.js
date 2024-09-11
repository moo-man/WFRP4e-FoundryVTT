let test = await args.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
    await test.roll();
    if (test.failed) 
    {
      let toughnessLost = parseInt(this.effect.sourceTest.result.SL)

      let currentModifier = this.actor.characteristics.t.modifier

      await this.actor.update({ "system.characteristics.t.modifier": currentModifier - toughnessLost })
      this.script.message(`<b>${this.actor.prototypeToken.name}</b> lost ${toughnessLost} Toughness`)
      if (this.actor.system.characteristics.t.value <= 0)
      {
          this.actor.addCondition("dead");
      }

    }