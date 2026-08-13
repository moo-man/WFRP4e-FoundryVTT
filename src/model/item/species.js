import { BaseItemModel } from "./components/base";

export class SpeciesModel extends BaseItemModel
{
  static LOCALIZATION_PREFIXES = ["WH.Models.species"];
  static defineSchema() 
  {
        let fields = foundry.data.fields;
        let schema = super.defineSchema();

        schema.characteristics = new fields.SchemaField({
          ws: new SpeciesCharacteristic(),
          bs: new SpeciesCharacteristic(),
          s: new SpeciesCharacteristic(),
          t: new SpeciesCharacteristic(),
          i: new SpeciesCharacteristic(),
          ag: new SpeciesCharacteristic(),
          dex: new SpeciesCharacteristic(),
          int: new SpeciesCharacteristic(),
          wp: new SpeciesCharacteristic(),
          fel: new SpeciesCharacteristic()
        })

        // schema.woundFormula = new fields.StringField()

        schema.fate = new fields.NumberField({min: 0});
        schema.resilience = new fields.NumberField({min: 0});
        schema.extra = new fields.NumberField({min: 0});

        schema.movement = new fields.NumberField({min: 0, initial: 4});

        schema.skills = ListModel.createListModel(new fields.StringField());
        schema.talents = new fields.SchemaField({
          choices : new foundry.data.fields.EmbeddedDataField(ChoiceModel, {restrictType: ["talent"]}),
          random: new foundry.data.fields.NumberField({min: 0, integer: true})
        })

        schema.size = new fields.StringField({choices: game.wfrp4e.config.actorSizes, initial: "avg"})

        schema.subspeciesOf = new fields.EmbeddedDataField(DocumentReferenceModel);


        schema.keys = new fields.ArrayField(new fields.StringField());

        schema.tables = new fields.SchemaField({
          talents : new fields.EmbeddedDataField(DocumentReferenceModel),
          eye : new fields.EmbeddedDataField(DocumentReferenceModel),
          hair : new fields.EmbeddedDataField(DocumentReferenceModel),
          career: new fields.EmbeddedDataField(DocumentReferenceModel)
        })

        return schema;
    }

    async compileSpecies()
    {
        let parentSpecies = await this.subspeciesOf.document;
      if (parentSpecies)
      {
        let species = foundry.utils.flattenObject(this.parent.toObject());
        parentSpecies = foundry.utils.flattenObject(parentSpecies.toObject());

        // mergeObject doesn't overwrite null values, so if this subspecies doesn't define a value, take from the parent
        for(let key in species)
        {
          if (foundry.utils.isEmpty(species[key]))
          {
            species[key] = parentSpecies[key]
          }
        }

        return new Item.implementation(foundry.utils.expandObject(species))
      }
      else return this
    }
}


class SpeciesCharacteristic extends foundry.data.fields.SchemaField
{
  constructor() {
    super({
      base: new foundry.data.fields.NumberField({min: 0, initial: 20}),
      dice: new foundry.data.fields.NumberField({min: 0, initial: 2})
    })
  }

}