let roll = await new Roll("1d10 + 1").roll()
await roll.toMessage(this.script.getChatData());
this.script.notification(`Healed ${roll.total} Wounds`)
this.actor.corruptionDialog("moderate")
await this.actor.modifyWounds(roll.total)