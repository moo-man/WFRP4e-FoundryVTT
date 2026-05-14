let number = await new Roll("1d10").roll();
number.toMessage(this.script.getChatData());

this.actor.update({"system.status.fortune.value" : parseInt(this.actor.system.status.fortune.value) + number.total})
this.script.message(`Added ${number.total} Fortune points`, {whisper : ChatMessage.getWhisperRecipients("GM")})