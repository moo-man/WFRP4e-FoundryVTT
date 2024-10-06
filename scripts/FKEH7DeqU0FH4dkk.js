let test = await this.actor.setupSkill(game.i18n.localize("NAME.Dodge"), {fields : {difficulty : "hard"}, appendTitle : ` - ${this.effect.name}`})
await test.roll();

if (test.failed) {
  	this.script.scriptMessage(await this.actor.applyBasicDamage(20, {suppressMsg: true}));
        this.script.scriptMessage(`${this.actor.name} is subject to @UUID[Compendium.wfrp4e-core.journals.JournalEntry.NS3YGlJQxwTggjRX.JournalEntryPage.WCivInLZrqEtZzF4#drowning-and-suffocation]{Suffocation}`);
}