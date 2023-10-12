import { DocumentListModel } from "../shared/list";
import { VehicleDocumentModel } from "../shared/reference";
import { BaseActorModel } from "./base";
import { CharacteristicModel } from "./components/characteristics";
import { VehicleDetailsModel } from "./components/details";
import { VehicleStatusModel } from "./components/status";
let fields = foundry.data.fields;

export class VehicleModel extends BaseActorModel
{
    static preventItemTypes = [];

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.characteristics = new fields.SchemaField({
            t : fields.EmbeddedDataField(CharacteristicModel)
        });
        schema.status = new fieldsE.EmbeddedDataField(VehicleStatusModel);
        schema.details = new fieldsE.EmbeddedDataField(VehicleDetailsModel);
        schema.passengers = new fields.ArrayField(new fields.ObjectField());
        schema.roles = new fields.ArrayField(new fields.ObjectField());
        return schema;
    }

    preCreateData(data, options) {

        let preCreateData = super.preCreateData(data, options);
        // Set custom default token
        if (!data.img || data.img == "icons/svg/mystery-man.svg") {
            preCreateData.img = "systems/wfrp4e/tokens/vehicle.png"
        }

        return preCreateData;
    }

    computeDerived(items)
    {
    }
}