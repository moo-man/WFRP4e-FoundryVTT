import { BaseItemModel } from "./components/base";

export class TemplateModel extends BaseItemModel
{
  static LOCALIZATION_PREFIXES = ["WH.Models.template"];
  static defineSchema() 
  {
        let fields = foundry.data.fields;
        let schema = super.defineSchema();

        schema.alterName = new fields.SchemaField({
          pre : new fields.StringField(),
          post : new fields.StringField()
        })

        schema.characteristics = new fields.SchemaField({
          ws: new fields.NumberField(),
          bs: new fields.NumberField(),
          s: new fields.NumberField(),
          t: new fields.NumberField(),
          i: new fields.NumberField(),
          ag: new fields.NumberField(),
          dex: new fields.NumberField(),
          int: new fields.NumberField(),
          wp: new fields.NumberField(),
          fel: new fields.NumberField(),
        })

        schema.skills = ListModel.createListModel(new fields.SchemaField({
          name : new fields.StringField({}),
          advances : new fields.NumberField({}),
          group : new fields.NumberField({})
        }))

        schema.talents = ListModel.createListModel(new fields.SchemaField({
          name : new fields.StringField({}),
          advances : new fields.NumberField({}),
          group : new fields.NumberField({})
        }))

        schema.traits = new fields.EmbeddedDataField(DiffReferenceListModel);

        schema.trappings = new fields.EmbeddedDataField(ChoiceModel);
    
        return schema;
    }

    /**
     * Used to identify an Item as one being a child or instance of TraitModel
     *
     * @final
     * @returns {boolean}
     */
    get isTemplate() {
      return true;
  }
}