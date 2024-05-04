import { MountModel } from "./mount";

let fields = foundry.data.fields;

export class MoraleModel extends foundry.abstract.DataModel {
    static defineSchema() {
        let schema = {};
        schema.starting = new fields.NumberField({initial: 75});
        schema.modifiers = new fields.ArrayField(new fields.SchemaField({
            value : new fields.NumberField(),
            roll : new fields.StringField(),
            description : new fields.StringField()
        }))
        return schema;
    }

    compute()
    {
        this.value = this.starting;
    }

}