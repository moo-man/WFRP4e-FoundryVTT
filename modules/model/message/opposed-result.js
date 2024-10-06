import OpposedHandler from "../../system/opposed-handler";
import OpposedTest from "../../system/opposed-test";

let fields = foundry.data.fields;
export class OpposedTestMessage extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = {};
        schema.opposedTestData = new fields.ObjectField();
        schema.handlerId = new fields.StringField();
        return schema;
    }

    get opposedTest() 
    {
        return OpposedTest.recreate(this.opposedTestData);
    }
}