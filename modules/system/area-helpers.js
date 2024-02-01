export default class AreaHelpers
{
    static SEMAPHORE = new foundry.utils.Semaphore(1);
    /**
     * Determines if a coordinate is within a Template's strokes
     *
     * @param {Object} {x, y} object being tested
     * @param {Template} template Template object being tested
     * @returns
     */
    static isInTemplate(token, template) {
        let point = token.object.center;
        //TODO: check if boneyard module is present and use it instead.
        if (template.t == "rect") {
            return AreaHelpers._isInRect(point, template);
        }
        else if (["ray", "cone"].includes(template.t)) {
            return AreaHelpers._isInPolygon(point, template);
        }
        else if (template.t == "circle") {
            return AreaHelpers._isInEllipse(point, template);
        }
    }


    /**
     * Get all Tokens inside template
     *
     * @returns
     */
    static tokensInTemplate(template) {
        let scene = template.scene;
        let tokens = scene.tokens.contents;
        return tokens.filter(t => AreaHelpers.isInTemplate(t, template));
    }

    static _isInEllipse(point, template) {
        let grid = canvas.scene.grid;
        let templateGridSize = template.distance/grid.distance * grid.size
        // NEED TO USE template.document - hooks don't reflect template.x/y immediately
        let ellipse = new PIXI.Ellipse(template.x, template.y, templateGridSize, templateGridSize);
        return ellipse.contains(point.x, point.y);
    }


    // Not used currently
    static _isInRect(point, template) {
        // let x1 = template.document.x;
        // let x2 = x1 + template.document.shape.width;
        // let y1 = template.document.y;
        // let y2 = y1 + template.document.shape.height;

        // if (point.x > x1 && point.x < x2 && point.y > y1 && point.y < y2)
        // {
        //     return true;
        // }
    }

    // Not used currently
    static _isInPolygon(point, template) {
        // points are relative to origin of the template, needs to be origin of the map
        let polygon = new PIXI.Polygon(template.object.shape.points.map((coord, index) => coord += index % 2 == 0 ? template.x : template.y ));
        return polygon.contains(point.x, point.y);
    }


    static auraEffectToTemplateData(effect, token) {
        let template = {
            t: "circle",
            user: game.user.id,
            distance: effect.radius,
            direction: 0,
            x: token.center.x,
            y: token.center.y,
            flags: {
                wfrp4e: {
                    effectUuid: effect.uuid,
                    auraToken: token.document.uuid
                }
            }
        };
        return template
    }

    static async checkAreasThreadSafe(scene) {
        //AOETemplate.fromEffect(effectUuid, messageId, radius).drawPreview(event);
        let tokens = scene.tokens;
        let templates = scene.templates.contents.map(t => t);

        for (let template of templates) {
            let auraTokenUuid = template.getFlag("wfrp4e", "auraToken");
            let effectUuid = template.getFlag("wfrp4e", "effectUuid");
            if (!auraTokenUuid) continue;
            let token = await fromUuid(auraTokenUuid);
            let effect = await fromUuid(effectUuid);
            if (!token || !effect) {
                await template.delete();
            }
        }

        for (let token of tokens) {
            //check auras and create templates if needed
            let auraEffects = token.actor.auras;
            for (let auraEffect of auraEffects) {
                let existingTemplate = templates
                    .find(t => t.getFlag("wfrp4e", "effectUuid") == auraEffect.uuid && t.getFlag("wfrp4e", "auraToken") == token.uuid);
                if (!existingTemplate) { // create template
                    let templateData = AreaHelpers.auraEffectToTemplateData(auraEffect, token.object);
                    existingTemplate = await token.object.scene.createEmbeddedDocuments("MeasuredTemplate", [templateData]);
                    templates.push(existingTemplate[0]);
                } else { // move template to token
                    const updates = { _id: existingTemplate._id, flags: {wfrp4e: {preventRecursive: Date.now()}}, ...token.object.center };
                    await token.object.scene.updateEmbeddedDocuments("MeasuredTemplate", [updates]);
                }
            }
        }

        for (let token of tokens) {
            for (let template of templates) {
                let effectUuid = template.getFlag("wfrp4e", "effectUuid");
                let auraTokenUuid = template.getFlag("wfrp4e", "auraToken");
                if (!effectUuid) continue;

                let existingEffect = token.actor.currentAreaEffects.find(effect => effect.getFlag("wfrp4e", "fromArea") == template.uuid && !effect.applicationData.keep)
                                    ?? token.actor.auras.find(effect => effect.uuid == effectUuid);
                let inTemplate = AreaHelpers.isInTemplate(token, template)
                if (inTemplate && !existingEffect) {
                    let effect = template.areaEffect();
                    if (effect && auraTokenUuid != token.uuid) {// Specifically don't apply auras to self
                        // if template was placed from a test
                        let messageId = template.getFlag("wfrp4e", "messageId")
                        let effectData = effect.convertToApplied(game.messages.get(messageId)?.getTest());
                        setProperty(effectData, "flags.wfrp4e.fromArea", template.uuid);
                        // Can't just send UUID because we need to include fromArea flags
                        await token.actor.applyEffect({effectData : [effectData], messageId});
                    }
                } else if (!inTemplate && existingEffect && auraTokenUuid != token.uuid) {// If not in template, remove all effects originating from that template
                    await existingEffect.delete();
                }
            }

            // Remove effects that are from templates that don't exist anymore
            for (let effect of token.actor.effects.filter(e => e.getFlag("wfrp4e", "fromArea") && !e.applicationData.keep)) {
                let fromId = effect.getFlag("wfrp4e", "fromArea")
                let foundTemplate = templates.find(t => t.uuid == fromId);                
                if (!foundTemplate) {
                    await effect.delete();
                }
            }
        }
    }

    // Perhaps this is expensive to run on every token update
    // but works for now
    static async checkAreas(scene) {
        await AreaHelpers.SEMAPHORE.add(AreaHelpers.checkAreasThreadSafe, scene);
    }
}