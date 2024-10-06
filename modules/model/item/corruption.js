import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class CorruptionModel extends BaseItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.category = new fields.StringField();
        return schema;
    }

    /**
     * Used to identify an Item as one being a child or instance of CorruptionModel
     *
     * @final
     * @returns {boolean}
     */
    get isCorruption() {
        return true;
    }
}