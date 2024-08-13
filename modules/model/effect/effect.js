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
    static _avoidTestModel = WFRP4eAvoidTestModel;
}