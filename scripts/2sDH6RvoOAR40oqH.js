

if (!["Goblin", "Orc"].includes(this.actor.system.details.species.value)) {
    let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), { appendTitle: ` - ${this.effect.name}` })
    await test.roll();
    if (test.failed) {
        let infection = await fromUuid("Compendium.wfrp4e-core.items.Item.1hQuVFZt9QnnbWzg")
        this.actor.createEmbeddedDocuments("Item", [infection])
    }
}

// Since wounds change when the effect is deleted, need to wait until after 
// the max wounds have been recalculated to apply damage
warhammer.utility.sleep(1000).then(async () => {
    let roll = await new Roll("1d10").roll();

    roll.toMessage(this.script.getChatData());
    this.script.message(await this.actor.applyBasicDamage(roll.total, { damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg: true }))

})