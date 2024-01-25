import { LocationalItemModel } from "./components/locational";
let fields = foundry.data.fields;

export class InjuryModel extends LocationalItemModel 
{
    // allowedConditions = ["bleeding", "stunned", "blinded", "deafened", "incapacitated", "prone", "stunned"];
    // allowedEffectApplications = ["document"];
    // effectApplicationOptions = {documentType : "Actor"};

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

    chatData() {
        let properties = [];
        properties.push(`<b>${game.i18n.localize("Location")}</b>: ${this.location.value}`);
        if (this.penalty.value)
          properties.push(`<b>${game.i18n.localize("Penalty")}</b>: ${this.penalty.value}`);
        return properties;
      }

}