let fields = foundry.data.fields;
export default class SpendModel extends foundry.abstract.DataModel
{
static LOCALIZATION_PREFIXES = ["WH.Components.Spend"];

    static defineSchema()
    {
        return {
            enabled: new fields.BooleanField(),
            momentum: new fields.BooleanField(),
            advantage: new fields.NumberField({initial: 0, min: 0}),
        }
    }
}