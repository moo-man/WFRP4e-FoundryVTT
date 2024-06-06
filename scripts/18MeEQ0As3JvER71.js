let state = !this.effect.disabled;
this.effect.update({"disabled": state});

if (state)
  return ui.notifications.info("EFFECT.CreatureBackInWater", {localize: true})

return ui.notifications.info("EFFECT.CreatureOutOfWater", {localize: true});