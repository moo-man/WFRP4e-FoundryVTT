import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class SkillModel extends BaseItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.advanced = new fields.SchemaField({
            value : new fields.StringField(),
        });
        schema.grouped = new fields.SchemaField({
            value : new fields.StringField({initial : "noSpec"})
        });
        schema.characteristic = new fields.SchemaField({
            value : new fields.StringField({initial : "ws"}),
        });
        schema.advances = new fields.SchemaField({
            value : new fields.NumberField(),
            costModifier : new fields.NumberField(),
            force : new fields.BooleanField(),
        });
        schema.modifier = new fields.SchemaField({
            value : new fields.NumberField(),
        });
        schema.total = new fields.SchemaField({
            value : new fields.NumberField(),
        });
        return schema;
    }

    computeDerived()
    {
        this.equipment.findDocuments();
    }
}