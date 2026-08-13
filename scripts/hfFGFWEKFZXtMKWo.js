let corruption = await new Roll("1d10").roll();
corruption.toMessage(this.script.getChatData());

this.actor.addCondition("stunned", corruption.total);

this.actor.update({"system.status.corruption.value" : parseInt(this.actor.system.status.corruption.value) + corruption.total});
this.script.notification("Added Corruption");