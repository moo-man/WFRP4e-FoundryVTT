import { PhysicalItemModel } from "./components/physical";
let fields = foundry.data.fields;

export class CargoModel extends PhysicalItemModel
{
    static LOCALIZATION_PREFIXES = ["WH.Models.cargo"];
    static defineSchema() 
    {

        let schema = super.defineSchema();
        schema.cargoType = new fields.SchemaField({
            value: new fields.StringField({})
        });
        schema.unitPrice = new fields.SchemaField({
            value: new fields.NumberField()
        });
        schema.origin = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.quality = new fields.SchemaField({
            value: new fields.StringField({initial : "average"})
        });
        schema.tradeType = new fields.StringField({initial : "river", choices : {river : "River", maritime : "Maritime"}})
        return schema;
    }

  /**
   * Used to identify an Item as one being a child or instance of CargoModel
   *
   * @final
   * @returns {boolean}
   */
  get isCargo() {
    return true;
  }

    computeBase()
    {
        super.computeBase();
        if (this.cargoType.value != "wine" && this.cargoType.value != "brandy")
        {
            this.quality.value = "average"
        }
        if (this.tradeType == "river")
        {
          this.price.gc = this.unitPrice.value * this.encumbrance.value / 10;
        }
        else if (this.tradeType == "maritime")
          {
          this.price.gc = this.unitPrice.value * this.encumbrance.value;
        }
    }

    async expandData(htmlOptions) {
        let data = await super.expandData(htmlOptions);
    
        if (this.origin.value)
          data.properties.push(`<b>${game.i18n.localize("ITEM.Origin")}</b>: ${this.origin.value}`)
    
        if (game.wfrp4e.trade.cargoTypes)
          data.properties.push(`<b>${game.i18n.localize("ITEM.CargoType")}</b>: ${game.wfrp4e.trade.cargoTypes[this.cargoType.value]}`)
    
        if (game.wfrp4e.config.trade.qualities && (this.cargoType.value == "wine" || this.cargoType.value == "brandy"))
          data.properties.push(`<b>${game.i18n.localize("ITEM.CargoQuality")}</b>: ${game.wfrp4e.config.trade.qualities[this.quality.value]}`)
    
        return data;
      }

      chatData() {
        let properties = []
    
        if (this.origin.value)
          properties.push(`<b>${game.i18n.localize("ITEM.Origin")}</b>: ${this.origin.value}`)
    
        if (game.wfrp4e.trade.cargoTypes)
          properties.push(`<b>${game.i18n.localize("ITEM.CargoType")}</b>: ${game.wfrp4e.trade.cargoTypes[this.cargoType.value]}`)
    
        if (game.wfrp4e.config.trade.qualities && (this.cargoType.value == "wine" || this.cargoType.value == "brandy"))
          properties.push(`<b>${game.i18n.localize("ITEM.CargoQuality")}</b>: ${game.wfrp4e.config.trade.qualities[this.quality.value]}`)
        return properties;
      }
    
}