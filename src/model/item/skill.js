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

    static get compendiumBrowserFilters() {
        return new Map([
            ...Array.from(super.compendiumBrowserFilters),
            ["advanced", {
                label: this.LOCALIZATION_PREFIXES + ".FIELDS.advanced.value.label",
                type: "set",
                config: {
                    choices : game.wfrp4e.config.skillTypes,
                    keyPath: "system.advanced.value"
                }
            }],
            ["grouped", {
                label: "ITEM.IsSpec",
                type: "boolean",
                config: {
                    keyPath: "system.grouped.value",
                    valueGetter: (data) => data.system.grouped?.value === "isSpec"
                }
            }],
            ["characteristic", {
                label: this.LOCALIZATION_PREFIXES + ".FIELDS.characteristic.value.label",
                type: "set",
                config: {
                    choices : game.wfrp4e.config.characteristics,
                    keyPath: "system.characteristic.value"
                }
            }],
        ]);
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

        if (actor?.type == "character" && foundry.utils.getProperty(options.changed, "system.advances.value") && !options.skipExperienceChecks)
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
        await super._preCreate(data, options, user);
        await this._handleSpecialisationChoice(data, options, user);
        return this._handleSkillMerging(data, options,user);
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

    async _handleSpecialisationChoice(data, options, user)
    {
        if (this.parent.isEmbedded && !options.skipSpecialisationChoice)
        {
            // If skill has (any) or (), ask for a specialisation
            if (this.parent.specifier.toLowerCase() == game.i18n.localize("SPEC.Any").toLowerCase() || (this.isGrouped && !(this.parent.specifier)))
            {
                let skills = await warhammer.utility.findAllItems("skill", game.i18n.localize("SHEET.LoadingSkills"), true);
                let specialisations = skills.filter(i => i.name.split("(")[0]?.trim() == this.parent.baseName);
                let effects = [];

                // if specialisations are found, prompt it, if not, skip to value dialog
                let choice = specialisations.length > 0 ? await ItemDialog.create(specialisations, 1, {title : game.i18n.localize("SHEET.SkillSpecialization"), text : game.i18n.localize("SHEET.SkillSpecializationText")}) : []
                let newName = ""
                if (choice[0])
                {
                    // Need to fetch the item to get effects...
                    let chosenSkill = await fromUuid(choice[0].uuid);
                    newName = chosenSkill.name;
                    effects = chosenSkill.effects?.contents.map(i => i.toObject());
                }
                else 
                {
                    newName = this.parent.baseName + ` (${await ValueDialog.create({text: game.i18n.localize("SHEET.SkillSpecializationEnter"), title : game.i18n.localize("SHEET.SkillSpecialization")})})`;

                }

                if (newName)
                {
                    this._handleSkillNameChange(newName, this.parent.name, options.career)
                    this.parent.updateSource({name : newName, effects})
                }
            }
        }
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
    
    _handleSkillMerging(data, options, user)
    {
        if (this.parent.isEmbedded && this.parent.actor.inCollection) // prevent error during chargen
        {
            let actor = this.parent.actor;

            let existing = actor.itemTags.skill.find(i => i.name == this.parent.name);

            if (existing)
            {
                existing.update({"system.advances.value" : existing.advances.value + this.advances.value}, options);
            }
        }
    }

    
    async allowCreation(data, options, user)
    {
        let allowed = super.allowCreation(data, options, user)
        if (allowed && this.parent.isEmbedded && this.advances.value != 0)
        {
            let actor = this.parent.actor;
            let existing = actor.itemTags.skill.find(i => i.name == this.parent.name);
            allowed = !existing
        }
        return allowed
    }

    chatData() {
        let properties = []
        properties.push(this.advanced == "adv" ? `<b>${game.i18n.localize("Advanced")}</b>` : `<b>${game.i18n.localize("Basic")}</b>`)
        return properties;
    }
    
}