        const templateMap = {
            'P2e7Yx98bK3u110a' : "",
            'iuMp3KLaMT2WCmie' : "4s01nHFKVKTEZd3B", 
            'RBuYcT5tppwcmnC5' : "h3yuJDWnixliXeBG", 
            'vcGpNwNbhvfzVveQ' : "7QrsbofccMOE1YsF", 
            'jmhKZy0w9TzkEK9c' : "scVTPVyDDbli4WZL", 
            '9Byj6k7SmdTYis2V' : "4Cd7Dknee2WjReOo", 
            'laJwc2l9tzJPgaaJ' : "2hJ2a5YjbwZWWYrd",
        }
        let template = (await game.wfrp4e.tables.rollTable("hireling-templates", {hideDSN: true})).object;
        let physicalQuirk = (await game.wfrp4e.tables.rollTable("physical-quirks", {hideDSN: true})).text;
        let workEthic = (await game.wfrp4e.tables.rollTable("work-ethic", {hideDSN: true})).text;
        let personalityQuirk = (await game.wfrp4e.tables.rollTable("personality-quirks", {hideDSN: true})).text;


        let templateItem = await warhammer.utility.findItemId(templateMap[template._id]);

        let bio = 
        `
        <p><strong>Template</strong>: ${template.text}</p>
        <p><strong>Phsyical Quirk</strong>: ${physicalQuirk}</p>
        <p><strong>Work Ethic</strong>: ${workEthic}</p>
        <p><strong>Personality Quirk</strong>: ${personalityQuirk}</p>
        `
        
        this.script.message(bio, {whisper : ChatMessage.getWhisperRecipients("GM")})

        await this.actor.update({"system.details.gmnotes.value" : bio})

        if (templateItem)
        {
            this.actor.createEmbeddedDocuments("Item", [templateItem.toObject()])
        }