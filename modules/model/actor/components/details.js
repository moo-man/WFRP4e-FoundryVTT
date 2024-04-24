import { MountModel } from "./mount";

let fields = foundry.data.fields;

export class StandardDetailsModel extends foundry.abstract.DataModel {
    static defineSchema() {
        let schema = {};
        schema.species = new fields.SchemaField({
            value: new fields.StringField(),
            subspecies: new fields.StringField(),
        });
        schema.gender = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.biography = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.gmnotes = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.size = new fields.SchemaField({
            value: new fields.StringField({ initial: "avg" })
        });
        schema.move = new fields.SchemaField({
            value: new fields.NumberField({ initial: 4 }),
        });
        schema.god = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.status = new fields.SchemaField({
            value: new fields.StringField(),
            standing: new fields.StringField(),
            tier: new fields.NumberField({ initial: 0 }),
            modifier: new fields.NumberField({ initial: 0 }),
        });
        schema.hitLocationTable = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.mainHand = new fields.StringField({initial : "r"})
        return schema;
    }
}


export class CharacterDetailsModel extends StandardDetailsModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.experience = new fields.SchemaField({
            total: new fields.NumberField({ initial: 0 }),
            spent: new fields.NumberField({ initial: 0 }),
            log: new fields.ArrayField(new fields.ObjectField())
        });

        schema["personal-ambitions"] = new fields.SchemaField({
            "short-term": new fields.StringField(),
            "long-term": new fields.StringField()
        });
        schema["party-ambitions"] = new fields.SchemaField({
            "name": new fields.StringField(),
            "short-term": new fields.StringField(),
            "long-term": new fields.StringField()
        });
        schema.motivation = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.class = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.career = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.careerlevel = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.age = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.height = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.weight = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.haircolour = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.eyecolour = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.distinguishingmark = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.starsign = new fields.SchemaField({
            value: new fields.StringField()
        });
        return schema;
    }
}

// DOES NOT INHERIT STANDARD
export class VehicleDetailsModel extends foundry.abstract.DataModel {
    static defineSchema() {
        let schema = {};
        schema.vehicletype = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.move = new fields.SchemaField({
            value: new fields.NumberField()
        });
        schema.length = new fields.SchemaField({
            value: new fields.NumberField()
        });
        schema.description = new fields.SchemaField({
            value: new fields.StringField({ initial: "" })
        });
        schema.gmdescription = new fields.SchemaField({
            value: new fields.StringField({ initial: "" }),
        });
        schema.price = new fields.SchemaField({
            gc: new fields.NumberField()
        });
        schema.availability = new fields.SchemaField({
            value: new fields.StringField(),
        });
        schema.motivePower = new fields.SchemaField({
            value: new fields.StringField(),
        });
        schema.hitLocationTable = new fields.SchemaField({
            value: new fields.StringField()
        });
        return schema;
    }
}
