let roll = await new Roll("1d10 + 1").roll()
await roll.toMessage(this.script.getChatData());
this.script.scriptNotification(`Healed ${roll.total} Wounds`)
game.wfrp4e.utility.postCorruptionTest("moderate", this.script.getChatData())
await this.actor.modifyWounds(roll.total)