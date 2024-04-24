(await new Roll("1d10").roll()).toMessage(this.script.getChatData())
await this.actor.addCondition("dead")