let roll = await new Roll("1d5").roll();
roll.toMessage(this.script.getChatData());
this.actor.addCondition("ablaze", roll.total);