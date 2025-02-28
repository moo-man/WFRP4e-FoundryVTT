import { PhysicalItemModel } from "./components/physical";
let fields = foundry.data.fields;

export class VehicleModModel extends PhysicalItemModel
{
    static LOCALIZATION_PREFIXES = ["WH.Models.vehicleMod"];

    static metadata = Object.freeze(foundry.utils.mergeObject(super.metadata, {
      isVehicle: true
    }, {inplace: false}));

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.modType = new fields.SchemaField({
            value : new fields.StringField({choices: game.wfrp4e.config.modTypes})
        })
        return schema;
    }

    static get compendiumBrowserFilters() {
      return new Map([
        ...Array.from(super.compendiumBrowserFilters),
        ["modType", {
          label: this.LOCALIZATION_PREFIXES + ".FIELDS.modType.value.label",
          type: "set",
          config: {
            choices : game.wfrp4e.config.modTypes,
            keyPath: "system.modType.value"
          }
        }]
      ]);
    }

    /**
     * Used to identify an Item as one being a child or instance of VehicleModModel
     *
     * @final
     * @returns {boolean}
     */
    get isVehicleMod() {
      return true;
    }

    async expandData(htmlOptions) {
        let data = await super.expandData(htmlOptions);
        data.properties = [game.wfrp4e.config.modTypes[this.modType.value]];
        return data;
      }

      chatData() {
        let properties = [
          `<b>${game.i18n.localize("VEHICLE.ModType")}</b>: ${game.wfrp4e.config.modTypes[this.modType.value]}`,
          `<b>${game.i18n.localize("Price")}</b>: ${this.price.gc || 0} ${game.i18n.localize("MARKET.Abbrev.GC")}, ${this.price.ss || 0} ${game.i18n.localize("MARKET.Abbrev.SS")}, ${this.price.bp || 0} ${game.i18n.localize("MARKET.Abbrev.BP")}`,
          `<b>${game.i18n.localize("Encumbrance")}</b>: ${this.encumbrance.value}`,
        ]
        return properties
      }
}