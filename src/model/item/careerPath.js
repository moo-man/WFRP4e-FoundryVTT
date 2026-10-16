import { BaseItemModel } from "./components/base";
import { CareerTier } from "./components/tier";
let fields = foundry.data.fields;

export class CareerPathModel extends BaseItemModel
{
    static LOCALIZATION_PREFIXES = ["WH.Models.careerPath"];
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.class = new fields.StringField();
        schema.tiers = new fields.TypedObjectField(new fields.EmbeddedDataField(CareerTier));
        schema.characteristics = new fields.SchemaField({
          ws: new fields.NumberField({nullable: true}),
          bs: new fields.NumberField({nullable: true}),
          s: new fields.NumberField({nullable: true}),
          t: new fields.NumberField({nullable: true}),
          i: new fields.NumberField({nullable: true}),
          ag: new fields.NumberField({nullable: true}),
          dex: new fields.NumberField({nullable: true}),
          int: new fields.NumberField({nullable: true}),
          wp: new fields.NumberField({nullable: true}),
          fel: new fields.NumberField({nullable: true}),
        });
        return schema;
    }
      /**
   * Used to identify an Item as one being a child or instance of CareerModel
   *
   * @final
   * @returns {boolean}
   */
  get isCareerPath() {
    return true;
  }

  getTier(tier)
  {
    if (typeof tier == "number")
    {
      return Object.values(this.tiers).find(i => i.level == tier);
    }
    else if (typeof tier == "string")
    {
        return this.tiers[tier]
    }
    else if (typeof tier == "object")
    {
      return tier;
    }
    else return null;
  }

  static get compendiumBrowserFilters() {
    return new Map([
      ...Array.from(super.compendiumBrowserFilters),
      // @todo type='set' and choices?
      ["class", {
        label: this.LOCALIZATION_PREFIXES + ".FIELDS.class.value.label",
        type: "text",
        config: {
          keyPath: "system.class.value"
        }
      }]
    ]);
  }

  async _preUpdate(data, options, user)
  {
    await super._preUpdate(data, options, user);

    for(let id of Object.keys(data.system?.tiers || {}))
    {
      if (this.tiers[id])
      {
        await this.tiers[id]._preUpdate(data.system.tiers[id], options, user);
      }
      else 
      {
        data.system.tiers[id].level ??= Object.keys(this.tiers).length + 1;
      }
    }

    if (data.system?.characteristics)
    {
      for(let ch in data.system.characteristics)
      {
        // Don't let characteristic go to 0 tier, instead make it null
        if (data.system.characteristics[ch] == 0)
        {
          data.system.characteristics[ch] = null;
        }
      }
    }
  }

  async _preCreate(data, options, user)
  {
      if (!game.settings.get("wfrp4e", "editionSettings").careerAdvancement5e)
      {
        ui.notifications.warn("5e.Warning.CareerPathCreated", {localize: true, permanent: true});
        options.abortItemCreation = true;
      }

      else if (this.parent.actor?.type == "character") 
      {
        let tier = await this.promptTier();
        if (tier)
        {
          options.tier = tier.id;
          await this.parent.actor?.system.career.handleNewCareer(this.parent, tier.id);
        }
        else 
        {
          ui.notifications.error("Must select a tier");
          options.abortItemCreation = true;
        }
      }

      await super._preCreate(data, options, user);

  }

  async allowCreation(data, options, user)
  {
      let allowed = super.allowCreation(data, options, user)
      if (!game.settings.get("wfrp4e", "editionSettings").careerAdvancement5e)
      {
        allowed = false;
      }
      return allowed
  }


    async _onCreate(data, options, user)
    {
        await super._onCreate(data, options, user);
        if (game.user.id != user)
          return

          if (this.parent.actor?.type == "character") 
          {
            // Can't use preCreate because ID doesn't exist (or will change). Prompt for tier in preCreate but set in onCreate (tier ID doesn't change)
            if (options.tier)
            {
              this.parent.actor.update(this.parent.actor.system.career.set(this.parent, options.tier));
            }
          }
    }

    async _onDelete(options, user)
    {
      await super._onDelete(options, user);
      if (game.user.id != user)
        return

      if (this.parent.isOwned && this.parent.actor.type == "character")
      {
        this.parent.actor.update(this.parent.actor.system.career.clean());
      }
    }

    async promptTier()
    {
      let tier = await ItemDialog.create(Object.values(this.tiers), 1, {text: "Select CareerTier", title: this.parent.name, resolveClose: true});
      return tier[0];
    }


    computeBase()
    {
      for(let id in this.tiers)
      {
        this.tiers[id].id = id;
      }
    }

    async changeSkillName(newName, oldName, tier, skipPrompt) {
      let tiers = foundry.utils.deepClone(this.tiers);

      if (tier)
      {
        tier = this.getTier(tier);
      }

      if (!tier || !tier.skills.includes(oldName))
      {
        let tiersWithSkill = Object.values(tiers).filter(i => i.skills.includes(oldName));
        if (tiersWithSkill.length > 1)
        {
          tier = (await ItemDialog.create(tiersWithSkill, 1, {title: "Choose Tier", text: "Select the Career tier to change"}))[0];
        }
        else 
        {
          tier = tiersWithSkill[0];
        }
      }

      if (tier)
      {
        let tierSkills = foundry.utils.duplicate(tier.skills);
        // If tier has the skill, change the name
        if (tierSkills.includes(oldName)) 
        {
            tierSkills[tierSkills.indexOf(oldName)] = newName
        }
        else // if it doesn't, return
        {
            return;
        }

        let changeCareer = skipPrompt || await foundry.applications.api.DialogV2.confirm({yes : {default: true}, window : {title: game.i18n.localize("SHEET.CareerSkill")}, content: `<p>${game.i18n.localize("SHEET.CareerSkillPrompt")}</p>`})

        // Ask the user to confirm the change
        if (changeCareer)
          {
              ui.notifications.notify(`${game.i18n.format("SHEET.CareerSkillNotif", { oldName, newName, career: this.parent.name })}`)
              this.parent.update({ [`system.tiers.${tier.id}.skills`]: tierSkills })
          }
      }

    }

    async expandData(htmlOptions) {
        let data = await super.expandData(htmlOptions);

        return data;
      }

      chatData() {
        let properties = [];

        return properties;
      }


    async fromTierItem(tier)
    {

      const _createChoiceModel = async (strings) => {

        let options = [];

        for(let s of strings)
        {
          let item = await game.wfrp4e.utility.findItem(s);

          if (item && item.system.isPhysical)
          {
            options.push({type: "item", id: foundry.utils.randomID(), name: s, documentId: item.uuid, idType: "uuid"})
          }
          else 
          {
            options.push({type: "placeholder", name: s, id: foundry.utils.randomID()})
          }
        }

        return {
          structure: {
            type: "and",
            id: "root",
            options: options.map(i => {
              return {
                id: i.id,
                type: "option"
              }
            })
          },
          options
        }
      }


      try 
      {
        let careers = await warhammer.utility.findAllItems("career", "Loading Careers", true, ["system.careergroup.value"]);

        let tiers = careers.filter(c => c.system.careergroup.value == tier.system.careergroup.value);

        if (tiers.length)
        {
          tiers = (await Promise.all(tiers.map(i => fromUuid(i.uuid)))).sort((a, b) => a.system.level.value > b.system.level.value ? 1 : -1);
        }

        if (tiers.length > 4)
        {
          tiers = await ItemDialog.create(tiers, "unlimited", {text: "Select all the tiers that should be included.", title: "Select Tiers"});
        }

        let item = {
          name: tier.system.careergroup.value,
          img: tier.img,
          type: "careerPath",
          system: {
            class: tier.system.class.value,
            characteristics: {},
            tiers: {}
          }
        };

        let skillIndex = 0; // Remove previous tier skills
        for(let t of tiers)
        {
          let skills = t.system.skills;
          let tierSkills = t.system.skills.slice(skillIndex);
          // only include income skill if this tier specifies that skill, otherwise leave blank
          let tierIncome = t.system.incomeSkill.filter(i => tierSkills.includes(skills[i]));

          item.system.tiers[t.id] = {
            name: t.name,
            level: t.system.level.value,
            status: t.system.status,
            skills: tierSkills,
            talents: t.system.talents,
            incomeSkill: tierIncome,
            trappings: await _createChoiceModel(t.system.trappings)
          };

          for(let c in t.system.characteristics)
          {
            if (t.system.characteristics[c] && !item.system.characteristics[c])
            {
              item.system.characteristics[c] = t.system.level.value;
            }
          }

          skillIndex = t.system.skills.length
        }

        return item;
      }
      catch(e)
      {
        throw e;
      }
    }

    toTierItems()
    {
      let tiers = [];

      let skills = [];
      let income;
      for(let tier of Object.values(this.tiers).sort((a, b) => a.level > b.level ? 1 : -1))
      {
        skills = skills.concat(tier.skills);
        let newIncome = tier.incomeSkill.map(i => tier.skills[i]).map(s => skills.findIndex(_s => _s == s));

        if (newIncome.length)
        {
          income = newIncome;
        }

        let characteristics = {};
        for(let ch in this.characteristics)
        {
          characteristics[ch] = tier.level >= this.characteristics[ch];
        }

        let itemData = {
          name: tier.name,
          type: "career",
          _id: tier.id,
          img: this.parent.img,
          system: {
            class: {
              value: this.class
            },
            careergroup: {
              value: this.parent.name
            },
            level: {
              value: tier.level
            },
            characteristics,
            status: tier.status,
            skills,
            talents: tier.talents,
            trappings: tier.trappings.options.map(i => i.name),
            incomeSkill: income
          }
        }
        tiers.push(itemData)
      }
      return tiers;
    }
}