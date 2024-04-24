import { CharacteristicsModel } from "./components/characteristics";
import { CharacterStatusModel } from "./components/status";
import { CharacterDetailsModel } from "./components/details";
import { StandardActorModel } from "./standard";
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

    preCreateData(data, options) {
        let preCreateData = super.preCreateData(data, options);
        mergeObject(preCreateData, {
            "prototypeToken.sight": { enabled: true },
            "prototypeToken.actorLink": true,
            "prototypeToken.disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY
        });
        return preCreateData;
    }


    async preUpdateChecks(data, options) {
        await super.preUpdateChecks(data, options);

        this._handleExperienceChange(data, options)
    }

    updateChecks(data, options) {
        let update = super.updateChecks(data, options);
        if(!options.skipCorruption && getProperty(data, "system.status.corruption.value"))
        {
          this.checkCorruption();
        }
        return update;
        // this._checkEncumbranceEffects(this.parent);
    }

    computeBase() {
        this.status.corruption.max = 0;
        super.computeBase();
    }


    computeDerived(items, flags) {
        super.computeDerived(items, flags);

        this.computeCorruption(items, flags)
        this.computeCareer(items, flags)

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
        let currentCareer = this.currentCareer
        if (currentCareer) {
          let { standing, tier } = this._applyStatusModifier(currentCareer.status)
          this.details.status.standing = standing
          this.details.status.tier = tier
          this.details.status.value = game.wfrp4e.config.statusTiers[this.details.status.tier] + " " + this.details.status.standing
        }
        else
          this.details.status.value = ""
    
        if (currentCareer) {
          let availableCharacteristics = currentCareer.characteristics
          for (let char in this.characteristics) {
            if (availableCharacteristics.includes(char))
              this.characteristics[char].career = true;
          }
        }
    }

    get currentCareer() 
    {
        return this.parent.getItemTypes("career").find(c => c.current.value)
    }

    _handleExperienceChange(data) {
        if (hasProperty(data, "system.details.experience") && !hasProperty(data, "system.details.experience.log")) {
            let actorData = this.parent.toObject() // duplicate so we have old data during callback
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
                    let expLog = actorData.system.details.experience.log || []
                    let newEntry = { reason: dlg.find('[name="reason"]').val() }
                    if (hasProperty(data, "system.details.experience.spent")) {
                        newEntry.amount = data.system.details.experience.spent - actorData.system.details.experience.spent
                        newEntry.spent = data.system.details.experience.spent
                        newEntry.total = actorData.system.details.experience.total
                        newEntry.type = "spent"
                    }
                    if (hasProperty(data, "system.details.experience.total")) {
                        newEntry.amount = data.system.details.experience.total - actorData.system.details.experience.total
                        newEntry.spent = actorData.system.details.experience.spent
                        newEntry.total = data.system.details.experience.total
                        newEntry.type = "total"
                    }

                    expLog.push(newEntry)
                    this.parent.update({ "system.details.experience.log": expLog })
                }
            }).render(true)
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
}
