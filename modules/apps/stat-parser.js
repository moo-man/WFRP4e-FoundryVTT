import ItemWfrp4e from "../item/item-wfrp4e.js";
import WFRP_Utility from "../system/utility-wfrp4e.js";

export default class StatBlockParser extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "stat-parser";
        options.template = "systems/wfrp4e/templates/apps/stat-parser.html";
        options.height = 600;
        options.width = 600;
        options.minimizable = true;
        options.title = "Stat Block Parser"
        return options;
    }

    getData() {

        let types = game.system.template.Actor.types
        return { types }
    }


    async _updateObject(event, formData) {
        this.object.update(await StatBlockParser.parseStatBlock(formData.statBlock, this.object.data.type))
    }

    static async parseStatBlock(statString, type = "npc") {
        let model = duplicate(game.system.model.Actor[type]);

        let blockArray = statString.split("\n");
        let name = blockArray[0].split("—")[0].split(" ").filter(f => !!f);

        name = name.map(word => {
            if (word == "VON")
                return word.toLowerCase();

            word = word.toLowerCase();
            word = word[0].toUpperCase() + word.substring(1, word.length);
            return word;
        })
        name = name.join(" ")

        let status  = -1
        if (blockArray[0].includes("("))
            status = blockArray[0]
        else if (blockArray[1].includes("("))
            status = blockArray[1]
        
        if (status != -1 && hasProperty(model, "details.status.value"))
        {
            status = status.substring(status.indexOf("(")+1, status.indexOf(")"))
            model.details.status.value = status[0] + status.slice(1).toLowerCase();
        }

        let tableIndex = blockArray.findIndex(v => v.includes(" WS "))
        let characteristicNames = blockArray[tableIndex].split(" ")
        let characteristicValues = blockArray[tableIndex + 1].split(" ")

        for (let i = 0; i < characteristicNames.length; i++) {
            if (characteristicNames[i] == "Agi")
                characteristicNames[i] = "Ag"
            if (characteristicNames[i].toLowerCase() == "m") {
                model.details.move.value = characteristicValues[i];
                continue;
            }
            if (characteristicNames[i].toLowerCase() == "w")
                continue;

            try {
                model.characteristics[characteristicNames[i].toLowerCase()].initial = Number(characteristicValues[i])
            }
            catch { }
        }

        let skillBlockIndexStart = blockArray.findIndex(v => v.split(" ")[0].includes(game.i18n.localize("Skills")))
        let talentBlockIndexStart = blockArray.findIndex(v => v.split(" ")[0].includes(game.i18n.localize("Talents")))
        let traitBlockIndexStart = blockArray.findIndex(v => v.split(" ")[0].includes(game.i18n.localize("Traits")))
        let trappingBlockIndexStart = blockArray.findIndex(v => v.split(" ")[0].includes(game.i18n.localize("Trappings")) || v.split(" ")[0].includes(game.i18n.localize("Possessions")))


        let skillBlockIndex = skillBlockIndexStart
        let talentBlockIndex = talentBlockIndexStart
        let traitBlockIndex = traitBlockIndexStart
        let trappingBlockIndex = trappingBlockIndexStart

        let skillBlock = blockArray[skillBlockIndex] || "";
        let talentBlock = blockArray[talentBlockIndex] || "";
        let traitBlock = blockArray[traitBlockIndex] || "";
        let trappingBlock = blockArray[trappingBlockIndex] || "";

        while (true && skillBlockIndex >= 0) {
            skillBlockIndex++;
            if (skillBlockIndex == talentBlockIndexStart || skillBlockIndex == traitBlockIndexStart || skillBlockIndex == trappingBlockIndexStart || skillBlockIndex >= blockArray.length)
                break;

            skillBlock = skillBlock.concat(" " + blockArray[skillBlockIndex])
        }
        while (true && talentBlockIndex >= 0) {
            talentBlockIndex++;
            if (talentBlockIndex == skillBlockIndexStart || talentBlockIndex == traitBlockIndexStart || talentBlockIndex == trappingBlockIndexStart || talentBlockIndex >= blockArray.length)
                break;

            talentBlock = talentBlock.concat(" " + blockArray[talentBlockIndex])
        }
        while (true && traitBlockIndex >= 0) {
            traitBlockIndex++;
            if (traitBlockIndex == skillBlockIndexStart || traitBlockIndex == talentBlockIndexStart || traitBlockIndex == trappingBlockIndexStart || traitBlockIndex >= blockArray.length)
                break;

            traitBlock = traitBlock.concat(" " + blockArray[traitBlockIndex])
        }
        while (true && trappingBlockIndex >= 0) {
            trappingBlockIndex++;
            if (trappingBlockIndex == skillBlockIndexStart || trappingBlockIndex == talentBlockIndexStart || trappingBlockIndex == traitBlockIndexStart || trappingBlockIndex >= blockArray.length)
                break;

            trappingBlock = trappingBlock.concat(" " + blockArray[trappingBlockIndex])
        }



        let skillStrings = skillBlock.split(",").map(e => e.trim())
        let talentStrings = talentBlock.split(",").map(e => e.trim())
        let traitStrings = traitBlock.split(",").map(e => e.trim())
        let trappingStrings = trappingBlock.split(",").map(e => e.trim())

        skillStrings[0] = skillStrings[0].substring(8).trim()
        talentStrings[0] = talentStrings[0].substring(9).trim()
        traitStrings[0] = traitStrings[0].substring(7).trim()
        trappingStrings[0] = trappingStrings[0].substring(11).trim()

        skillStrings = skillStrings.filter(e => !!e);
        talentStrings = talentStrings.filter(e => !!e);
        traitStrings = traitStrings.filter(e => !!e);
        trappingStrings = trappingStrings.filter(e => !!e);


        // Fix for new skill format (DOTR)
        let skillIndicesToFixStart = []
        let skillIndicesToFixEnd = []
        for (let i=0; i < skillStrings.length; i++)
        {
            if (skillStrings[i].includes("(") && !skillStrings[i].includes(")"))
            {
                skillIndicesToFixStart.push(i);
                let found = false;
                for (let j = i+1; j < skillStrings.length && !found; j++)
                {

                    if (skillStrings[j].includes(")") && !skillStrings[j].includes("("))
                    {
                        skillIndicesToFixEnd.push(j);
                        i = j
                        found = true
                    }
                }
            }
        }



        for (let i = 0; i <  skillIndicesToFixStart.length; i++)
        {
            let fixIndex = skillIndicesToFixStart[i]
            skillStrings[fixIndex] = skillStrings[fixIndex].replace("(", "").replace(")", "").split(" ");
            skillStrings[fixIndex][1] = "(" + skillStrings[fixIndex][1] + ")"
            skillStrings[fixIndex] = skillStrings[fixIndex].join(" ")
            let skillWord = skillStrings[fixIndex].substring(0, skillStrings[fixIndex].indexOf("(")-1)
            fixIndex++
            for (fixIndex; fixIndex <= skillIndicesToFixEnd[i]; fixIndex++)
            {
                skillStrings[fixIndex] = skillStrings[fixIndex].replace("(", "").replace(")", "")
                let [spec, value] = skillStrings[fixIndex].split(" ")
                skillStrings[fixIndex] = skillWord + " (" + spec + ") " + value
            }
        }


        let skills = [];
        let talents = [];
        let traits = [];
        let trappings = [];

        for (let skill of skillStrings) {
            let splitSkill = skill.split(" ")
            let skillItem
            try {skillItem = await WFRP_Utility.findSkill(skill.substring(0, skill.length - splitSkill[splitSkill.length - 1].length).trim());}
            catch {}
            if (!skillItem) {
                console.error("Could not find " + skill)
                ui.notifications.error(game.i18n.format("ERRORParser", {name: skill}), { permanent: true })
                continue
            }
            let skillValue = Number(splitSkill[splitSkill.length - 1]);
            skillItem = skillItem.toObject()
            skillItem.data.advances.value = skillValue - model.characteristics[skillItem.data.characteristic.value].initial
            skills.push(skillItem)
        }

        for (let talent of talentStrings) {
            let talentName = ""
            let talentAdvances = 1;
            let splitTalent = talent.split(" ");
            if (!isNaN(talent[talent.length - 1])) {
                talentName = talent.substring(0, talent.length - 2).trim();
                talentAdvances = Number(splitTalent[splitTalent.length - 1]) || 1;
            }
            else
                talentName = talent.trim();

            let talentItem;
            try { talentItem = await WFRP_Utility.findTalent(talentName) }
            catch { }

            if (!talentItem) {
                console.error("Could not find " + talent)
                ui.notifications.error(game.i18n.format("ERRORParser", {name: talent}), { permanent: true })
                continue
            }
            talentItem = talentItem.toObject()
            talentItem.data.advances.value = 1;

            for (let i = 0; i < talentAdvances; i++)
                talents.push(talentItem);
        }

        for (let trait of traitStrings) {
            let traitName = "";
            let specification = "";
            if (trait.indexOf("(") != -1) {
                traitName = trait.split("(")[0].trim();
                specification = trait.substring(trait.indexOf("(") + 1, trait.indexOf(")"))
            }
            else
                traitName = trait;

            let traitItem;
            try {
                traitItem = await WFRP_Utility.findItem(traitName, "trait")
            }
            catch { }
            if (!traitItem) {
                console.error("Could not find " + trait)
                ui.notifications.error(game.i18n.format("ERRORParser", {name: trait}), { permanent: true })
                continue
            }
            traitItem = traitItem.toObject()
            if (specification)
                traitItem.data.specification.value = specification;
            traits.push(traitItem)
        }

        for (let trapping of trappingStrings) {

            let trappingItem = await WFRP_Utility.findItem(trapping, "trapping")
            if (!trappingItem) {
                trappingItem = new ItemWfrp4e({ img: "systems/wfrp4e/icons/blank.png", name: trapping, type: "trapping", data: game.system.model.Item.trapping })
                trappingItem.data.update({"trappingType.value" : "misc"})
            }
            trappings.push(trappingItem.toObject())
        }

        let moneyItems = await WFRP_Utility.allMoneyItems() || [];
        moneyItems = moneyItems.map(i => i.toObject())
        moneyItems = moneyItems.sort((a, b) => (a.data.coinValue.value > b.data.coinValue.value) ? -1 : 1);
        moneyItems.forEach(m => m.data.quantity.value = 0)

        trappings.forEach(t => {
            if (t.effects)    
                t.effects.forEach(e => {
                    e.origin = t.uuid
            })
        })
        
        talents.forEach(t => {
            t.effects.forEach(e => {
                e.origin = t.uuid
            })
        })
        
        traits.forEach(t => {
            t.effects.forEach(e => {
                e.origin = t.uuid
            })
        })
        let effects = trappings.reduce((total, trapping) => total.concat(trapping.effects), []).concat(talents.reduce((total, talent) => total.concat(talent.effects), [])).concat(traits.reduce((total, trait) => total.concat(trait.effects), []))
        effects = effects.filter(e => !!e)
        effects = effects.filter(e => e.transfer)
    
        effects.forEach(e => {
            let charChanges = e.changes.filter(c => c.key.includes("characteristics"))
            let keepChanges = e.changes.filter(c => !c.key.includes("characteristics"))
            if (charChanges.length)
                e.changes = keepChanges
            })

        return { name, type, data: model, items: skills.concat(talents).concat(traits).concat(trappings).concat(moneyItems), effects }

    }

}