this.actor.update({"system.status.corruption.value" : parseInt(this.actor.system.status.corruption.value) + 1});
this.script.notification("Added Corruption");
await this.actor.addCondition("prone");
await this.actor.addCondition("fatigued");