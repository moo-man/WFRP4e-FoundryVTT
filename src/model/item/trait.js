import PropertiesMixin from "./components/properties";
import { BaseItemModel } from "./components/base";
import TestDataModel from "./components/test";
import SpendModel from "./components/spend";
let fields = foundry.data.fields;

export class TraitModel extends PropertiesMixin(BaseItemModel)
{
    static LOCALIZATION_PREFIXES = ["WH.Models.trait"];
    static defineSchema() 
    {
        let schema = super.defineSchema();

        schema.category = new fields.StringField({initial : "standard", choices : {standard : game.i18n.localize("ITEM.Standard"), vehicle : game.i18n.localize("SPEC.Vehicle")}});

        schema.spend = new fields.EmbeddedDataField(SpendModel);
        schema.test = new fields.EmbeddedDataField(TestDataModel);
        schema.attack = new fields.SchemaField({
          type : new fields.StringField({initial: "", choices : {melee : game.i18n.localize("Melee"), ranged : game.i18n.localize("Ranged")}, blank: true}),
          damage: new fields.SchemaField({
            value: new fields.NumberField({nullable: true}),
            characteristic: new fields.StringField({choices : game.wfrp4e.config.characteristics,  blank: true}),
            dice : new fields.StringField(),
            SL : new fields.BooleanField({initial: true}),
          })
        })


        
        schema.specification = new fields.SchemaField({
            value : new fields.StringField(),
        });

        schema.qualities = new fields.SchemaField({
            value: new fields.ArrayField(new fields.ObjectField({}))
        });

        schema.flaws = new fields.SchemaField({
            value: new fields.ArrayField(new fields.ObjectField({}))
        });

        schema.disabled = new fields.BooleanField({initial : false});




        schema.rollable = new fields.SchemaField({
          value : new fields.BooleanField({}),
          damage : new fields.BooleanField({}),
          skill : new fields.StringField({}),
          rollCharacteristic : new fields.StringField({choices : game.wfrp4e.config.characteristics}),
          bonusCharacteristic : new fields.StringField({choices : game.wfrp4e.config.characteristics,  blank: true}),
          dice : new fields.StringField({}),
          defaultDifficulty : new fields.StringField({initial : "challenging", choices : game.wfrp4e.config.difficultyLabels}),
          SL : new fields.BooleanField({}),
          attackType : new fields.StringField({initial: "melee", choices : {melee : game.i18n.localize("Melee"), ranged : game.i18n.localize("Ranged")}})
      });

        return schema;
    }

    static get compendiumBrowserFilters() {
      return new Map([
        ...Array.from(super.compendiumBrowserFilters),
        ["category", {
          label: this.LOCALIZATION_PREFIXES + ".FIELDS.category.label",
          type: "set",
          config: {
            choices: {standard: game.i18n.localize("ITEM.Standard"), vehicle: game.i18n.localize("SPEC.Vehicle")},
            keyPath: "system.category"
          }
        }],
        ["rollable", {
          label: this.LOCALIZATION_PREFIXES + ".FIELDS.rollable.value.label",
          type: "boolean",
          config: {
            keyPath: "system.rollable.value",
          }
        }],
        ["doesDamage", {
          label: this.LOCALIZATION_PREFIXES + ".FIELDS.rollable.damage.label",
          type: "boolean",
          config: {
            keyPath: "system.rollable.damage",
          }
        }],
        ["rollCharacteristic", {
          label: this.LOCALIZATION_PREFIXES + ".FIELDS.rollable.rollCharacteristic.label",
          type: "set",
          config: {
            keyPath: "system.rollable.rollCharacteristic",
            choices : game.wfrp4e.config.characteristics
          }
        }],
        ...this.compendiumBrowserPropertiesFilter(),
      ]);
    }

    /**
     * Used to identify an Item as one being a child or instance of TraitModel
     *
     * @final
     * @returns {boolean}
     */
    get isTrait() {
      return true;
  }

    get isAttack()
    {
      return !!this.attack.type;
    }

    get enabled() {
      return !this.disabled;
    }
    
    get isMelee()
    {
        return this.attack.type == "melee";
    }

    get isRanged()
    {
        return this.attack.type == "ranged";
    }

    get attackType() {
        return this.attack.type
    }

    get DisplayName() {
      return this.Specification ? this.parent.name + " (" + this.Specification + ")" : this.parent.name;
    }

    get isRollable()
    {
      return this.test.hasSelf;
    }

    get Damage() {
      return this.Specification
    }

      get DamageString() {
        let string = ""
        string += this.attack.Damage
    
        if (this.attack.damage.dice)
          string += ` + ${this.attack.damage.dice}`
    
        return string
      }

      get mountDamage() {

        let actor = this.parent.actor
        if (!actor)
            return;

        if (this.attackType != "melee" || !actor.isMounted || !actor.mount)
        {
            return this.attack.Damage
        }
    
        if (this.attack.damage.characteristic == "s") 
        {
          return this.attack.Damage + (actor.mount.characteristics[this.attack.damage.characteristic].bonus - actor.characteristics[this.attack.bonusCharacteristic].bonus)
        }
        else
        {
            return this.attack.Damage
        }
      }

      get Specification() {

        let actor = this.parent.actor

        if (this.attack.type)
        {
          if (isNaN(this.attack.damage.value) || this.attack.damage.value == null)
          {
            return "#";
          }
          else 
          {
            return this.attack.damage.value + actor.system.characteristics[this.attack.damage.characteristic]?.bonus || 0;
          }
        }

        else return this.specification.value;
      }
    
    computeBase() 
    {
        super.computeBase();
    }
      
    getSkillToUse(actor) {
        actor = actor || this.parent.actor;
        let skills = actor?.itemTags["skill"] || []
        let skill = skills.find(i => i.name == this.attack.skill)
        return skill;
    }


    chatData() {
        let properties = [];
        if (this.specification.value)
          properties.push(`<b>${game.i18n.localize("Specification")}: </b> ${this.specification.value}`);
        return properties;
      }


    shouldTransferEffect(effect) {
        return this.enabled;
    }
}