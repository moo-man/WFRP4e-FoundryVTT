import { BaseItemModel } from "./components/base";
import TestDataModel from "./components/test";
let fields = foundry.data.fields;

export class PsychologyModel extends BaseItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.test = new fields.EmbeddedDataField(TestDataModel, {noTarget: true});

        return schema;
    }

    /**
     * Used to identify an Item as one being a child or instance of PsychologyModel
     *
     * @final
     * @returns {boolean}
     */
    get isPsychology() {
        return true;
    }

    chatData() {
        return [];
      }
}