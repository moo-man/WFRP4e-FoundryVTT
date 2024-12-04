import Advancement from "../../system/advancement";
import WFRP_Utility from "../../system/utility-wfrp4e";
import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class SkillModel extends BaseItemModel {
    static LOCALIZATION_PREFIXES = ["WH.Models.skill"];

    static defineSchema() {
        let schema = super.defineSchema();
        schema.advanced = new fields.SchemaField({
            value: new fields.StringField({initial : "bsc", choices : game.wfrp4e.config.skillTypes}),
        });
        schema.grouped = new fields.SchemaField({
            value: new fields.StringField({ initial: "noSpec", choices : game.wfrp4e.config.skillGroup })
        });
        schema.characteristic = new fields.SchemaField({
            value: new fields.StringField({ initial: "ws", choices : game.wfrp4e.config.characteristics }),
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

    /**
     * Used to identify an Item as one being a child or instance of SkillModel
     *
     * @final
     * @returns {boolean}
     */
    get isSkill() {
        return true;
    }

    get cost() {
          return Advancement.calculateAdvCost(this.advances.value, "skill", this.advances.costModifier)
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

    get isGrouped() 
    {
        return this.grouped.value == "isSpec";
    }

    get isBasic()
    {
        return this.advanced.value == "bsc";
    }

    async _preUpdate(data, options, user) {
        await super._preUpdate(data, options, user);
        let actor = this.parent.actor

        if (actor?.type == "character" && this.isGrouped && options.changed.name) 
        {
            this._handleSkillNameChange(data.name, this.parent.name)
        }

        if (actor?.type == "character" && getProperty(options.changed, "system.advances.value") && !options.skipExperienceChecks)
        {
            let resolved = await Advancement.advancementDialog(this.parent, data.system.advances.value, "skill", actor)
    
            if (!resolved)  
            {
                data.system.advances.value = this.advances.value;
                this.parent.actor.sheet.render(true) // this doesn't feel right but otherwise the inputted value will still be on the sheet
            }
        }
    }

    async _preCreate(data, options, user)
    {
        if (this.parent.isEmbedded && !options.skipSpecialisationChoice)
        {
            // If skill has (any) or (), ask for a specialisation
            if (this.parent.specifier.toLowerCase() == game.i18n.localize("SPEC.Any").toLowerCase() || (this.isGrouped && !(this.parent.specifier)))
            {
                let skills = await warhammer.utility.findAllItems("skill", "Loading Skills", true);
                let specialisations = skills.filter(i => i.name.split("(")[0]?.trim() == this.parent.baseName);

                // if specialisations are found, prompt it, if not, skip to value dialog
                let choice = specialisations.length > 0 ? await ItemDialog.create(specialisations, 1, {title : "Skill Specialisation", text : "Select specialisation, if no selection is made, enter one manually."}) : []
                let newName = ""
                if (choice[0])
                {
                    newName = choice[0].name;
                }
                else 
                {
                    newName = this.parent.baseName + ` (${await ValueDialog.create({text: "Enter Skill Specialisation", title : "Skill Specialisation"})})`;

                }

                if (newName)
                {
                    this._handleSkillNameChange(newName, this.parent.name, options.career)
                    this.parent.updateSource({name : newName})
                }
            }
        }
    }

    async _onUpdate(data, options, user)
    {
        await super._onUpdate(data, options, user);


    }

    computeOwned()
    {
        this.total.value = this.modifier.value + this.advances.value + this.parent.actor.system.characteristics[this.characteristic.value].value;
        this.advances.indicator = this.advances.force;
    }


    addCareerData(career) {
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
    _handleSkillNameChange(newName, oldName, skipPrompt=false) {
        let currentCareer = this.parent.actor?.currentCareer;
        if (!currentCareer) 
        {
            return
        }
        else 
        {
            currentCareer.system.changeSkillName(newName, oldName, skipPrompt)
        }
    }

    chatData() {
        let properties = []
        properties.push(this.advanced == "adv" ? `<b>${game.i18n.localize("Advanced")}</b>` : `<b>${game.i18n.localize("Basic")}</b>`)
        return properties;
    }
    
}