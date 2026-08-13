let roll = await new Roll("1d10 + @sin", {sin: this.actor.system.status.sin.value || 0}).roll();
roll.toMessage(this.script.getChatData());

let skills = await ItemDialog.create(this.actor.itemTypes.skill, "unlimited", {text: "Select penalized Skills", title: this.effect.name})
let names = skills?.map(i => i.name) || [];
this.effect.updateSource({name: this.effect.setSpecifier(names.join(", ")), "flags.wfrp4e.skills" : names, duration: {
  value: roll.total,
  units: "days"
}});