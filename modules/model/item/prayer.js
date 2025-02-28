import Advancement from "../../system/advancement";
import WFRP_Utility from "../../system/utility-wfrp4e";
import { OvercastItemModel } from "./components/overcast";
let fields = foundry.data.fields;

export class PrayerModel extends OvercastItemModel
{
    static LOCALIZATION_PREFIXES = ["WH.Models.prayer"];

    static defineSchema() 
    {
        let schema = super.defineSchema();

        schema.type = new fields.SchemaField({
            value : new fields.StringField({initial : "blessing", choices : game.wfrp4e.config.prayerTypes}),
        });
        schema.god = new fields.SchemaField({
            value : new fields.StringField(),
        });             
        schema.range = new fields.SchemaField({
            value : new fields.StringField(),
        });
        schema.target = new fields.SchemaField({
            value : new fields.StringField(),
            aoe : new fields.BooleanField(),
            extendableAoE : new fields.BooleanField(),
        });
        schema.duration = new fields.SchemaField({
            value : new fields.StringField(),
            extendable : new fields.BooleanField(),
        });
        schema.damage = new fields.SchemaField({
            dice : new fields.StringField(),
            value : new fields.StringField(),
            addSL : new fields.BooleanField(),
        });
        return schema;
    }

    static get compendiumBrowserFilters() {
      return new Map([
        ...Array.from(super.compendiumBrowserFilters),
        ["prayerType", {
          label: this.LOCALIZATION_PREFIXES + ".FIELDS.type.value.label",
          type: "set",
          config: {
            choices : game.wfrp4e.config.prayerTypes,
            keyPath: "system.type.value"
          }
        }],
        ["god", {
          label: this.LOCALIZATION_PREFIXES + ".FIELDS.god.value.label",
          type: "text",
          config: {
            keyPath: "system.god.value"
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

    /**
     * Used to identify an Item as one being a child or instance of PrayerModel
     *
     * @final
     * @returns {boolean}
     */
    get isPrayer() {
      return true;
    }

    get Target() {
        return this.computeSpellPrayerFormula("target", this.target.aoe)
      }


    get Duration() {
      let duration = this.computeSpellPrayerFormula("duration", this.range?.aoe)
      return duration
    }

      get Range() {
        return this.computeSpellPrayerFormula("range")
    }

    get Damage() {
        return parseInt(this.computeSpellDamage(this.damage.value, false) || 0)
      }

      get DamageString() {
        let string = this.Damage
    
        if (this.damage.dice)
          string += `+ ${this.damage.dice}`

        return string
      }
  

    async _preCreate(data, options, user) 
    {
      await super._preCreate(data, options, user);

        if (this.parent.isOwned) 
        {
            let actor = this.parent.actor;
            if (actor.type == "character" && this.type.value == "miracle") {
                Advancement.miracleGainedDialog(this.parent, actor)
            }
        }
    }

    computeOwned()
    {
        super.computeOwned();
        this.computeOvercastingData();
    }

    getSkillToUse(actor) {
      actor = actor || this.parent.actor;
      let skills = actor?.itemTags["skill"] || []
      let skill = skills.find(i => i.name.toLowerCase() == game.i18n.localize("NAME.Pray").toLowerCase())
      return skill;
    }


    async expandData(htmlOptions) {
        let data = await super.expandData(htmlOptions);
        data.properties.push(`${game.i18n.localize("Range")}: ${this.Range}`);
        data.properties.push(`${game.i18n.localize("Target")}: ${this.Target}`);
        data.properties.push(`${game.i18n.localize("Duration")}: ${this.Duration}`);
        let damage = this.Damage || "";
        if (this.damage.dice)
          damage += " + " + this.damage.dice
        if (this.damage.addSL)
          damage += " + " + game.i18n.localize("SL")
        if (this.damage.value)
          data.properties.push(`${game.i18n.localize("Damage")}: ${this.DamageString}`);
        return data;
      }

      chatData() {
        let properties = [];
        properties.push(`<b>${game.i18n.localize("Range")}</b>: ${this.range.value}`);
        properties.push(`<b>${game.i18n.localize("Target")}</b>: ${this.target.value}`);
        properties.push(`<b>${game.i18n.localize("Duration")}</b>: ${this.duration.value}`);
        if (this.damage.value)
          properties.push(`<b>${game.i18n.localize("Damage")}</b>: ${this.damage.value}`);
        return properties;
      }
    
}