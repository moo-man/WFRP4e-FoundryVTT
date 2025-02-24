import { LocationalItemModel } from "./components/locational";
let fields = foundry.data.fields;

export class CriticalModel extends LocationalItemModel {

    static LOCALIZATION_PREFIXES = ["WH.Models.critical"];

    static defineSchema() {
        let schema = super.defineSchema();
        schema.wounds = new fields.SchemaField({
            value: new fields.StringField(),
        });

        schema.modifier = new fields.SchemaField({
            value: new fields.StringField(),
        })
        return schema;
    }

    /**
     * Used to identify an Item as one being a child or instance of CriticalModel
     *
     * @final
     * @returns {boolean}
     */
    get isCrticial() 
    {
        return true;
    }

    async _onCreate(data, options, user) {
        await super._onCreate(data, options, user);
        if (this.parent.actor && this.parent.actor.type != "vehicle" && game.user.id == user) 
        {
            let actor = this.parent.actor;
            try {

                let newWounds;
                let appliedWounds = Number.parseInt(this.wounds.value);
                if (Number.isInteger(appliedWounds)) 
                {
                    ui.notifications.notify(`${this.wounds.value} ${game.i18n.localize("CHAT.CriticalWoundsApplied")} ${actor.name}`)
                    newWounds = actor.status.wounds.value - appliedWounds;
                    if (newWounds < 0) 
                    {
                        newWounds = 0;
                    }
                } 
                else if (this.wounds.value.toLowerCase() == "death") 
                {
                    newWounds = 0;
                }

                if (game.combat && game.user.isGM) {
                    let minorInfections = game.combat.getFlag("wfrp4e", "minorInfections") || []
                    minorInfections.push(actor.name)
                    game.combat.setFlag("wfrp4e", "minorInfections", null).then(c => game.combat.setFlag("wfrp4e", "minorInfections", minorInfections))
                }
                if (newWounds)
                {
                    actor.update({ "system.status.wounds.value": newWounds });
                }
            }
            catch (e) {
                console.error(`_onCreate from ${this.parent?.actor?.name} threw error: ${e}.\n Arguments:`, this);
            }
        }
    }

    async expandData(htmlOptions) {
        let data = await super.expandData(htmlOptions);
        data.properties.push(`<b>${game.i18n.localize("Wounds")}</b>: ${this.wounds.value}`)
        if (this.modifier.value)
          data.properties.push(`<b>${game.i18n.localize("Modifier")}</b>: ${this.modifier.value}`)
        return data;
      }

      chatData() {
        let properties = [];
        properties.push(`<b>${game.i18n.localize("Wounds")}</b>: ${this.wounds.value}`);
        properties.push(`<b>${game.i18n.localize("Location")}</b>: ${this.location.value}`);
        if (this.modifier.value)
          properties.push(`<b>${game.i18n.localize("Modifier")}</b>: ${this.modifier.value}`);
        return properties;
      }

}