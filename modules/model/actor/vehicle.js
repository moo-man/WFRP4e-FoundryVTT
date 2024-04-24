import { BaseActorModel } from "./base";
import { CharacteristicModel } from "./components/characteristics";
import { VehicleDetailsModel } from "./components/details";
import { VehicleStatusModel } from "./components/status";
let fields = foundry.data.fields;

export class VehicleModel extends BaseActorModel {
    static preventItemTypes = [];

    static defineSchema() {
        let schema = super.defineSchema();
        schema.characteristics = new fields.SchemaField({
            t: new fields.EmbeddedDataField(CharacteristicModel)
        });
        schema.status = new fields.EmbeddedDataField(VehicleStatusModel);
        schema.details = new fields.EmbeddedDataField(VehicleDetailsModel);
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

    computeDerived(items, flags) {
        super.computeDerived(items, flags);
        this.computeEncumbrance(items, flags);
    }


    computeEncumbrance() {
        if (!game.actors) // game.actors does not exist at startup, use existing data
            game.wfrp4e.postReadyPrepare.push(this)
        else {
            if (getProperty(this.parent, "flags.actorEnc"))
                for (let passenger of this.passengers)
                    this.status.encumbrance.current += passenger.enc;
        }

        for (let i of this.parent.items) 
        {
            i.prepareOwnedData()
            
            if (i.encumbrance && i.type != "vehicleMod")
            {
                this.status.encumbrance.current += Number(i.encumbrance.total);
            }
        }


        this.status.encumbrance.current = Math.floor(this.status.encumbrance.current * 10) / 10;
        this.status.encumbrance.mods = this.parent.getItemTypes("vehicleMod").reduce((prev, current) => prev + current.encumbrance.total, 0)
        this.status.encumbrance.over = this.status.encumbrance.mods - this.status.encumbrance.initial
        this.status.encumbrance.over = this.status.encumbrance.over < 0 ? 0 : this.status.encumbrance.over

        this.status.encumbrance.max = this.status.carries.max
        this.status.encumbrance.pct = this.status.encumbrance.over / this.status.encumbrance.max * 100
        this.status.encumbrance.carryPct = this.status.encumbrance.current / this.status.carries.max * 100
        if (this.status.encumbrance.pct + this.status.encumbrance.carryPct > 100) {
            this.status.encumbrance.penalty = Math.floor(((this.status.encumbrance.carryPct + this.status.encumbrance.pct) - 100) / 10) // Used in handling tests
        }

    }
}