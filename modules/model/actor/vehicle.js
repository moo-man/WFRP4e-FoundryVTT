import { BaseActorModel } from "./base";
import { CharacteristicModel } from "./components/characteristics";
import { VehicleDetailsModel } from "./components/details";
import { VehiclePassengersModel } from "./components/vehicle/passengers";
import { VehicleStatusModel } from "./components/vehicle/status";
let fields = foundry.data.fields;

export class VehicleModel extends BaseActorModel {
    static preventItemTypes = ["talent", "career", "disease", "injury", "mutation", "spell", "psychology", "skill", "prayer", "injury", "template"];

    static defineSchema() {
        let schema = super.defineSchema();
        schema.characteristics = new fields.SchemaField({
            t: new fields.EmbeddedDataField(CharacteristicModel)
        });
        schema.status = new fields.EmbeddedDataField(VehicleStatusModel);
        schema.details = new fields.EmbeddedDataField(VehicleDetailsModel);
        schema.passengers = new fields.EmbeddedDataField(VehiclePassengersModel);
        schema.vehicleType = new fields.StringField({initial : "water"})
        schema.roles = new fields.ArrayField(new fields.ObjectField({deprecated : true})) // needed for migrating old roles
        return schema;
    }

    async _preCreate(data, options, user) {

        await super._preCreate(data, options, user);
        let preCreateData = {};
        if (!data.prototypeToken)
            foundry.utils.mergeObject(preCreateData,
            {
                "prototypeToken.texture.src": "systems/wfrp4e/tokens/vehicle.png"
            })

        if (!data.img || data.img == "icons/svg/mystery-man.svg") {
            preCreateData.img = "systems/wfrp4e/tokens/vehicle.png"
        }

        this.parent.updateSource(preCreateData);
    }
    
    itemIsAllowed(item) {
        let allowed = super.itemIsAllowed(item);

        // Prevent standard traits
        if (allowed && item.type == "trait")
        {
            allowed = allowed && item.system.category == "vehicle";
            if (!allowed)
            {
                ui.notifications.error("ERROR.StandardTraitsOnVehicle");
            }
        }
        return allowed
    }

    initialize()
    {
        this.collision = 0;
        this.details.crew.current = 0;
    }

    computeBase()
    {
        super.computeBase();
        this.parent.runScripts("prePrepareData", { actor: this.parent })
        this.characteristics.t.computeValue();
        this.characteristics.t.computeBonus();
        this.status.wounds.bonus = Math.floor(this.status.wounds.value / 10)
        this.details.size.value = this.details.computeSize();
        this.status.initializeArmour();
        this.passengers.compute(this.parent.itemTypes.vehicleRole);
        this.crew = this.passengers.list.filter(i => i.roles?.length > 0)
        this.status.morale.compute();
        this.status.mood.compute();
    }

    computeDerived() {
        super.computeDerived();
        this.parent.runScripts("prePrepareItems", {actor : this.parent })
        this.characteristics.t.computeValue();
        this.characteristics.t.computeBonus();
        this.collision += this.characteristics.t.bonus + this.status.wounds.bonus
        this.computeEncumbrance();
        this.details.computeMove();
        this.parent.runScripts("prepareData", { actor: this.parent })
    }


    computeEncumbrance() {
        if (!game.actors) // game.actors does not exist at startup, use existing data
        {
            game.wfrp4e.postReadyPrepare.push(this)
        }
        else 
        {
            this.status.encumbrance.current += this.details.computeCrewEncumbrance(this.passengers.list)
        }

        for (let i of this.parent.items) 
        {
            i.prepareOwnedData()
            
            if (i.encumbrance)
            {
                this.status.encumbrance.current += Number(i.encumbrance.total);
            }
        }

        this.status.encumbrance.current = Math.floor(this.status.encumbrance.current * 10) / 10;
        this.status.encumbrance.mods = this.parent.itemTags["vehicleMod"].reduce((prev, current) => prev + current.encumbrance.total, 0)
        this.status.encumbrance.over = this.status.encumbrance.mods - this.status.encumbrance.initial
        this.status.encumbrance.over = this.status.encumbrance.over < 0 ? 0 : this.status.encumbrance.over

        this.status.encumbrance.max = this.status.carries.max
        this.status.encumbrance.pct = this.status.encumbrance.over / this.status.encumbrance.max * 100
        this.status.encumbrance.carryPct = this.status.encumbrance.current / this.status.carries.max * 100
        if (this.status.encumbrance.pct + this.status.encumbrance.carryPct > 100) {
            this.status.encumbrance.penalty = Math.floor(((this.status.encumbrance.carryPct + this.status.encumbrance.pct) - 100) / 10) // Used in handling tests
        }
    }

    get crewEffects() 
    {
        return this.parent.effects.contents.concat(this.parent.items.contents.reduce((effects, item) => effects.concat(item.effects.contents), [])).filter(e => e.system.transferData.type == "crew");
    }

    getOtherEffects() 
    {
        return super.getOtherEffects().concat(this.status.morale.getMoraleEffects(this.parent))
    }

    static migrateData(data)
    {
        if (data.passengers instanceof Array)
        {
            data.passengers = {
                list : data.passengers
            }
        }
    }
}