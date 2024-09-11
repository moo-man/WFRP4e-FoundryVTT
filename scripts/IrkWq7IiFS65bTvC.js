if (this.actor.flags.holed.half !== true) return;
if (this.actor.flags.holed.reminded === true) return;

const speaker = ChatMessage.getSpeaker({actor: this.actor});
this.script.message(`<p><b>${speaker.alias}</b> sits heavily in the water. Unless the cargo is waterproof, it loses [[d10]]% of its value.</p>`);

this.actor.flags.holed.reminded  = true;