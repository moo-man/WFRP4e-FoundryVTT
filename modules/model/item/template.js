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
          group : new fields.NumberField({nullable : true}),
          specialisations : new fields.NumberField({nullable : true})
        }))

        schema.talents = ListModel.createListModel(new fields.SchemaField({
          name : new fields.StringField({}),
          advances : new fields.NumberField({}),
          group : new fields.NumberField({nullable : true})
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

  async _onCreate(data, options, user)
  {
    await super._onCreate(data, options, user);
    if (this.parent.isEmbedded && game.user.id == user)
    {
      this.apply(this.parent.actor)
    }
  }

  async _onDelete(options, user)
  {
    await super._onDelete(options, user);
    if (this.parent.isEmbedded && game.user.id == user)
    {
      this.undo(this.parent.actor)
    }
  }

  async apply(actor)
  {
    let items = [];
    let update = {};
    update.name = `${this.alterName.pre} ${actor.name} ${this.alterName.post}`.trim();

    // If skills/talents specify groups, offer the choice for any of the same group
    let skillChoices = items.concat(await this._handleGroups(this.skills.list))
    let talentChoices = items.concat(await this._handleGroups(this.talents.list))


    // If a skill has 2 or more "specialisations" that means pick 2 specialisations
    if (skillChoices.find(i => i.specialisations > 1))
    {
      // Load all the skills, find all those with the same base name as the skill choice
      let allSkills = await warhammer.utility.findAllItems("skill", "Loading Skills")
      
      for (let skill of skillChoices)
        {
          if (skill.specialisations > 1)
          {
            let specialisations = allSkills.filter(i => i.baseName == skill.name)
            let chosen = await ItemDialog.create(specialisations, skill.specialisations, {text : `${skill.name} (any ${skill.specialisations}) +${skill.advances}`, title : this.parent.name});
            // Choose between those specialisations and add them back into the skill choices
            skillChoices = skillChoices.concat(chosen.map(i => {
              return {
                name : i.name,
                advances : skill.advances
              }
            }))
          }
        }
    }

    // Delete all skill choices with specialisations (as the chosen specialisations were added above)
    skillChoices = skillChoices.filter(i => !i.specialisations || i.specialisations <= 1)

    // Turn all skills into Items with the appropriate advances
    let skills = await Promise.all(skillChoices.map(async s => {
      let foundSkill = await game.wfrp4e.utility.findSkill(s.name);
      if (foundSkill)
      {
        foundSkill = foundSkill.toObject();
        foundSkill.system.advances.value = s.advances;
        return foundSkill
      }
    }))

    // Advanced talents just mean more talent items, so fill a second array with any extra talents 
    let advancedTalents = [];
    
    // Turn all talents into Items
    let talents = await Promise.all(talentChoices.map(async t => {
      let foundTalent = await game.wfrp4e.utility.findTalent(t.name);
      if (foundTalent)
      {
        foundTalent = foundTalent.toObject();
        if (t.advances > 1)
        {
          advancedTalents = advancedTalents.concat(Array(t.advances - 1).fill(foundTalent))
        }
        return foundTalent
      }
    }))
    talents = talents.concat(advancedTalents);

    items = items.concat(skills.filter(i => i));
    items = items.concat(talents.filter(i => i));
    items = items.concat(await this.traits.awaitDocuments())
    items = items.concat(await this.trappings.promptDecision())

    await actor.update(update);
    await actor.createEmbeddedDocuments("Item", items, {fromTemplate : this.parent.id});
  }

  async undo(actor)
  {
    await actor.deleteEmbeddedDocuments("Item", actor.items.contents.filter(i => i.getFlag("wfrp4e", "fromTemplate") == this.parent.id).map(i => i.id));
    if (this.alterName.pre && actor.name.substr(0, this.alterName.pre.length) == this.alterName.pre)
    {
      await actor.update({name : actor.name.substr(this.alterName.pre.length + 1)});
    }

    if (this.alterName.post && actor.name.substr(actor.name.length - this.alterName.post.length, this.alterName.post.length) == this.alterName.post)
    {
      await actor.update({name : actor.name.substr(0, actor.name.length - (this.alterName.post.length + 1))});
    }
  }

  getCreatedItems()
  {
    if (this.parent.isEmbedded)
    {
      return this.parent.actor.items.contents.filter(i => i.getFlag("wfrp4e", "fromTemplate") == this.parent.id)
    }
    else return [];
  }

  async _handleGroups(list)
  {
    let items = list.filter(i => !i.group);

    // Take all groups in the list and sort them into an object with the keys as the groups
    let groups = Object.fromEntries(list.map(i => i.group).filter(i => i != null).map(i => [i, []]));

    for(let group in groups)
    {
      groups[group] = list.filter(i => i.group == group);
    }

    for(let choices of Object.values(groups))
    {
      let choice = await ItemDialog.create(choices, 1, {title : this.parent.name});
      items = items.concat(choice);
    }

    return items;
  }
}