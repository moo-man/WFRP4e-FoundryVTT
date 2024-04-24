import WFRP_Utility from "../../system/utility-wfrp4e";
import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class SkillModel extends BaseItemModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.advanced = new fields.SchemaField({
            value: new fields.StringField(),
        });
        schema.grouped = new fields.SchemaField({
            value: new fields.StringField({ initial: "noSpec" })
        });
        schema.characteristic = new fields.SchemaField({
            value: new fields.StringField({ initial: "ws" }),
        });
        schema.advances = new fields.SchemaField({
            value: new fields.NumberField(),
            costModifier: new fields.NumberField(),
            force: new fields.BooleanField(),
        });
        schema.modifier = new fields.SchemaField({
            value: new fields.NumberField(),
        });
        schema.total = new fields.SchemaField({
            value: new fields.NumberField(),
        });
        return schema;
    }

    get cost() {
          return WFRP_Utility._calculateAdvCost(this.advances.value, "skill", this.advances.costModifier)
    }

    get modified() {
        if (this.modifier) {
          if (this.modifier.value > 0)
            return "positive";
          else if (this.modifier.value < 0)
            return "negative"
        }
        return ""
      }
    

    async preUpdateChecks(data) {
        await super.preUpdateChecks(data);

        if (this.parent.isOwned && this.grouped.value == "isSpec" && data.name) {
            this._handleSkillNameChange(data.name)
        }
    }

    computeOwned()
    {
        this.total.value = this.modifier.value + this.advances.value + this.parent.actor.system.characteristics[this.characteristic.value].value;
        this.advances.indicator = this.advances.force;
    }


    _addCareerData(career) {
        if (!career)
          return
          
        this.advances.career = this;
        if (this.advances.value >= career.level.value * 5)
        {
            this.advances.complete = true;
        }
        this.advances.indicator = this.advances.indicator || !!this.advances.career || false
      }

    // If an owned (grouped) skill's name is changing, change the career data to match
    _handleSkillNameChange(newName) {
        let oldName = this.parent.name
        let currentCareer = this.parent.actor?.currentCareer;
        if (!currentCareer) 
        {
            return
        }
        else 
        {
            currentCareer.system.changeSkillName(oldName, newName)
        }
    }

    chatData() {
        let properties = []
        properties.push(this.advanced == "adv" ? `<b>${game.i18n.localize("Advanced")}</b>` : `<b>${game.i18n.localize("Basic")}</b>`)
        return properties;
    }
    
}