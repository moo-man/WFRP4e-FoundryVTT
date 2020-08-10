import ItemWfrp4e from "../item/item-wfrp4e";
import WFRP_Utility from "../../apps/utility-wfrp4e";

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
        let name = blockArray[0].split("–")[0].split(" ").filter(f => !!f);

        name = name.map(word => {
            if (word == "VON")
                return word.toLowerCase();

            word = word.toLowerCase();
            word = word[0].toUpperCase() + word.substring(1, word.length);
            return word;
        })
        name = name.join(" ")

        let tableIndex = blockArray.findIndex(v => v[0] == "M")
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

        let skillBlockIndex = blockArray.findIndex(v => v.split(" ")[0].includes("Skills"))
        let talentBlockIndex = blockArray.findIndex(v => v.split(" ")[0].includes("Talents"))
        let traitBlockIndex = blockArray.findIndex(v => v.split(" ")[0].includes("Traits"))
        let trappingBlockIndex = blockArray.findIndex(v => v.split(" ")[0].includes("Trappings"))

        let skillBlock = blockArray[skillBlockIndex] || "";
        let talentBlock = blockArray[talentBlockIndex] || "";
        let traitBlock = blockArray[traitBlockIndex] || "";
        let trappingBlock = blockArray[trappingBlockIndex] || "";

        while (true && skillBlockIndex >= 0) {
            skillBlockIndex++;
            if (skillBlockIndex == talentBlockIndex || skillBlockIndex == traitBlockIndex || skillBlockIndex == trappingBlockIndex || skillBlockIndex >= blockArray.length)
                break;

            skillBlock = skillBlock.concat(" " + blockArray[skillBlockIndex])
        }
        while (true && talentBlockIndex >= 0) {
            talentBlockIndex++;
            if (talentBlockIndex == skillBlockIndex || talentBlockIndex == traitBlockIndex || talentBlockIndex == trappingBlockIndex || talentBlockIndex >= blockArray.length)
                break;

            talentBlock = talentBlock.concat(" " + blockArray[talentBlockIndex])
        }
        while (true && traitBlockIndex >= 0) {
            traitBlockIndex++;
            if (traitBlockIndex == skillBlockIndex || traitBlockIndex == talentBlockIndex || traitBlockIndex == trappingBlockIndex || traitBlockIndex >= blockArray.length)
                break;

            traitBlock = traitBlock.concat(" " + blockArray[traitBlockIndex])
        }
        while (true && trappingBlockIndex >= 0) {
            trappingBlockIndex++;
            if (trappingBlockIndex == skillBlockIndex || trappingBlockIndex == talentBlockIndex || trappingBlockIndex == traitBlockIndex || trappingBlockIndex >= blockArray.length)
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

        let skills = [];
        let talents = [];
        let traits = [];
        let trappings = [];

        for (let skill of skillStrings) {
            let splitSkill = skill.split(" ")
            let skillItem = await WFRP_Utility.findSkill(skill.substring(0, skill.length - splitSkill[splitSkill.length - 1].length).trim());
            if (!skillItem) {
                console.error("Could not find " + skill)
                ui.notifications.error("Could not find " + skill, { permanent: true })
                continue
            }
            let skillValue = Number(splitSkill[splitSkill.length - 1]);
            skillItem.data.data.advances.value = skillValue - model.characteristics[skillItem.data.data.characteristic.value].initial
            skills.push(skillItem)
        }

        for (let talent of talentStrings) {
            let talentName = ""
            let talentAdvances = 1;
            let splitTalent = talent.split(" ");
            if (!isNaN(talent[talent.length - 1])) {
                talentName = talent.substring(0, talent.length - 2).trim();
                talentAdvances = Number(splitTalent[splitTalent.length - 1]);
            }
            else
                talentName = talent.trim();

            let talentItem;
            try { talentItem = await WFRP_Utility.findTalent(talentName) }
            catch { }

            if (!talentItem) {
                console.error("Could not find " + talent)
                ui.notifications.error("Could not find " + talent, { permanent: true })
                continue
            }
            talentItem.data.data.advances.value = talentAdvances;

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
                ui.notifications.error("Could not find " + trait, { permanent: true })
                continue
            }
            if (specification)
                traitItem.data.data.specification.value = specification;
            traits.push(traitItem)
        }

        for (let trapping of trappingStrings) {

            let trappingItem = await WFRP_Utility.findItem(trapping, "trapping")
            if (!trappingItem) {
                trappingItem = new ItemWfrp4e({ img: "systems/wfrp4e/icons/blank.png", name: trapping, type: "trapping", data: game.system.model.Item.trapping })
                trappingItem.data.data.trappingType.value = "misc"
            }
            trappings.push(trappingItem)
        }

        return { name, type, data: model, items: skills.concat(talents).concat(traits).concat(trappings) }

    }

}