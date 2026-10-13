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
  get isCareer() {
    return true;
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


    async _onCreate(data, options, user)
    {
        await super._onCreate(data, options, user);
        
        if (this.parent.actor?.type == "creature") 
        {
            await this.parent.actor.system.advance(this.parent);
        }
    }


    computeBase()
    {
      for(let id in this.tiers)
      {
        this.tiers[id].id = id;
      }
    }

    async changeSkillName(newName, oldName, skipPrompt) {
        let careerSkills = foundry.utils.duplicate(this.skills)

        // If career has the skill, change the name
        if (careerSkills.includes(oldName)) 
        {
            careerSkills[careerSkills.indexOf(oldName)] = newName
        }
        else // if it doesn't, return
        {
            return;
        }

        // Ask the user to confirm the change
        let changeCareer = skipPrompt || await foundry.applications.api.DialogV2.confirm({yes : {default: true}, window : {title: game.i18n.localize("SHEET.CareerSkill")}, content: `<p>${game.i18n.localize("SHEET.CareerSkillPrompt")}</p>`})

        if (changeCareer)
        {
            ui.notifications.notify(`${game.i18n.format("SHEET.CareerSkillNotif", { oldName, newName, career: this.parent.name })}`)
            this.parent.update({ "system.skills": careerSkills })
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
      try 
      {
        let careers = await warhammer.utility.findAllItems("career", "Loading Careers", true, ["system.careergroup.value"]);

        let tiers = careers.filter(c => c.system.careergroup.value == tier.system.careergroup.value);

        if (tiers.length)
        {
          tiers = (await Promise.all(tiers.map(i => fromUuid(i.uuid)))).sort((a, b) => a.system.level.value > b.system.level.value ? 1 : -1);
        }

        if (tier.pack)
        {
          tiers = tiers.filter(i => i.pack == tier.pack);
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
          let tierIncome = t.system.incomeSkill.map(i => skills[i]).filter(i => tierSkills.includes(i));

          item.system.tiers[t.id] = {
            name: t.name,
            level: t.system.level.value,
            status: t.system.status,
            skills: tierSkills,
            talents: t.system.talents,
            incomeSkill: tierIncome,
            //trappings: t.system.trappings
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
      for(let tier of Object.values(this.tiers).sort((a, b) => a.level > b.level ? 1 : -1))
      {
        skills = skills.concat(tier.skills);

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
            //trappings: tier.trappings,
            incomeSkill: tier.incomeSkill.map(s => skills.findIndex(_s => _s == s))
          }
        }
        tiers.push(itemData)
      }
      return tiers;
    }
}