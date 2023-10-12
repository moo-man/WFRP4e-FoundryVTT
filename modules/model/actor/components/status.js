import { MountModel } from "./mount";

let fields = foundry.data.fields;

export class StandardStatusModel extends foundry.abstract.DataModel {
    static defineSchema() {
        let schema = {};
        schema.advantage = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 })
        });

        schema.wounds = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
            max: new fields.NumberField(),
        });
        schema.criticalWounds = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
            max: new fields.NumberField(),
        });
        schema.sin = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 })
        });

        schema.corruption = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 })
        });

        schema.encumbrance = new fields.SchemaField({
            current: new fields.NumberField({ initial: 0 }),
            max: new fields.NumberField({ initial: 0 }),
        });
        schema.model = new fields.EmbeddedDataField(MountModel)
        return schema;
    }
}


export class CharacterStatusModel extends StandardStatusModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.fortune = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
        });
        schema.fate = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
        });
        schema.resilience = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
        });
        schema.resolve = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
        });
        return schema;
    }
}


// DOES NOT INHERIT STANDARD
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
        return schema;
    }
}