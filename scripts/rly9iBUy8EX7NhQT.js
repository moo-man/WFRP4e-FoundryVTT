if (game.user.targets.size !== 1)
  return ui.notifications.warn("You must target exactly one Boat.");

const target = game.user.targets.first();
const vehicle = target.actor;

if (!(vehicle.system instanceof VehicleModel)) 
  return ui.notifications.warn("You can only Constrict a Boat");

if (vehicle.size > 3)
  return ui.notifications.warn("You can only Constrict vessels of Size Large or smaller");

const turns = Math.ceil(vehicle.system.details.length.value / 10);

const mainEffect = this.item.effects.contents[0];
const effectData = mainEffect.toObject();

effectData.statuses = [effectData.name.slugify()];

foundry.utils.setProperty(effectData, "flags.wfrp4e.target", target.id);
foundry.utils.setProperty(effectData, "flags.wfrp4e.turns", turns);

await this.actor.applyEffect({effectData: [effectData]});

const speaker = ChatMessage.getSpeaker({actor: this.actor});

this.script.message(`<b>${speaker.alias}</b> started wrapping itself around the <b>${target.name}</b> and will be able to start crushing it after ${turns} turns.`);