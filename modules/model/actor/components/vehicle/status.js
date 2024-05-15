import { ManannMoodModel } from "./mood";
import { MoraleModel } from "./morale";

let fields = foundry.data.fields;

export class VehicleStatusModel extends foundry.abstract.DataModel {
    static defineSchema() {
        let schema = {};
        schema.wounds = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
            max: new fields.NumberField(),
        });
        schema.criticalWounds = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
            max: new fields.NumberField(),
        });
        schema.carries = new fields.SchemaField({
            current: new fields.NumberField({ initial: 0 }),
            max: new fields.NumberField({ initial: 10 }),
        });
        schema.encumbrance = new fields.SchemaField({
            current: new fields.NumberField({ initial: 0 }),
            initial: new fields.NumberField({ initial: 0 }),
        });
        schema.morale = new fields.EmbeddedDataField(MoraleModel);
        schema.mood = new fields.EmbeddedDataField(ManannMoodModel);
        return schema;
    }
}