import Advancement from "../../system/advancement";
import ActiveEffectWFRP4e from "../../system/effect-wfrp4e";
import WFRP_Utility from "../../system/utility-wfrp4e";
import { OvercastItemModel } from "./components/overcast";
let fields = foundry.data.fields;

export class SpellModel extends OvercastItemModel {
    static LOCALIZATION_PREFIXES = ["WH.Models.spell"];

    static defineSchema() {
        let schema = super.defineSchema();

        schema.lore = new fields.SchemaField({
            value: new fields.StringField(),
            effectString: new fields.StringField(),
        });
        schema.range = new fields.SchemaField({
            value: new fields.StringField(),
            vortex: new fields.BooleanField(),
        });
        schema.target = new fields.SchemaField({
            value: new fields.StringField(),
            aoe: new fields.BooleanField(),
        });
        schema.duration = new fields.SchemaField({
            value: new fields.StringField(),
            extendable: new fields.BooleanField(),
        });
        schema.damage = new fields.SchemaField({
            dice: new fields.StringField(),
            value: new fields.StringField(),
        });
        schema.cn = new fields.SchemaField({
            value: new fields.NumberField(),
            SL: new fields.NumberField(),
        });
        schema.magicMissile = new fields.SchemaField({
            value: new fields.BooleanField(),
        });
        schema.ritual = new fields.SchemaField({
            value: new fields.BooleanField(),
            type: new fields.StringField(),
            xp: new fields.NumberField(),
        });
        schema.memorized = new fields.SchemaField({
            value: new fields.BooleanField(),
        });
        schema.skill = new fields.SchemaField({
            value: new fields.StringField(),
        });
        schema.ingredients = new fields.ArrayField(new fields.StringField());
        schema.currentIng = new fields.SchemaField({
            value: new fields.StringField(),
        });
        schema.wind = new fields.SchemaField({
            value: new fields.StringField(),
        });
        return schema;
    }

    static get compendiumBrowserFilters() {
      return new Map([
        ...Array.from(super.compendiumBrowserFilters),
        ["lore", {
          label: this.LOCALIZATION_PREFIXES + ".FIELDS.lore.value.label",
          type: "set",
          config: {
            blank: "None",
            choices : game.wfrp4e.config.magicLores,
            keyPath: "system.lore.value"
          }
        }],
        ["range", {
          label: this.LOCALIZATION_PREFIXES + ".FIELDS.range.value.label",
          type: "text",
          config: {
            keyPath: "system.range.value"
          }
        }],
        ["target", {
          label: this.LOCALIZATION_PREFIXES + ".FIELDS.target.value.label",
          type: "text",
          config: {
            keyPath: "system.target.value"
          }
        }],
        ["aoe", {
          label: this.LOCALIZATION_PREFIXES + ".FIELDS.target.aoe.label",
          type: "boolean",
          config: {
            keyPath: "system.target.aoe"
          }
        }],
        ["duration", {
          label: this.LOCALIZATION_PREFIXES + ".FIELDS.duration.value.label",
          type: "text",
          config: {
            keyPath: "system.duration.value"
          }
        }],
        ["magicMissile", {
          label: this.LOCALIZATION_PREFIXES + ".FIELDS.magicMissile.value.label",
          type: "boolean",
          config: {
            keyPath: "system.magicMissile.value",
          }
        }],
        ["ritual", {
          label: this.LOCALIZATION_PREFIXES + ".FIELDS.ritual.value.label",
          type: "boolean",
          config: {
            keyPath: "system.ritual.value",
          }
        }],
        ["doesDamage", {
          label: "SHEET.DoesDamage",
          type: "boolean",
          config: {
            keyPath: "system.damage",
            valueGetter: (data) => !!data.system.damage?.value?.length || !!data.system.damage?.dice?.length,
          }
        }],
      ]);
    }

    async _preUpdate(data, options, user)
    {
      await super._preUpdate(data, options, user)
      if (foundry.utils.hasProperty(options.changed, "system.cn.SL"))
      {
          data.system.cn.SL = Math.max(data.system.cn.SL, 0);
      }
    }

    /**
     * Used to identify an Item as one being a child or instance of SpellModel
     *
     * @final
     * @returns {boolean}
     */
    get isSpell() {
      return true;
    }

    get ingredient() {
        if (this.currentIng.value)
          return this.parent.actor?.items.get(this.currentIng.value)
      }


      get ingredientList() {
        return this.parent.actor?.itemTags["trapping"].filter(t => t.trappingType.value == "ingredient" && t.spellIngredient.value == this.parent.id)
      }

      get Target() {
        return this.computeSpellPrayerFormula("target", this.target.aoe)
      }

      get Duration() {
        let duration = this.computeSpellPrayerFormula("duration", this.range?.aoe)
        if (this.duration?.extendable)
          duration += "+"
        return duration
      }

      get Range() {
          return this.computeSpellPrayerFormula("range")
      }

