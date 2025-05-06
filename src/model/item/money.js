import { PhysicalItemModel } from "./components/physical";
let fields = foundry.data.fields;

export class MoneyModel extends PhysicalItemModel
{
    static LOCALIZATION_PREFIXES = ["WH.Models.money"];
    
    static defineSchema() 
    {
        // Patron Fields
        let schema = super.defineSchema();

        schema.coinValue = new fields.SchemaField({
            value : new fields.NumberField({initial: 1}),
        });

        return schema;
    }

    static get compendiumBrowserFilters() {
      return new Map([
        ...Array.from(super.compendiumBrowserFilters),
        ["coinValue", {
          label: this.LOCALIZATION_PREFIXES + ".FIELDS.coinValue.value.label",
          type: "range",
          config: {
            keyPath: "system.coinValue.value"
          }
        }],
      ]);
    }


    
  async _onUpdate(data, options, user) {
    await super._onUpdate(data, options, user);
    // If credit received from message award, update message
    if (options.updateCreditMessage && game.user.isUniqueGM && this.parent.isEmbedded)
    {
      game.messages.get(options.updateCreditMessage.id).system.updateMessage(this.parent.actor, options.updateCreditMessage.index);
      delete options.updateCreditMessage;
    }
}

  /**
   * Used to identify an Item as one being a child or instance of MoneyModel
   *
   * @final
   * @returns {boolean}
   */
  get isMoney() {
    return true;
  }

    async expandData() {
        let data = await super.expandData(htmlOptions);
        data.properties = [`${game.i18n.localize("ITEM.PenniesValue")}: ${this.coinValue.value}`];
        return data;
      }

      chatData() {
        let properties = [
          `<b>${game.i18n.localize("ITEM.PenniesValue")}</b>: ${this.coinValue.value}`,
          `<b>${game.i18n.localize("Encumbrance")}</b>: ${this.encumbrance.value}`,
        ]
        return properties;
      }
}