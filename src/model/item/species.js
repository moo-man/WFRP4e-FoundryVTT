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
        schema.talents = new fields.EmbeddedDataField(SpeciesTalents);

        schema.size = new fields.StringField({choices: game.wfrp4e.config.actorSizes, initial: "avg"})

        schema.subspeciesOf = new fields.EmbeddedDataField(DocumentReferenceModel);

        schema.careers = new fields.EmbeddedDataField(DocumentReferenceModel);

        schema.keys = new fields.ArrayField(new fields.StringField());

        return schema;
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

class SpeciesTalents extends foundry.abstract.DataModel
{
  static defineSchema()
  {
    return {
      choices : new foundry.data.fields.EmbeddedDataField(ChoiceModel, {restrictType: ["talent"]}),
      table: new foundry.data.fields.EmbeddedDataField(DocumentReferenceModel),
      random: new foundry.data.fields.NumberField({min: 0, integer: true})
    }

  }
}