      get Damage() {
        return parseInt(this.computeSpellDamage(this.damage.value, this.magicMissile.value) || 0)
      }    
    
    

    async _preCreate(data, options, user) {
        await super._preCreate(data, options, user);

        if (this.parent.isOwned) {
            let actor = this.parent.actor;
            if (actor.type != "character" && actor.type != "vehicle") {
                this.updateSource({"memorized.value" : true});
            }

            if (actor.type == "character" && (this.lore.value == "petty" || this.lore.value == game.i18n.localize("WFRP4E.MagicLores.petty"))) {
                Advancement.memorizeCostDialog(this.parent, actor)
            }
        }
    }

    computeBase() {
        let lore = foundry.utils.deepClone(game.wfrp4e.config.loreEffects[this.lore.value])
        if (lore) {
            foundry.utils.setProperty(lore, "flags.wfrp4e.path", "system.lore.effect");
            this.lore.effect = new ActiveEffectWFRP4e(lore, { parent: this.parent });
        }
        this._addSpellDescription();
    }

    computeOwned()
    {
        this.cn.value = this.memorized.value ? this.cn.value : this.cn.value * 2;
        if (this.ritual?.value && !this.memorized.value)
        {
          this.cn.value *= 2; // Unmemorized rituals are 4 * CN
        }
        else 
        {
          this.computeOvercastingData();
        }
    }


    getSkillToUse(actor) 
    {
        actor = actor || this.parent.actor;
        let skills = actor?.itemTags["skill"] || []
        let skill
        // Use skill override, if not found, use Language (Magick)
        if (this.skill.value)
        {
            skill = skills.find(i => i.name.toLowerCase() == this.skill.value.toLowerCase())
        }
        if (!skill)
        {
            skill = skills.find(i => i.name.toLowerCase() == `${game.i18n.localize("NAME.Language")} (${game.i18n.localize("SPEC.Magick")})`.toLowerCase())
        }
        return skill
    }

    getOtherEffects()
    {
        return super.getOtherEffects().concat(this.lore.effect || [])
    }

    /**
    * Augments the spell item's description with the lore effect
    * 
    * The spell's lore is added at the end of the spell's description for
    * an easy reminder. However, this causes issues because we don't want
    * the lore to be 'saved' in the description. So we append the lore
    * if it does not already exist
    * 
    * @param {Object} spell 'spell' type item
    */
    _addSpellDescription() {
        let description = this.description.value;
        if (description && description.includes(game.i18n.localize("SPELL.Lore")))
            return description

        // Use lore override if it exists
        if (this.lore.effectString)
            description += `<p>\n\n <b>${game.i18n.localize("SPELL.Lore")}</b> ${this.lore.effectString}<p>`;
        // Otherwise, use config value for lore effect
        else if (game.wfrp4e.config.loreEffectDescriptions && game.wfrp4e.config.loreEffectDescriptions[this.lore.value])
            description += `<p>\n\n <b>${game.i18n.localize("SPELL.Lore")}</b> ${game.wfrp4e.config.loreEffectDescriptions[this.lore.value]}<p>`;

        this.description.value = description
    }


    async expandData(htmlOptions) {
        let data = await super.expandData(htmlOptions);
        data.properties.push(`${game.i18n.localize("Range")}: ${this.Range}`);
        let target = this.Target;
        if (target?.includes("AoE"))
          target = `<a class='aoe-template' data-id="${this.id}" data-actor-id="${this.parent.actor.id}"><i class="fas fa-ruler-combined"></i>${target}</a>`
        data.properties.push(`${game.i18n.localize("Target")}: ${target}`);
        data.properties.push(`${game.i18n.localize("Duration")}: ${this.Duration}`);
        if (this.magicMissile.value)
          data.properties.push(`${game.i18n.localize("Magic Missile")}: +${this.Damage}`);
        else if (this.damage.value || this.damage.dices) {
          let damage = this.Damage || "";
          if (this.damage.dice)
            damage += " + " + this.damage.dice
          data.properties.push(`${game.i18n.localize("Damage")}: ${damage}`);
        }
        return data;
      }

      chatData() {
        let properties = [];
        if (game.wfrp4e.config.magicLores[this.lore.value])
          properties.push(`<b>${game.i18n.localize("Lore")}</b>: ${game.wfrp4e.config.magicLores[this.lore.value]}`);
        else
          properties.push(`<b>${game.i18n.localize("Lore")}</b>: ${this.lore.value}`);
        properties.push(`<b>${game.i18n.localize("CN")}</b>: ${this.cn.value}`);
        properties.push(`<b>${game.i18n.localize("Range")}</b>: ${this.range.value}`);
        properties.push(`<b>${game.i18n.localize("Target")}</b>: ${this.target.value}`);
        properties.push(`<b>${game.i18n.localize("Duration")}</b>: ${this.duration.value}`);
        if (this.damage.value)
          properties.push(`<b>${game.i18n.localize("Damage")}</b>: ${this.damage.value}`);
    
        return properties;
      }


}