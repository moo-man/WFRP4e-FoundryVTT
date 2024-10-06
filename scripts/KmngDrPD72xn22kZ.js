if (this.actor.Species.toLowerCase() != "skaven") {
    this.actor.setupCharacteristic("t", {skipTargets: true, appendTitle :  ` - Used ${this.effect.name}`, fields: { difficulty: "difficult" } }).then(async test => {
      await test.roll()
      if (test.failed) 
      {
        let toughnessLost = Math.ceil(CONFIG.Dice.randomUniform() * 10)
        this.actor.update({ "system.characteristics.t.initial": this.actor.characteristics.t.initial - toughnessLost })
        this.script.message(`<b>${this.actor.prototypeToken.name}</b> lost ${toughnessLost} Toughness`)
      }
    })
  }