if (this.item.system.quantity.value)
{
	this.item.system.reduceQuantity();
	let actor = Array.from(game.user.targets)[0]?.actor || this.actor;
     let effectData = this.item.effects.contents[0].convertToApplied();
     let minutes = Math.ceil(CONFIG.Dice.randomUniform() * 10) * 10;
     effectData.duration.seconds = 60 * minutes
     this.script.message(`<strong>${game.i18n.localize("Duration")}</strong>: ${minutes} ${game.i18n.localize("Minutes")}`, {whisper : ChatMessage.getWhisperRecipients("GM")})
	actor.applyEffect({effectData : [effectData]})
}
else
{
	this.script.notification("None left!", "error")
}