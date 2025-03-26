import PropertiesMixin from "./components/properties";
import {EquippableItemModel} from "./components/equippable.js";
let fields = foundry.data.fields;

/**
 *
 * @extends EquippableItemModel
 * @mixes PropertiesMixin
 */
export class TrappingModel extends PropertiesMixin(EquippableItemModel)
{
    static LOCALIZATION_PREFIXES = ["WH.Models.trapping"];
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.trappingType = new fields.SchemaField({
            value: new fields.StringField({choices: game.wfrp4e.config.trappingTypes})
        }),
        schema.spellIngredient = new fields.SchemaField({
            value: new fields.StringField()
        })
        return schema;
    }

    static get compendiumBrowserFilters() {
      return new Map([
        ...Array.from(super.compendiumBrowserFilters),
        ["trappingType", {
          label: this.LOCALIZATION_PREFIXES + ".FIELDS.trappingType.value.label",
          type: "set",
          config: {
            choices : game.wfrp4e.config.trappingTypes,
            keyPath: "system.trappingType.value"
          }
        }]
      ]);
    }

    /**
     * Used to identify an Item as one being a child or instance of TrappingModel
     *
     * @final
     * @returns {boolean}
     */
    get isTrapping() {
      return true;
    }

    async _preCreate(data, options, user)
    {
       await super._preCreate(data, options, user);

       if (this.trappingType == "clothingAccessories" && this.parent.isOwned && this.parent.actor.type != "character" && this.parent.actor.type != "vehicle")
       {
        this.updateSource({"worn" : true}); // TODO: migrate this into a unified equipped property
       }
    }

    get worn() {
      console.warn("[DEPRECATION] `container.worn` is deprecated, please use `container.equipped.value` instead");
      return this.equipped.value;
    }
  
    get weighsLessEquipped() {
      return true;
    }
  
    get canEquip() {
      return this.trappingType.value === "clothingAccessories";
    }

    async expandData(htmlOptions) {
        let data = await super.expandData(htmlOptions);
    
        let itemProperties = this.Qualities.concat(this.Flaws)
        for (let prop of itemProperties)
          data.properties.push("<a class ='item-property'>" + prop + "</a>")
    
        return data;
      }

      chatData() {
        let properties = [
          `<b>${game.i18n.localize("ITEM.TrappingType")}</b>: ${game.wfrp4e.config.trappingCategories[this.trappingType.value]}`,
          `<b>${game.i18n.localize("Price")}</b>: ${this.price.gc || 0} ${game.i18n.localize("MARKET.Abbrev.GC")}, ${this.price.ss || 0} ${game.i18n.localize("MARKET.Abbrev.SS")}, ${this.price.bp || 0} ${game.i18n.localize("MARKET.Abbrev.BP")}`,
          `<b>${game.i18n.localize("Encumbrance")}</b>: ${this.encumbrance.value}`,
          `<b>${game.i18n.localize("Availability")}</b>: ${game.wfrp4e.config.availability[this.availability.value] || "-"}`
        ]
    
        // Make qualities and flaws clickable
        if (this.qualities.value.length)
          properties.push(`<b>${game.i18n.localize("Qualities")}</b>: ${this.OriginalQualities.map(i => i = "<a class ='item-property'>" + i + "</a>").join(", ")}`);
    
        if (this.flaws.value.length)
          properties.push(`<b>${game.i18n.localize("Flaws")}</b>: ${this.OriginalFlaws.map(i => i = "<a class ='item-property'>" + i + "</a>").join(", ")}`);
    
        return properties;
      }

    static migrateData(data)
    {
      super.migrateData(data);

      if (data.worn) {
        data.equipped = {value: data.worn};
      }
    }
}