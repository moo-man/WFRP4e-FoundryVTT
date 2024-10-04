import { LocationalItemModel } from "./components/locational";
let fields = foundry.data.fields;

export class InjuryModel extends LocationalItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.penalty = new fields.SchemaField({
            value : new fields.StringField(),
        })
        schema.duration = new fields.SchemaField({
            value : new fields.StringField(),
            active : new fields.BooleanField(),
            permanent : new fields.BooleanField(),
        });
        return schema;
    }

    /**
     * Used to identify an Item as one being a child or instance of InjuryModel
     *
     * @final
     * @returns {boolean}
     */
    get isInjury() {
        return true;
    }

    chatData() {
        let properties = [];
        properties.push(`<b>${game.i18n.localize("Location")}</b>: ${this.location.value}`);
        if (this.penalty.value)
          properties.push(`<b>${game.i18n.localize("Penalty")}</b>: ${this.penalty.value}`);
        return properties;
      }

}