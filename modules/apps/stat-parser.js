import ItemWfrp4e from "../item/item-wfrp4e.js";
import WFRP_Utility from "../system/utility-wfrp4e.js";

export default class StatBlockParser extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "stat-parser";
        options.template = "systems/wfrp4e/templates/apps/stat-parser.hbs";
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
        let {name, type, system, items} = await StatBlockParser.parseStatBlock(formData.statBlock, this.object.type)
        await this.object.update({name, type, system})
        await this.object.createEmbeddedDocuments("Item", items)
    }

    static async parseStatBlock(statString, type = "npc") {
        let model = foundry.utils.duplicate(game.model.Actor[type]);

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
        
        if (status != -1 && foundry.utils.hasProperty(model, "details.status.value"))
        {
            status = status.substring(status.indexOf("(")+1, status.indexOf(")"))
            model.details.status.value = status[0] + status.slice(1).toLowerCase();
        }

        let tableIndex = blockArray.findIndex(v => v.includes(" WS "))
        let characteristicNames = blockArray[tableIndex].split(" ")
        let characteristicValues = blockArray[tableIndex + 1].split(" ")

        for (let i = 0; i < characteristicNames.length; i++) {
            const value = Number(characteristicValues[i]) || 0;

            if (characteristicNames[i] == "Agi")
                characteristicNames[i] = "Ag"
            if (characteristicNames[i].toLowerCase() == "m") {
                model.details.move.value = value;
                continue;
            }
            if (characteristicNames[i].toLowerCase() == "w")
                continue;

            try {
                model.characteristics[characteristicNames[i].toLowerCase()].initial = value
            }
            catch { }
        }


        let skillRegex = /([a-zA-Z\s]+?)(?:\((.+?)\)|)\s?(\d{1,3}|)(?:,|$)/gm
        let talentRegex = /(?:,?(.+?)(\d{1,2})?(?:\((.+?)\)\s*(\d{1,2})?|,|$))/gm
        let traitRegex = /(?:,?(.+?)(\+?\d{1,2}\+?)?\s*?(?:\((.+?)\)\s*(\+?\d{1,2})?|,|$))/gm

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



        let skillStrings = skillBlock.substring(skillBlock.indexOf(":")+1)
        let talentStrings = talentBlock.substring(talentBlock.indexOf(":")+1)
        let traitStrings = traitBlock.substring(traitBlock.indexOf(":")+1)
        let trappingStrings = trappingBlock.substring(trappingBlock.indexOf(":")+1)


        let skillMatches = skillStrings.matchAll(skillRegex)
        let talentMatches = talentStrings.matchAll(talentRegex)
        let traitMatches = traitStrings.matchAll(traitRegex)
        //let trappingMatches = skillStrings.matchAll(trappingRegex)


        let skills = [];
        let talents = [];
        let traits = [];
        let trappings = [];


        for (let match of skillMatches){

            /**
             * 3 Cases
             * 1. Intution 67
             * 2. Language (Magick) 52
             * 3. Melee (Basic 56, Polearm 62, ...)
             */

            let skillName = match[1]; // Name of the skill, should always exist
            let skillGroup = match[2]; // either null (case 1), a word(s) (case 2) or a group of words-values pairs (case 3)
            let skillValue = match[3]  // Either null (case 3) or a value (case 1 and 2)

            let skillSearches = []
            let skillItems = []

            // Case 3
            if (!Number.isNumeric(skillValue))
            {
                let innerMatches = skillGroup.matchAll(skillRegex) // rerun regex on inner group
                for (let inner of innerMatches)
                {
                    skillSearches.push({name : skillName, group : inner[1], value : inner[3]})
                }
            }
            else // case 1 and 2
            {
                skillSearches.push({name : skillName, group : skillGroup, value : skillValue})
            }

            skillSearches.forEach(s => {
                s.name = s.name?.trim();
                s.group = s.group?.trim();
                s.value = s.value?.trim();
            })


            for(let search of skillSearches)
            {
                let skillItem
                try {skillItem = await WFRP_Utility.findSkill(`${search.name} ${search.group ? "(" + search.group + ")" : ""}`.trim())}
                catch {}
                if (!skillItem) {
                    console.error("Could not find " + search.name)
                    ui.notifications.error(game.i18n.format("ERROR.Parser", {name: search.name}), { permanent: true })
                    continue
                }
                else skillItem = skillItem.toObject()

                skillItem.system.advances.value = Number(search.value) - model.characteristics[skillItem.system.characteristic.value].initial

                skillItems.push(skillItem)

            }
            skills = skills.concat(skillItems)
        }
        
        for (let match of talentMatches){

            let talentName = match[1].trim()
            let talentAdvances = parseInt(match[2] || match[4]) // could be match 2 or 4 depending on if there's a specialization
            let talentSpec = match[3]?.trim()

            let talentItem;
            try { talentItem = await WFRP_Utility.findTalent(talentName) }
            catch { }

            if (!talentItem) {
                console.error("Could not find " + talentName)
                ui.notifications.error(game.i18n.format("ERROR.Parser", {name: talentName}), { permanent: true })
                continue
            }
            talentItem = talentItem.toObject()

            if (talentName == game.i18n.localize("NAME.Doomed"))
            {
                talentItem.system.description.value += `<br><br><em>${talentSpec}</em>`
            }
            else if (talentName == game.i18n.localize("NAME.Etiquette"))
            {
                talentItem.system.tests.value = talentItem.system.tests.value.replace(game.i18n.localize("Social Group"), match[3])
                talentItem.name += ` (${talentSpec})`
            }
            else if (talentName == game.i18n.localize("NAME.Resistance"))
            {
                talentItem.system.tests.value = talentItem.system.tests.value.replace(game.i18n.localize("the associated Threat"), match[3])
                talentItem.name += ` (${talentSpec})`
            }
            else if (talentName == game.i18n.localize("NAME.AcuteSense"))
            {
                talentItem.system.tests.value = talentItem.system.tests.value.replace(game.i18n.localize("Sense"), match[3])
                talentItem.name += ` (${talentSpec})`
            }
            else if (talentName == game.i18n.localize("NAME.Strider"))
            {
                talentItem.system.tests.value = talentItem.system.tests.value.replace(game.i18n.localize("the Terrain"), match[3])
                talentItem.name += ` (${talentSpec})`
            }
            else if (talentName == game.i18n.localize("NAME.Savant"))
            {
                talentItem.system.tests.value = talentItem.system.tests.value.replace(game.i18n.localize("chosen Lore"), match[3])
                talentItem.name += ` (${talentSpec})`
            }
            else if (talentName == "Craftsman")
            {
                talentItem.system.tests.value = talentItem.system.tests.value.replace("any one", match[3])
                talentItem.name += ` (${talentSpec})`
            }
            else if (talentSpec)
                talentItem.name += ` (${talentSpec})`

            talentItem.system.advances.value = 1;

            if (Number.isNumeric(talentAdvances))
            {
                for (let i = 1; i < talentAdvances; i++)
                    talents.push(talentItem);

            }
            talents.push(talentItem)
        }

        for (let match of traitMatches) {

            let traitName = match[1]
            let traitVal = match[2] || match[4] // could be match 2 or 4 depending on if there's a specialization
            let traitSpec = match[3]


            let traitItem;
            try {
                traitItem = await WFRP_Utility.findItem(traitName, "trait")
            }
            catch { }
            if (!traitItem) {
                console.error("Could not find " + traitName)
                ui.notifications.error(game.i18n.format("ERROR.Parser", {name: traitName}), { permanent: true })
                continue
            }
            traitItem = traitItem.toObject()

            if (Number.isNumeric(traitVal))
            {
                traitItem.system.specification.value = traitName.includes('Weapon','Horns','Tail','Tentacles','Bite') ? traitVal - parseInt(characteristicValues[3]/10) : traitVal;
                traitItem.name = (traitItem.name +  ` ${traitSpec ? "("+ traitSpec + ")" : ""}`).trim()
            }
            else 
                traitItem.system.specification.value = traitSpec

            traits.push(traitItem)
        }

        if (trappingStrings)
        {
            for (let trapping of trappingStrings.split(",")) {
    
                let trappingItem = await WFRP_Utility.findItem(trapping, game.wfrp4e.config.trappingItems)
                if (!trappingItem) {
                    trappingItem = new ItemWfrp4e({ img: "systems/wfrp4e/icons/blank.png", name: trapping, type: "trapping", data: game.model.Item.trapping })
                    trappingItem.updateSource({"trappingType.value" : "misc"})
                }
                trappings.push(trappingItem.toObject())
            }
        }

        let moneyItems = await WFRP_Utility.allMoneyItems() || [];
        // moneyItems = moneyItems.map(i => i.toObject())
        moneyItems = moneyItems.sort((a, b) => (a.system.coinValue > b.system.coinValue) ? -1 : 1);
        moneyItems.forEach(m => m.system.quantity.value = 0)

        skills.forEach(t => {
            delete t._id
        })

        trappings.forEach(t => {
            delete t._id
        })
        
        talents.forEach(t => {
            delete t._id
        })
        traits.forEach(t => {
            delete t._id
        })

        let items = skills.concat(talents).concat(traits).concat(trappings).concat(moneyItems)

        let effects = items.reduce((effects, item) => effects.concat(item.effects), []);

        effects.forEach(e => {
            for(let c of e.changes)
            {
                let systemPath = c.key.replace("system.", "");
                if (foundry.utils.hasProperty(model, systemPath))
                {
                    foundry.utils.setProperty(model, systemPath, -1 * Number(c.value) + foundry.utils.getProperty(model, systemPath));
                }
            }
        })

        return { name, type, system: model, items}
    }

}