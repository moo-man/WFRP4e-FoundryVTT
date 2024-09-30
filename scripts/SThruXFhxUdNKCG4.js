const test = await this.actor.setupCharacteristic("int", {fields: {difficulty: "easy"}, skipTargets: true, appendTitle :  ` - ${this.effect.name}`});
await test.roll();

if (test.failed) {
   this.actor.addCondition('stunned');
}

this.script.scriptNotification(`${this.actor.name} failed the Intelligence Test and gained Stunned Condition!`);