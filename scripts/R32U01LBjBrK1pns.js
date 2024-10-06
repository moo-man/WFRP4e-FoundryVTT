        const templateMap = {
            'P2e7Yx98bK3u110a' : "",
            'iuMp3KLaMT2WCmie' : "Xp4r2KUhqfjak8zq", 
            'RBuYcT5tppwcmnC5' : "wYN19h3WVF1yOVq2", 
            'vcGpNwNbhvfzVveQ' : "ac5ClOuaYtzOYyWp", 
            'jmhKZy0w9TzkEK9c' : "IS3LTdTuay6uRHUq", 
            '9Byj6k7SmdTYis2V' : "LjMlx99gBGeRJUQu", 
            'laJwc2l9tzJPgaaJ' : "x5wpMprsObuqMCYg",
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