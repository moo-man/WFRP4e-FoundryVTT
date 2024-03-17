import { PhysicalItemModel } from "./components/physical";
let fields = foundry.data.fields;

export class CargoModel extends PhysicalItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.cargoType = new fields.SchemaField({
            value: new fields.StringField()
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
        return schema;
    }

    computeBase()
    {
        super.computeBase();
        if (this.cargoType.value != "wine" && this.cargoType.value != "brandy")
        {
            this.quality.value = "average"
        }
    }

    async expandData(htmlOptions) {
        let data = await super.expandData(htmlOptions);
    
        if (this.origin.value)
          data.properties.push(`<b>${game.i18n.localize("ITEM.Origin")}</b>: ${this.origin.value}`)
    
        if (game.wfrp4e.config.trade.cargoTypes)
          data.properties.push(`<b>${game.i18n.localize("ITEM.CargoType")}</b>: ${game.wfrp4e.config.trade.cargoTypes[this.cargoType.value]}`)
    
        if (game.wfrp4e.config.trade.qualities && (this.cargoType.value == "wine" || this.cargoType.value == "brandy"))
          data.properties.push(`<b>${game.i18n.localize("ITEM.CargoQuality")}</b>: ${game.wfrp4e.config.trade.qualities[this.quality.value]}`)
    
        return data;
      }

      chatData() {
        let properties = []
    
        if (this.origin.value)
          properties.push(`<b>${game.i18n.localize("ITEM.Origin")}</b>: ${this.origin.value}`)
    
        if (game.wfrp4e.config.trade.cargoTypes)
          properties.push(`<b>${game.i18n.localize("ITEM.CargoType")}</b>: ${game.wfrp4e.config.trade.cargoTypes[this.cargoType.value]}`)
    
        if (game.wfrp4e.config.trade.qualities && (this.cargoType.value == "wine" || this.cargoType.value == "brandy"))
          properties.push(`<b>${game.i18n.localize("ITEM.CargoQuality")}</b>: ${game.wfrp4e.config.trade.qualities[this.quality.value]}`)
        return properties;
      }
    
}