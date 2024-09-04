let fields = foundry.data.fields;

export class WFRP4eAvoidTestModel extends AvoidTestModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.difficulty  = new fields.StringField({});
        schema.characteristic  = new fields.StringField({});
        schema.skill  = new fields.StringField({});

        return schema;
    }
}

export class WFRP4eActiveEffectModel extends WarhammerActiveEffectModel {

    static defineSchema() {
        let schema = super.defineSchema();
        schema.condition = new fields.SchemaField({
            value : new fields.NumberField({nullable : true}),
            numbered : new fields.BooleanField({initial: false}),
            trigger : new fields.StringField()
        })

        return schema;
    }

    static _avoidTestModel = WFRP4eAvoidTestModel;
}