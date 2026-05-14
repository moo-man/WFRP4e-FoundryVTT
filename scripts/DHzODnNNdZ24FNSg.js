let skills = this.actor.itemTypes.skill.filter(s => (this.effect.getFlag("wfrp4e", "skills") || []).includes(s.name));
skills.forEach(s => {
  s.system.modifier.value -= 10;
})