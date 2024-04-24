let choice = await ItemDialog.create(ItemDialog.objectToArray({
    ws : game.wfrp4e.config.characteristics.ws,
    t : game.wfrp4e.config.characteristics.t,
    ag : game.wfrp4e.config.characteristics.ag,
    wp : game.wfrp4e.config.characteristics.wp
}, this.effect.img), 1, "Choose Characteristic");

this.effect.updateSource({"flags.wfrp4e.characteristic" : choice[0].id})