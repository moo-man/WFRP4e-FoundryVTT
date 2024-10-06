if (!this.actor.flags.holed) return;
if (this.actor.flags.holed.applied === true) return;
if (this.actor.hasCondition("dead")) return;

const currentHoled = this.actor.flags.holed.holed || 0;

const openGunPorts = this.actor.itemTypes.vehicleMod.reduce((acc, m) => {
  if (!m.name.toLowerCase().includes("gun port")) 
    return acc;
  
  let closed = m.getFlag("wfrp4e-soc", "gunport");
  if (!closed) acc++;
 
  return acc;
}, 0);

const totalHoled = currentHoled + openGunPorts;
const toughness = this.actor.system.characteristics.t.value;
this.actor.flags.holed.total = totalHoled;

if (totalHoled >= toughness) {
  const speaker = ChatMessage.getSpeaker({actor: this.actor});
  this.script.message(`
        <p><b>${speaker.alias}</b> sank due to having <em>Holed (${totalHoled})</em> rating equal to, or exceeding its <em>Toughness (${toughness })</em></p>
        <p>
          <em>Holed</em> due to Critical Damage: ${currentHoled}<br/>
          <em>Holed</em> due to opened Gun Ports: ${openGunPorts}
        </p>
      `, {   flavor: this.effect.name.split("(")[0]});
  this.actor.addCondition("dead");
} else if (totalHoled >= (toughness * 0.5)) {
  this.actor.system.details.move.value -= 1;
  this.actor.system.details.man -= 1;
  this.actor.flags.holed.half = true;
}

this.actor.flags.holed.applied = true;