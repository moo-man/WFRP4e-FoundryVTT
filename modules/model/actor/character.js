import { CharacteristicsModel } from "./components/characteristics";
import { CharacterStatusModel } from "./components/status";
import { CharacterDetailsModel } from "./components/details";
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


    preUpdateChecks(data, options) {
        super.preUpdateChecks(data, options);

        this._handleExperienceChange(data, options)
    }

    updateChecks(data, options) {
        super.updateChecks(data, options);
        this._checkEncumbranceEffects(this.parent);
    }

    computeBase() {
        super.computeBase();
    }


    computeDerived(items, flags) {
        super.computeDerived(items, flags);

        this.computeCorruption(items, flags)
        this.computeCareer(items, flags)

        this.details.experience.current = this.details.experience.total - this.details.experience.spent;
    }

    computeCorruption(items, flags)
    {
        let tb = this.characteristics.t.bonus;
        let wpb = this.characteristics.wp.bonus;
    
        // If the user has not opted out of auto calculation of corruption, add pure soul value
        if (flags.autoCalcCorruption) {
          this.status.corruption.max = tb + wpb;
        }
    }

    computeCareer(items, flags)
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
}
