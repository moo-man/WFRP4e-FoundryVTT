import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class PsychologyModel extends BaseItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();

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