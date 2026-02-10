import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class CareerModel extends BaseItemModel
{
    static LOCALIZATION_PREFIXES = ["WH.Models.career"];
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.careergroup = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.class = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.current = new fields.SchemaField({
            value: new fields.BooleanField()
        });
        schema.complete = new fields.SchemaField({
            value: new fields.BooleanField()
        });
        schema.level = new fields.SchemaField({
            // value: new fields.NumberField({min: 1, choices : [1, 2, 3, 4], initial : 1})
            value: new fields.NumberField({min: 1,  choices: game.wfrp4e.config.careerLevels, initial : 1})
        });
        schema.status = new fields.SchemaField({
            standing: new fields.NumberField({min: 1}),
            tier: new fields.StringField({choices: game.wfrp4e.config.statusTiers})
        });
        schema.characteristics = new fields.SchemaField({
            ws: new fields.BooleanField(),
            bs: new fields.BooleanField(),
            s: new fields.BooleanField(),
            t: new fields.BooleanField(),
            i: new fields.BooleanField(),
            ag: new fields.BooleanField(),
            dex: new fields.BooleanField(),
            int: new fields.BooleanField(),
            wp: new fields.BooleanField(),
            fel: new fields.BooleanField(),
        })

        schema.skills = new fields.ArrayField(new fields.StringField());
        schema.addedSkills = new fields.ArrayField(new fields.StringField());
        schema.talents = new fields.ArrayField(new fields.StringField());
        schema.trappings = new fields.ArrayField(new fields.StringField());
        schema.incomeSkill = new fields.ArrayField(new fields.NumberField());
        schema.requiredTrappings = new fields.ArrayField(new fields.NumberField());
        schema.trappingsOwned = new fields.ArrayField(new fields.NumberField()); // Manual toggle for owning a trapping
        schema.previousCareer = new fields.EmbeddedDataField(DocumentReferenceModel)
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
      ["careergroup", {
        label: this.LOCALIZATION_PREFIXES + ".FIELDS.careergroup.value.label",
        type: "text",
        config: {
          keyPath: "system.careergroup.value"
        }
      }],
      // @todo type='set' and choices?
      ["class", {
        label: this.LOCALIZATION_PREFIXES + ".FIELDS.class.value.label",
        type: "text",
        config: {
          keyPath: "system.class.value"
        }
      }],
      ["level", {
        label: this.LOCALIZATION_PREFIXES + ".FIELDS.level.value.label",
        type: "set",
        config: {
          choices: {1: 1, 2: 2, 3: 3, 4: 4},
          keyPath: "system.level.value"
        }
      }],
      ["statusStanding", {
        label: this.LOCALIZATION_PREFIXES + ".FIELDS.status.standing.label",
        type: "range",
        config: {
          keyPath: "system.status.standing"
        }
      }],
      ["statusTier", {
        label: this.LOCALIZATION_PREFIXES + ".FIELDS.status.tier.label",
        type: "set",
        config: {
          choices: game.wfrp4e.config.statusTiers,
          keyPath: "system.status.tier"
        }
      }],
      ["characteristics", {
        label: "Characteristics",
        type: "set",
        config: {
          choices: game.wfrp4e.config.characteristics,
          keyPath: "system.characteristics",
          valueGetter: (data) => {
            if (foundry.utils.getType(data.system.characteristics) === "Array")
              return data.system.characteristics;

            return Object.entries(data.system.characteristics).reduce((acc, [k, v]) => {
              if (v) acc.push(k);
              return acc;
            }, [])
          },
          multiple: true
        }
      }],
      ["skills", {
        label: "Skills",
        type: "text",
        config: {
          keyPath: "system.skills",
          multiple: true
        }
      }],
      ["talents", {
        label: "Talents",
        type: "text",
        config: {
          keyPath: "system.talents",
          multiple: true
        }
      }],
      ["trappings", {
        label: "Trappings",
        type: "text",
        config: {
          keyPath: "system.trappings",
          multiple: true
        }
      }],
      ["incomeSkill", {
        label: "Income",
        type: "text",
        config: {
          keyPath: "system.incomeSkill",
          multiple: true
        }
      }],
    ]);
  }

  async _preUpdate(data, options, user)
  {
    await super._preUpdate(data, options, user);

    // If the last skill inputted has commas, separate them into their own array elements
    let skills = foundry.utils.getProperty(data, "system.skills")
    if (skills && skills[skills.length - 1]?.includes(","))
    {
      foundry.utils.setProperty(data, "system.skills", skills.slice(0, skills.length - 1).concat(skills[skills.length - 1].split(",").map(i => i.trim())));
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

    async _onUpdate(data, options, user)
    {
        await super._onUpdate(data, options, user);

        if (game.user.id == user) 
        {
            if (this.parent.isOwned && data.system?.current?.value) 
            {
                let actor = this.parent.actor;
                let careerUpdates = actor.itemTypes.career.filter(i => i.system.current.value && i.id != this.parent.id).map(i => {
                    return {
                        "system.current.value": false,
                        _id: i.id
                    }
                });
                // Reset all other careers to not be current (only one can be current)
                actor.update({ items: careerUpdates });
            }
            if (this.parent.isOwned && this.parent.actor.type == "npc" && foundry.utils.getProperty(options.changed, "system.complete.value")) 
            {
                this._promptCareerAdvance()
            }

            if (this.parent.isOwned && this.parent.actor.type == "character" && foundry.utils.getProperty(options.changed, "system.current.value")) 
            {
                this.handleCareerLinking()
            }
        }
    }

    computeOwned()
    {
      this.requiredTrappingStatus = [];
      if (this.current.value)
      {
        for(let trappingIndex of this.requiredTrappings)
        {
          let name = this.trappings[trappingIndex];
          if (name)
          {
            this.requiredTrappingStatus.push({
              name, 
              owned : this.trappingsOwned.includes(trappingIndex) || this.parent.actor.items.find(i => i.name.toLowerCase() == name.toLowerCase()),
              index : trappingIndex
            })
          }
        }
      }
    }

    async _promptCareerAdvance()
    {
        let advance = await foundry.applications.api.DialogV2.confirm({yes : {default: true}, content: game.i18n.localize("CAREERAdvHint"), window : {title: game.i18n.localize("CAREERAdv")}})

        if (advance)
        {
            await this.parent.actor.system.advance(this.parent)
            await this.parent.actor.update({ "system.details.status.value": game.wfrp4e.config.statusTiers[this.status.tier] + " " + this.status.standing })
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

    async handleCareerLinking()
    {
        if (this.level.value == 1 || this.previousCareer.document)
        {
            return;
        }
        else 
        {
            let actor = this.parent.actor;
            let previousCareers = actor.itemTypes.career.filter(i => i.system.careergroup.value == this.careergroup.value && i.id != this.parent.id).sort((a, b) => b.system.level.value - a.system.level.value);
            let previous = previousCareers[0];

            if (!previous)
            {
                return;
            }

            if (await foundry.applications.api.DialogV2.confirm({yes : {default: true}, window : {title : game.i18n.localize("DIALOG.LinkCareer")}, content : `<p>${game.i18n.format("DIALOG.LinkCareerContent", {new : this.parent.name, old : previous.name})}</p>`}))
            {
                let collectedSkills = previous.system.skills.concat(this.skills.slice(previous.system.skills.length));

                this.parent.update({system : {previousCareer : {name : previous.name, id : previous.id}, skills : collectedSkills}})
            }
        }
    }

    _addModelProperties()
    {
        if (this.parent.actor)
        {
            this.previousCareer.relative = this.parent.actor.items;
        }
    }

    // Career should only be applied if career is active
    effectIsApplicable(effect) 
    {
        return this.current.value;
    }
    

    async expandData(htmlOptions) {
        let data = await super.expandData(htmlOptions);
        data.properties = [];
        data.properties.push(`<b>${game.i18n.localize("Class")}</b>: ${this.class.value}`);
        data.properties.push(`<b>${game.i18n.localize("Group")}</b>: ${this.careergroup.value}`);
        data.properties.push(game.wfrp4e.config.statusTiers[this.status.tier] + " " + this.status.standing);
        data.properties.push(`<b>${game.i18n.localize("Characteristics")}</b>: ${Object.keys(this.characteristics).filter(i => this.characteristics[i]).map(i => i = " " + game.wfrp4e.config.characteristicsAbbrev[i])}`);
        data.properties.push(`<b>${game.i18n.localize("Skills")}</b>: ${this.skills.map(i => i = " " + i)}`);
        data.properties.push(`<b>${game.i18n.localize("Talents")}</b>: ${this.talents.map(i => i = " " + i)}`);
        data.properties.push(`<b>${game.i18n.localize("Trappings")}</b>: ${this.trappings.map(i => i = " " + i)}`);
        data.properties.push(`<b>${game.i18n.localize("Income")}</b>: ${this.incomeSkill.map(i => ` <a class = 'career-income' data-career-id=${this.id}> ${this.skills[i]} <i class="fas fa-coins"></i></a>`)}`);
        // When expansion data is called, a listener is added for 'career-income'
        return data;
      }

      chatData() {
        let properties = [];
        properties.push(`<b>${game.i18n.localize("Class")}</b>: ${this.class.value}`);
        properties.push(`<b>${game.i18n.localize("Group")}</b>: ${this.careergroup.value}`);
        properties.push(`<b>${game.i18n.localize("Status")}</b>: ${game.wfrp4e.config.statusTiers[this.status.tier] + " " + this.status.standing}`);
        properties.push(`<b>${game.i18n.localize("Characteristics")}</b>: ${Object.keys(this.characteristics).filter(i => this.characteristics[i]).map(i => i = " " + game.wfrp4e.config.characteristicsAbbrev[i])}`);
        properties.push(`<b>${game.i18n.localize("Skills")}</b>: ${this.skills.map(i => i = " " + "<a class = 'skill-lookup'>" + i + "</a>")}`);
        properties.push(`<b>${game.i18n.localize("Talents")}</b>: ${this.talents.map(i => i = " " + "<a class = 'talent-lookup'>" + i + "</a>")}`);
        properties.push(`<b>${game.i18n.localize("Trappings")}</b>: ${this.trappings.map(i => i = " " + i)}`);
        properties.push(`<b>${game.i18n.localize("Income")}</b>: ${this.incomeSkill.map(i => " " + this.skills[i])}`);
        return properties;
      }

      static migrateData(data)
      {
        if (data.characteristics instanceof Array)
        {
            data.characteristics = {
                ws : data.characteristics.includes("ws"),
                bs : data.characteristics.includes("bs"),
                s : data.characteristics.includes("s"),
                t : data.characteristics.includes("t"),
                i : data.characteristics.includes("i"),
                ag : data.characteristics.includes("ag"),
                dex : data.characteristics.includes("dex"),
                int : data.characteristics.includes("int"),
                wp : data.characteristics.includes("wp"),
                fel : data.characteristics.includes("fel")
            }
        }

        // if (data.skills instanceof Array)
        // {
        //     data.skills = {list : data.skills};
        // }
        // if (data.talents instanceof Array)
        // {
        //     data.talents = {list : data.talents};
        // }
        // if (data.trappings instanceof Array)
        // {
        //     data.trappings = {list : data.trappings};
        // }
      }

      async toEmbed(config, options={})
      {
          let tiers = (await Promise.all(config.tiers?.split(",").map(i => fromUuid(i.trim())) || [])).map(t => t).concat(this.parent).sort((a, b) => a.system.level.value - b.system.level.value);

  
          // Replace characteristic true/false with career level, otherwise leave it as it was (possibly set by previous tier)
          let characteristics = foundry.utils.deepClone(tiers[0].system.characteristics);
          for (let c in characteristics)
          {
            characteristics[c] = "";
          }
          for(let tier of tiers)
          {
            for (let c in tier.system.characteristics)
            {
              if (tier.system.characteristics[c] && !characteristics[c])
              {
                characteristics[c] = tier.system.level.value;
              }
            }
          }

          let tierIcons = {
            "1" : "✠",
            "2" : "♟",
            "3" : "♜",
            "4" : "♛",
            "5" : "♚"
          }

          let tierHTML = [];

          let skillLookup = await warhammer.utility.findAllItems("skill", null, true)
          skillLookup.forEach(i => {
            i.baseName = i.name.split("(")[0].trim(); // Base skill name for any specialisations
          })

          let talentLookup = await warhammer.utility.findAllItems("talent", null, true)
          talentLookup.forEach(i => {
            i.baseName = i.name.split("(")[0].trim(); // Base skill name for any specialisations
          })


          let skillIndex = 0; // Used to remove skills already listed in lower tiers

          for(let tier of tiers)
          {
            let thisTierSkill = tier.system.skills.slice(skillIndex); // Slice off any previous tier skills
            skillIndex = tier.system.skills.length;                   // Set skill cutoff for next tier

            let skillLinks = thisTierSkill.map(name => {
              let baseName = name.split("(")[0].trim();
              let found = skillLookup.find(i => i.name == name);
              if (!found)
              {
                found = skillLookup.find(i => i.baseName == baseName)
              }
              return `@UUID[${found?.uuid || "unknown"}]{${name}}`;
            })

            let skillText = skillLinks.join(", ");

            let talentLinks = tier.system.talents.map(name => {
              let baseName = name.split("(")[0].trim();
              let found = talentLookup.find(i => i.name == name);
              if (!found)
              {
                found = talentLookup.find(i => i.baseName == baseName)
              }
              return `@UUID[${found?.uuid || "unknown"}]{${name}}`;
            })

            let talentText = talentLinks.join(", ")

            let html = `<h3>${tierIcons[tier.system.level.value]} @UUID[${tier.uuid}]{${tier.name}}</h3>
            <p><strong>Status</strong>: ${game.wfrp4e.config.statusTiers[tier.system.status.tier]} ${tier.system.status.standing}</p>
            <p><strong>Skills</strong>: ${skillText}</p>
            <p><strong>Talents</strong>: ${talentText}</p>
            <p><strong>Trappings</strong>: ${tier.system.trappings.join(", ")}</p>
            `

            tierHTML.push(html);
          }

          let content = await foundry.applications.handlebars.renderTemplate("systems/wfrp4e/templates/embeds/career.hbs", {item: this.parent, tierHTML, characteristics, species : config.species})
          
          let div = document.createElement("div");
          div.style = config.style;
          div.innerHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(content, {relativeTo : this.parent, async: true, secrets : options.secrets});
          return div;
        }  
}