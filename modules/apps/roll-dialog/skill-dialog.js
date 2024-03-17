import SkillTest from "../../system/rolls/skill-test";
import CharacteristicDialog from "./characteristic-dialog";

export default class SkillDialog extends CharacteristicDialog {

    subTemplate = "systems/wfrp4e/templates/dialog/skill-dialog.hbs";
    chatTemplate = "systems/wfrp4e/templates/chat/roll/skill-card.hbs"

    testClass = SkillTest

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["skill-roll-dialog"]);
        return options;
    }

    get item()
    {
      return this.skill
    }

    get extendedTest() 
    {
        return this.actor.items.get(this.options.extended);
    }

    get skill() 
    {
      return this.data.skill;
    }

    static async setup(fields={}, data={}, options={})
    {
        let skill = data.skill
        options.title = options.title || game.i18n.format("SkillTest", {skill: data.skill.name});
        options.title += options.appendTitle || "";

        if (data.skill.name == game.i18n.localize("NAME.Dodge"))    
        {
            options.dodge = true;
        }
        data.characteristic = skill.characteristic.key;
        data.hitLocationTable = game.wfrp4e.tables.getHitLocTable(data.targets[0]?.actor?.details?.hitLocationTable?.value || "hitloc");

        if (data.skill.id != "unknown")
        {
            data.scripts = data.scripts.concat(data.skill?.getScripts("dialog"))
        }
        if (options.reload)
        {
            data.scripts = data.scripts.concat(options.weapon?.ammo.getScripts("dialog"));
        }

        return new Promise(resolve => {
            new this(fields, data, resolve, options).render(true);
        })
    }

    async getData() 
    {
        let context = await super.getData();
        context.data.hitLoc = ["ws", "bs"].includes(context.data.characteristic)
        return context;
    }

    _constructTestData()
    {
        let data = super._constructTestData();
        data.skillName = this.data.skill?.name;
        data.item = this.data.skill?.id;
        data.characteristicToUse = this.data.characteristic;
        return data;
    }

    computeFields()
    {
        super.computeFields();   
        this._computeArmour()
    }

    _computeArmour()
    {
        let stealthPenaltyValue = 0;

        // Armor type penalties do not stack, only apply if you wear any of that type
        let wearingMail = false;
        let wearingPlate = false;

        for (let a of this.actor.itemTypes["armour"].filter(i => i.isEquipped)) {
            // For each armor, apply its specific penalty value, as well as marking down whether
            // it qualifies for armor type penalties (wearingMail/Plate)

            // Skip practical
            if (a.properties.qualities.practical) {
                continue;
            }

            if (a.armorType.value == "mail") {
                wearingMail = true;
            }
            if (a.armorType.value == "plate") {
                wearingPlate = true;
            }
        }

        // Apply armor type penalties at the end
        if (wearingMail || wearingPlate) {
            if (wearingMail) {
                stealthPenaltyValue += -10;
            }
            if (wearingPlate) {
                stealthPenaltyValue += -10;
            }

            if (this.item.name.includes(game.i18n.localize("NAME.Stealth"))) {
                if (stealthPenaltyValue) {
                    this.fields.modifier += stealthPenaltyValue
                    this.tooltips.addModifier(stealthPenaltyValue, game.i18n.localize("SHEET.ArmourPenalties"));
                }
            }
        }
    }

    activateListeners(html)
    {
        super.activateListeners(html)

        html.find(".change-characteristic").change(ev => {
            this.data.characteristic = ev.currentTarget.value;
            this.render(true);
        })
    }

    // Backwards compatibility for effects
    get type() 
    {
        return "skill";
    }
}