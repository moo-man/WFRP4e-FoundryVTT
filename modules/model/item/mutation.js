import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class MutationModel extends BaseItemModel
{
    static LOCALIZATION_PREFIXES = ["WH.Models.mutation"];

    static defineSchema() 
    {
        // Patron Fields
        let schema = super.defineSchema();
        schema.mutationType = new fields.SchemaField({
            value : new fields.StringField({choices : game.wfrp4e.config.mutationTypes}),
        });
        
        schema.modifier = new fields.SchemaField({
            value : new fields.StringField(),
        })
        return schema;
    }

    static get compendiumBrowserFilters() {
      return new Map([
        ...Array.from(super.compendiumBrowserFilters),
        ["mutationType", {
          label: this.LOCALIZATION_PREFIXES + ".FIELDS.mutationType.value.label",
          type: "set",
          config: {
            choices : game.wfrp4e.config.mutationTypes,
            keyPath: "system.mutationType.value"
          }
        }],
        ["mutationModifier", {
          label: this.LOCALIZATION_PREFIXES + ".FIELDS.modifier.value.label",
          type: "text",
          config: {
            keyPath: "system.modifier.value"
          }
        }]
      ]);
    }

    /**
     * Used to identify an Item as one being a child or instance of MutationModel
     *
     * @final
     * @returns {boolean}
     */
    get isMutation() {
      return true;
    }

    async expandData(htmlOptions) {
        let data = await super.expandData(htmlOptions);
        data.properties.push(game.wfrp4e.config.mutationTypes[this.mutationType.value]);
        if (this.modifier.value)
          data.properties.push(this.modifier.value)
        return data;
      }

      chatData() {
        let properties = [
          `<b>${game.i18n.localize("ITEM.MutationType")}</b>: ${game.wfrp4e.config.mutationTypes[this.mutationType.value]}`,
        ];
        if (this.modifier.value)
          properties.push(`<b>${game.i18n.localize("Modifier")}</b>: ${this.modifier.value}`)
        return properties;
      }
    
}