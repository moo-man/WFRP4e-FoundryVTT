import PropertiesMixin from "./components/properties";
import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class TraitModel extends PropertiesMixin(BaseItemModel)
{
    static LOCALIZATION_PREFIXES = ["WH.Models.trait"];
    static defineSchema() 
    {
        let schema = super.defineSchema();

        schema.category = new fields.StringField({initial : "standard", choices : {standard : game.i18n.localize("ITEM.Standard"), vehicle : game.i18n.localize("SPEC.Vehicle")}});

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
    
        return schema;
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

    get enabled() {
      return !this.disabled;
    }
    
    get isMelee()
    {
        return this.attackType == "melee";
    }

    get isRanged()
    {
        return this.attackType == "ranged";
    }

    get attackType() {
        if (this.rollable.damage)
          return this.rollable.attackType
      }

      get DisplayName() {
        return this.specification.value ? this.parent.name + " (" + this.Specification + ")" : this.parent.name;
      }


    get Damage() {
        let damage
        let actor = this.parent.actor
        if (this.rollable.damage)
            damage = this.Specification
    
    
        //@HOUSE
        if (game.settings.get("wfrp4e", "mooSizeDamage") && actor.sizeNum > 3) 
        {
          if (this.rollable.bonusCharacteristic == "s") 
          {
            game.wfrp4e.utility.logHomebrew("mooSizeDamage")
            let SBsToAdd = actor.sizeNum - 3
            damage += (actor.characteristics.s.bonus * SBsToAdd)
          }
    
        }
        //@/HOUSE
    
        return parseInt(damage || 0)
      }

      get DamageString() {
        let string = ""
        string += this.Damage
    
        if (this.damage.dice)
          string += `+ ${this.damage.dice}`
    
        if (this.ammo && this.ammo.damage.dice)
          string += `+ ${this.ammo.damage.dice}`
    
        return string
      }

      get mountDamage() {

        let actor = this.parent.actor
        if (!actor)
            return;

        if (this.attackType != "melee" || !actor.isMounted || !actor.mount)
        {
            return this.Damage
        }
    
        if (this.rollable.bonusCharacteristic == "s") 
        {
          return this.Damage + (actor.mount.characteristics[this.rollable.bonusCharacteristic].bonus - actor.characteristics[this.rollable.bonusCharacteristic].bonus)
        }
        else
        {
            return this.Damage
        }
      }

      get Specification() {

        let actor = this.parent.actor

        let specification
        if (this.specification.value) {
          if (this.rollable.bonusCharacteristic && this.rollable.damage)  // Bonus characteristic adds to the specification (Weapon +X includes SB for example)
          {
            specification = parseInt(this.specification.value) || 0
            if (actor)
            {
              specification += actor.characteristics[this.rollable.bonusCharacteristic].bonus;
            }
            if (this.attackType && actor)
            {
              specification += (actor.flags[`${this.attackType}DamageIncrease`] || 0)
            }
          }
          else
            specification = this.specification.value
        }
        return specification
      }
    
      get SpecificationBonus() {
        return this.parent.actor?.characteristics[this.rollable.bonusCharacteristic].bonus
      }

    computeBase() 
    {
        super.computeBase();
    }
      
    getSkillToUse(actor) {
        actor = actor || this.parent.actor;
        let skills = actor?.itemTags["skill"] || []
        let skill = skills.find(i => i.name == this.rollable.skill)
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