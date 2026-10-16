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
        incomeSkill: new fields.ArrayField(new fields.NumberField())
      }

      return schema;
  }

  get img()
  {
    return this.parent.parent.img;
  }

  get availableCharacteristics()
  {
    return Object.keys(this.parent.characteristics).filter(ch => this.parent.characteristics[ch] <= this.level);
  }

  get availableSkills()
  {
    if (this.level > 1)
    {
      return this.skills.concat(this.parent.getTier(this.level - 1).availableSkills);
    }
    else if (this.level == 1)
    {
      return this.skills;
    }
  }

  get availableTalents()
  {
    if (this.level > 1)
    {
      return this.talents.concat(this.parent.getTier(this.level - 1).availableTalents);
    }
    else if (this.level == 1)
    {
      return this.talents;
    }
  }

  get advancementsNeeded()
  {
      return 8 + (2 * this.level || 1);
  }

  get advancement()
  {
    return this.parent.parent.actor.system.career.advancements[this.advancementPath]?.list || [];
  }

  get advancementPath()
  {
    return `${this.parent.id}-${this.id}`;
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

  async changeSkillName(newName, oldName, skipPrompt) {
    this.parent.changeSkillName(newName, oldName, this.id, skipPrompt);
  }

}