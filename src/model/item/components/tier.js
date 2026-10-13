let fields = foundry.data.fields;

export class CareerTier extends foundry.abstract.DataModel
{
static LOCALIZATION_PREFIXES = ["WH.Models.careerTier"];
  static defineSchema() 
  {
      let schema = {
        name: new fields.StringField({}),
        level: new fields.NumberField({min: 1}),
        status: new fields.SchemaField({
          standing: new fields.NumberField({min: 1}),
          tier: new fields.StringField({choices: game.wfrp4e.config.statusTiers})
        }),
        skills: new fields.ArrayField(new fields.StringField()),
        talents: new fields.ArrayField(new fields.StringField()),
        trappings: new fields.EmbeddedDataField(ChoiceModel),
        incomeSkill: new fields.ArrayField(new fields.StringField())
      }

      return schema;
  }

  async _preCreate(data, options, user)
  {
    if (!data.level)
    {
        data.level = Object.keys(this.parent.tiers).length + 1;
    }
  }

  async _preUpdate(data, options, user)
  {
    // If the last skill inputted has commas, separate them into their own array elements
    let skills = data.skills;
    if (skills && skills[skills.length - 1]?.includes(","))
    {
        data.skills = skills.slice(0, skills.length - 1).concat(skills[skills.length - 1].split(",").map(i => i.trim()));
    }
  }
}