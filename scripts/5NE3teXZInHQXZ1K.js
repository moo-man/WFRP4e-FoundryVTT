let roll = await new Roll("2d10 + @sin", {sin: this.actor.system.status.sin.value || 0}).roll();
roll.toMessage(this.script.getChatData());
this.effect.updateSource({duration: {
  value: roll.total,
  units: "rounds"
}});