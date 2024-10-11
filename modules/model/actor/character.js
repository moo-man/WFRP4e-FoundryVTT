import { CharacteristicsModel } from "./components/characteristics";
import { CharacterStatusModel } from "./components/status";
import { CharacterDetailsModel } from "./components/details";
import { StandardActorModel } from "./standard";
import Advancement from "../../system/advancement";
let fields = foundry.data.fields;

export class CharacterModel extends StandardActorModel {
    static preventItemTypes = [];

    static defineSchema() {
        let schema = super.defineSchema();

        schema.characteristics = new fields.EmbeddedDataField(CharacteristicsModel);
        schema.status = new fields.EmbeddedDataField(CharacterStatusModel);
        schema.details = new fields.EmbeddedDataField(CharacterDetailsModel);

        return schema;
    }

    async _preCreate(data, options, user) {
        await super._preCreate(data, options, user);
        this.parent.updateSource({
          "prototypeToken.sight": { enabled: true },
          "prototypeToken.actorLink": true,
          "prototypeToken.disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY
        })
    }

    async _preUpdate(data, options, user) 
    {
      await super._preUpdate(data, options, user);
      if (!options.skipExperienceChecks)
      {
        await this._checkCharacteristicChange(data, options, user);
        await this._handleExperienceChange(data, options)

      }
    }

    async _checkCharacteristicChange(data, options, user)
    {
      let charChanges = getProperty(options.changed, "system.characteristics")
      if (charChanges)
      {
        let keys = Object.keys(charChanges);
        for(let c of keys)
        {
          if (charChanges[c].advances)
          {
            let resolved = await Advancement.advancementDialog(c, charChanges[c].advances, "characteristic", this.parent)
            if (!resolved)
            {
              charChanges[c].advances = this.characteristics[c].advances;
              data.system.characteristics[c].advances = this.characteristics[c].advances;
              this.parent.sheet.render(true); // this doesn't feel right but otherwise the inputted value will still be on the sheet
            }
          }
        }
      }
    }

    async _onUpdate(data, options, user) {
        await super._onUpdate(data, options, user);

        if(!options.skipCorruption && foundry.utils.getProperty(options.changed, "system.status.corruption.value") && game.user.id == user)
        {
          this.checkCorruption();
        }
        
        // If XP received from message award, add
        if (options.fromMessage && game.user.isUniqueGM)
        {
          this._registerChatAward(options.fromMessage)
        }
    }

    computeBase() {
        if (this.parent.flags.autoCalcCorruption) 
        {
          this.status.corruption.max = 0;
        }
        super.computeBase();
    }

    computeDerived() {
        super.computeDerived();

        this.computeCorruption()
        this.computeCareer()

        this.details.experience.current = this.details.experience.total - this.details.experience.spent;
    }

    computeCorruption()
    {
        let flags = this.parent.flags;
        let tb = this.characteristics.t.bonus;
        let wpb = this.characteristics.wp.bonus;
    
        // If the user has not opted out of auto calculation of corruption, add pure soul value
        if (flags.autoCalcCorruption) {
          this.status.corruption.max += tb + wpb;
        }
    }

    computeCareer()
    {
        let career = this.currentCareer
        let actorSkills = this.parent.itemTypes.skill
        let actorTalents = this.parent.itemTypes.talent
        if (career) 
        {
          let { standing, tier } = this._applyStatusModifier(career.system.status)
          this.details.status.standing = standing
          this.details.status.tier = tier
          this.details.status.value = game.wfrp4e.config.statusTiers[this.details.status.tier] + " " + this.details.status.standing
          this.details.career = career
          career.system.untrainedSkills = [];
          career.system.untrainedTalents = [];

          
          let availableCharacteristics = career.system.characteristics
          for (let char in this.characteristics) 
          {
            if (availableCharacteristics.includes(char))
            {
                this.characteristics[char].career = true;
                if (this.characteristics[char].advances >= career.system.level.value * 5) 
                {
                  this.characteristics[char].complete = true;
                }
              }
          }

                  
          // Find skills that have been trained or haven't, add advancement indicators or greyed out options (untrainedSkills)
          for (let sk of career.system.skills.concat(career.system.addedSkills)) 
          {
            let trainedSkill = actorSkills.find(s => s.name.toLowerCase() == sk.toLowerCase())
            if (trainedSkill) 
              trainedSkill.system.addCareerData(career)
            else 
              career.system.untrainedSkills.push(sk);
            
          }

          // Find talents that have been trained or haven't, add advancement button or greyed out options (untrainedTalents)
          for (let talent of career.system.talents) 
          {
              let trainedTalent = actorTalents.filter(t => t.name == talent)
              if (trainedTalent.length)
              {
                for(let t of trainedTalent)
                {
                  t.system.addCareerData(career)
                }
              }
              else 
              {
                career.system.untrainedTalents.push(talent);
              }
          }
        }
        else
        {
          this.details.status.value = ""
        }
    
    }

    

