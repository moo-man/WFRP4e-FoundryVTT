let damageCounter = this.effect.getFlag("wfrp4e", "damage") || 0;
await this.actor.applyDamage(this.effect.sourceTest.result.damage + damageCounter, {sourceItem: this.effect.sourceItem, sourceTest: this.effect.sourceTest, createMessage: this.script.getChatData()})
damageCounter++;
this.effect.setFlag("wfrp4e", "damage", damageCounter);
await this.actor.addCondition("ablaze");