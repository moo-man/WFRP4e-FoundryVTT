export class SkillsTalentsStage extends BaseCharacterCreationStage
{
    static DEFAULT_OPTIONS = 
        {
            tag: "form",
            classes : ["species", "wfrp4e"],
            window : {
                title : "WH.CharacterCreation.Stage",
                contentClasses : ["standard-form"],
                frame: false,
                positioned: false
            },
            position : {
            },
            actions : {
              chooseTalents: this._onChooseTalents,
              rollTalents: this._onRollTalents,
              selectTalent: this._onSelectTalent,
              rerollTalent: this._onRerollTalent
            },
            dragDrop: [{ dragSelector: ".skill-drag", dropSelector: ".drop-container" }]

        };

    static PARTS = {
        skillsTalents : {template : "systems/wfrp4e/templates/apps/chargen/v2/stages/skills-talents.hbs"},
    };

    handleStageArgs({species, career})
    {
        this.data.species = new Item.implementation(species);
        this.data.career = new Item.implementation(career);

        this.data.speciesSkills = {
          none: this.data.species.system.skills.list,
          three: [],
          five: []
        }

        this.data.careerSkills = this.data.career.system.skills.reduce((obj, skill) => {
          obj[skill] = 0;
          return obj;
        }, {})

        this.data.careerAdvances = {
          total: 40,
          spent: 0
        }

        this.data.speciesTalents = {
          choices: [],
          random: []
        }

        this.data.careerTalents = Promise.all(this.data.career.system.talents.map(i => game.wfrp4e.utility.findTalent(i)));
        this.data.selectedCareerTalent = "";

    }

    async getStageResults() 
    {

        let skillAdvances = {};

        this.data.speciesSkills.three.forEach(s => {
          skillAdvances[s] = skillAdvances[s] ? skillAdvances[s] + 3 : 3
        })
        this.data.speciesSkills.five.forEach(s => {
          skillAdvances[s] = skillAdvances[s] ? skillAdvances[s] + 5 : 5
        })

        Object.keys(this.data.careerSkills).forEach(s => {
          skillAdvances[s] = skillAdvances[s] ? skillAdvances[s] + this.data.careerSkills[s] : this.data.careerSkills[s]
        })

        let result = {
          items: this.data.speciesTalents.choices.concat(this.data.speciesTalents.random).concat(await fromUuid(this.data.selectedCareerTalent)),
          skillAdvances,
        }

        return result;
    }

    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        this._computeSkillAdvances()
        this.data.careerTalents = await this.data.careerTalents;
        context.duplicateTalents = this._findDuplicateTalents();
        return context;
    }

    async _computeSkillAdvances()
    {
      this.data.careerAdvances.spent = Object.values(this.data.careerSkills).reduce((a, b) => a + b, 0);
      this.data.careerAdvances.left = this.data.careerAdvances.total - this.data.careerAdvances.spent;
    }

    _findDuplicateTalents()
    {
      let existing = [];
      let duplicates = [];
      for(let talent of this.data.speciesTalents.choices.concat(this.data.speciesTalents.random))
      {
        if (existing.includes(talent.name))
        {
          duplicates.push(talent.name);
        }
        else 
        {
          existing.push(talent.name);
        }
      }
      return duplicates;
    }

    _onDragStart(ev)
    {
      ev.dataTransfer.setData("text/plain", JSON.stringify({type: "Skill", key: ev.target.dataset.skill, from: ev.target.closest(".drop-container").dataset.drop}));
    }

    async _onDropSkill(dropData, ev)
    {
      let skill = dropData.key;
      let target = ev.target.dataset.drop;
      let from = dropData.from;

      this.data.speciesSkills[from] = this.data.speciesSkills[from].filter(i => i != skill);      
      this.data.speciesSkills[target] = this.data.speciesSkills[target].concat(skill);
      this.render({force: true})
    }

    static async _onChooseTalents()
    {
      let talents = await this.data.species.system.talents.choices.promptDecision();
      if (talents.length)
      {
        this.data.speciesTalents.choices = talents;
      }
      this.render({force: true})
    }

    static async _onRollTalents()
    {
      let rolled = [];
      for(let i = 0; i < this.data.species.system.talents.random; i++)
      {
        rolled.push(await this._rollSpeciesTalent());
      }
      this.data.speciesTalents.random = rolled;
      this.render({force: true})
    }

    async _rollSpeciesTalent()
    {
      let table = await this.data.species.system.tables.talents.document;
      let result = await table.roll();
      return await fromUuid(result.results[0].uuid)
    }

    static async _onSelectTalent(ev)
    {
      this.data.selectedCareerTalent = ev.target.dataset.uuid;
      this.render({force: true})
    }

    static async _onRerollTalent(ev)
    {
      let uuid = ev.target.closest("[data-uuid]").dataset.uuid;
      let talents = this.data.speciesTalents[ev.target.closest("[data-type]").dataset.type];
      for(let i = 0; i < talents.length; i++)
      {
        if (talents[i].uuid == uuid)
        {
          talents[i] = await this._rollSpeciesTalent();
          break;
        }
      }
      this.render({force: true});
    }

    _addEventListeners()
    {
      this.element.querySelectorAll("[data-skill]").forEach(el => {
        el.addEventListener("focusin", (ev) => ev.target.select())
        el.addEventListener("change", (ev) => {
          let value = Math.max(0, Number(ev.target.value));
          this.data.careerSkills[ev.target.dataset.skill] = value;
          this.render({force: true});
        })
      })

    }

}