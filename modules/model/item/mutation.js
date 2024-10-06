import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class MutationModel extends BaseItemModel
{
    static defineSchema() 
    {
        // Patron Fields
        let schema = super.defineSchema();
        schema.mutationType = new fields.SchemaField({
            value : new fields.StringField(),
        });
        
        schema.modifier = new fields.SchemaField({
            value : new fields.StringField(),
        })

        schema.modifiesSkills = new fields.SchemaField({
            value : new fields.BooleanField(),
        });

        return schema;
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