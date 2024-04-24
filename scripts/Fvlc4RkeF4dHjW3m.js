let caster = this.effect.sourceActor
if (caster && (this.actor.has(game.i18n.localize("NAME.Undead")) || this.actor.has(game.i18n.localize("NAME.Daemonic")))) {
    let wp = caster.system.characteristics.wp.value
    if (wp > this.actor.system.characteristics.t.value) {
        if (this.actor.has(game.i18n.localize("NAME.Unstable"))) {
            this.actor.update({ "system.status.wounds.value": 0 })
            this.actor.addCondition("dead")
        }
        else {
            fromUuid("Compendium.wfrp4e-core.items.D0ImWEIMSDgElsnl").then(item => {
                this.actor.createEmbeddedDocuments("Item", [item.toObject()], { fromEffect: this.effect.id })
                ChatMessage.create({ content: `Added Unstable to ${this.actor.prototypeToken.name}`, speaker: { alias: caster.name } })
            })
        }
    }
}