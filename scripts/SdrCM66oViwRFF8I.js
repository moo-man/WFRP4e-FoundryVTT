await this.actor.addCondition("prone");
await this.actor.addCondition("blinded", 1 + this.actor.system.status.sin?.value || 0)