    get currentCareer() 
    {
        return this.parent.itemTags["career"].find(c => c.current.value)
    }
    
    awardExp(amount, reason, message=null) 
    {
      let experience = foundry.utils.duplicate(this.details.experience)
      experience.total += amount
      experience.log.push({ reason, amount, spent: experience.spent, total: experience.total, type: "total" })
      this.parent.update({ "system.details.experience": experience }, {fromMessage : message});
      ChatMessage.create({ content: game.i18n.format("CHAT.ExpReceived", { amount, reason }), speaker: { alias: this.name } })
    }

    addToExpLog(amount, reason, newSpent, newTotal) 
    {
      if (!newSpent)
        newSpent = this.details.experience.spent
      if (!newTotal)
        newTotal = this.details.experience.total

      let expLog = foundry.utils.duplicate(this.details.experience.log || [])
      expLog.push({ amount, reason, spent: newSpent, total: newTotal, type: newSpent ? "spent" : "total" });
      return expLog
    }

    async _handleExperienceChange(data, options, changed) {
        if (foundry.utils.hasProperty(options.changed, "system.details.experience") && !foundry.utils.hasProperty(options.changed, "system.details.experience.log")) {
          await new Promise(resolve => {
            new Dialog({
                content: `<p>${game.i18n.localize("ExpChangeHint")}</p><div class="form-group"><input name="reason" type="text" /></div>`,
                title: game.i18n.localize("ExpChange"),
                buttons: {
                    confirm: {
                        label: game.i18n.localize("Confirm"),
                        callback: (dlg) => { }
                    }
                },
                default: "confirm",
                close: dlg => {
                    let expLog = this.details.experience.log || []
                    let newEntry = { reason: dlg.find('[name="reason"]').val() }
                    if (foundry.utils.hasProperty(data, "system.details.experience.spent")) {
                        newEntry.amount = data.system.details.experience.spent - this.details.experience.spent
                        newEntry.spent = data.system.details.experience.spent
                        newEntry.total = this.details.experience.total
                        newEntry.type = "spent"
                    }
                    if (foundry.utils.hasProperty(data, "system.details.experience.total")) {
                        newEntry.amount = data.system.details.experience.total - this.details.experience.total
                        newEntry.spent = this.details.experience.spent
                        newEntry.total = data.system.details.experience.total
                        newEntry.type = "total"
                    }

                    expLog.push(newEntry);
                    foundry.utils.setProperty(data, "system.details.experience.log", expLog);
                    resolve();
                }
            }).render(true)
          })
        }
    }

    _applyStatusModifier({ standing, tier }) {
        let modifier = this.details.status.modifier || 0
    
        if (modifier < 0)
          this.details.status.modified = "negative"
        else if (modifier > 0)
          this.details.status.modified = "positive"
    
        let temp = standing
        standing += modifier
        modifier = -(Math.abs(temp))
    
        if (standing <= 0 && tier != "b") {
          standing = 5 + standing
          if (tier == "g")
            tier = "s"
          else if (tier == "s")
            tier = "b"
    
          // If modifier is enough to subtract 2 whole tiers
          if (standing <= 0 && tier != "b") {
            standing = 5 + standing
            tier = "b" // only possible case here
          }
    
          if (standing < 0)
            standing = 0
        }
        // If rock bottom
        else if (standing <= 0 && tier == "b") {
          standing = 0
        }
        else if (standing > 5 && tier != "g") {
          standing = standing - 5
          if (tier == "s")
            tier = "g"
          else if (tier == "b")
            tier = "s"
    
          // If modifier is enough to get you 2 whole tiers
          if (standing > 5 && tier != "g") {
            standing -= 5
            tier = "g" // Only possible case here
          }
        }
        return { standing, tier }
      }

      
  async checkCorruption() {

    let test;
    if (this.status.corruption.value > this.status.corruption.max) 
    {
      let skill = this.parent.has(game.i18n.localize("NAME.Endurance"), "skill")
      if (skill) 
      {
        test = await this.parent.setupSkill(skill, { title: game.i18n.format("DIALOG.MutateTitle", { test: skill.name, skipTargets: true }), mutate: true })
      }
      else {
        test = await this.parent.setupCharacteristic("t", { title: game.i18n.format("DIALOG.MutateTitle", { test: game.wfrp4e.config.characteristics["t"], skipTargets: true }), mutate: true })
      }
      await test.roll();
    }
  }

  async _registerChatAward(messageId)
  {
    let message = game.messages.get(messageId);
    if (message)
    {
      let alreadyAwarded = message.getFlag("wfrp4e", "experienceAwarded") || []
      message.setFlag("wfrp4e", "experienceAwarded", alreadyAwarded.concat(this.parent.id));
    }
  }
}
