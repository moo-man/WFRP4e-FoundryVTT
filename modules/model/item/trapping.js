import { PhysicalItemModel } from "./components/physical";
import PropertiesMixin from "./components/properties";
let fields = foundry.data.fields;

export class TrappingModel extends PropertiesMixin(PhysicalItemModel)
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.trappingType = new fields.SchemaField({
            value: new fields.StringField()
        }),
        schema.spellIngredient = new fields.SchemaField({
            value: new fields.StringField()
        })
        schema.worn = new fields.BooleanField()
        return schema;
    }

    get isEquipped() {

        return this.worn
    }

    async preCreateData(data, options, user)
    {
       let preCreateData = await super.preCreateData(data, options, user);

       if (this.trappingType == "clothingAccessories" && this.parent.isOwned && this.parent.actor.type != "character" && this.parent.actor.type != "vehicle")
       {
          foundry.utils.setProperty(preCreateData, "system.worn", true); // TODO: migrate this into a unified equipped property
       }
           
       return preCreateData;
    }

    shouldTransferEffect(effect)
    {
        return super.shouldTransferEffect(effect) && (!effect.applicationData.equipTransfer || this.isEquipped)
    }

    toggleEquip()
    {
        return this.parent.update({"system.worn" : !this.isEquipped})
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

}