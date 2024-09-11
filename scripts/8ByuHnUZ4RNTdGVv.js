let strLoss = Math.ceil(CONFIG.Dice.randomUniform() * 10)
let tghLoss = Math.ceil(CONFIG.Dice.randomUniform() * 10)

if (!this.actor.has("Undead") && !this.actor.has("Daemonic")) 
{
    this.actor.setupSkill(game.i18n.localize("NAME.Cool"), { appendTitle: " - " + this.effect.name, fields: { difficulty: "average" }, context: { failure: `Lost ${strLoss} Strength and ${tghLoss} Toughness` } }).then(async test => {
        await test.roll();
        if (test.failed) {
            this.actor.update({ "system.characteristics.s.initial": this.actor.system.characteristics.s.initial - strLoss, "system.characteristics.t.initial": this.actor.system.characteristics.t.initial - tghLoss })
        }
    })

}
else {
    this.script.notification(`<strong>${this.actor.name}</strong> is immune to ${this.effect.name}`)
}
