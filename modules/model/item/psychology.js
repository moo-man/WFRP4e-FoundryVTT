import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class PsychologyModel extends BaseItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();

        return schema;
    }

    chatData() {
        return [];
      }
}