import { CumulativeVehicleModifiers } from "./accumulated";
let fields = foundry.data.fields;

export class MoraleModel extends CumulativeVehicleModifiers {

    static key = "morale";
    static initialSources = "initialMoraleSources";
    static chatRollLabel = "VEHICLE.MoraleRolls";
    static chatNoModifierLabel = "VEHICLE.NoMoraleModifiers";
    static starting = 75;

    static defineSchema() {
        let schema = super.defineSchema();
        schema.transferEffects = new fields.BooleanField({initial : true})
        return schema;
    }


    getMoraleEffects(actor)
    {
        if (this.transferEffects)
        {
            if (this.value >= 101)
            {
                return [game.wfrp4e.config.vehicleSystemEffects["master-captain"]].filter(i => i).map(i => new ActiveEffect.implementation(i, {parent: actor}))
            }
            else if (this.value >= 76)
            {
                return [game.wfrp4e.config.vehicleSystemEffects["fine-crew"]].filter(i => i).map(i => new ActiveEffect.implementation(i, {parent: actor}))
            }
            else if (this.value <= 50)
            {
                return [game.wfrp4e.config.vehicleSystemEffects["knaves"]].filter(i => i).map(i => new ActiveEffect.implementation(i, {parent: actor}))
            }
        }
                    
        return []
    }
}