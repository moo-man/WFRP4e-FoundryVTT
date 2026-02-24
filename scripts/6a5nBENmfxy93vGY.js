const deduct = this.effect.setFlag("wfrp4e", "failed");

if (!deduct) return;

this.actor.system.characteristics.ws.modifier -= 20;
this.actor.system.characteristics.bs.modifier -= 20;