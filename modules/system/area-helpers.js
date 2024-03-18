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
    static isInTemplate(tokenDocument, templateDocument) {
        let collisionMethod = game.settings.get("wfrp4e", "templateCollisionMethod");
        let minimalRatio = 0.25;
        if (collisionMethod == "centerPoint") {
            let point = tokenDocument.object.center;
            return templateDocument.object.shape.contains(point.x - templateDocument.x, point.y - templateDocument.y);
        } else if (collisionMethod == "grid") {
            let points = this.getTokenGridCenterPoints(tokenDocument);
            const containedCount = points.reduce((counter, p) => (counter += templateDocument.object.shape.contains(p.x - templateDocument.x, p.y - templateDocument.y) ? 1 : 0), 0);
            return containedCount / points.length >= minimalRatio; // if more than 25% of the centers of grid cells taken by token is in the template, return true
        } else if (collisionMethod == "area") {

            const size  = tokenDocument.parent.dimensions.size;
            const tokenRectanglePolygon = new PIXI.Rectangle(tokenDocument.x, tokenDocument.y, tokenDocument.width * size, tokenDocument.height * size).toPolygon();
            let templatePoly;

            switch (templateDocument.object.shape.type) {
                case 0: // generic poly
                    let x = templateDocument.x * 100;
                    let y = templateDocument.y * 100;
                    const clipperPolygon = templateDocument.object.shape.toClipperPoints();
                    clipperPolygon.forEach((p) => {
                        p.X += x;
                        p.Y += y;
                    });
                    templatePoly = PIXI.Polygon.fromClipperPoints(clipperPolygon, options);
                    break;
                case 1: // rect
                case 2: // circle
                    const shapeCopy = templateDocument.object.shape.clone();
                    shapeCopy.x += templateDocument.x;
                    shapeCopy.y += templateDocument.y;
                    templatePoly = shapeCopy.toPolygon();
                    break;
            }
            const intersectionArea = templatePoly.intersectPolygon(tokenRectanglePolygon).signedArea();
            return (intersectionArea / Math.min(templatePoly.signedArea(), tokenRectanglePolygon.signedArea())) >= minimalRatio;
        } else {
            throw new Error("Invalid collision method");
        }
    }

    static getTokenGridCenterPoints(tokenDocument) {
        if (tokenDocument.object === null || tokenDocument.parent !== canvas.scene || canvas.grid.type === CONST.GRID_TYPES.GRIDLESS) {
            return [];
        }

        const size  = tokenDocument.parent.dimensions.size;
        const tokenRectangle = new PIXI.Rectangle(tokenDocument.x, tokenDocument.y, tokenDocument.width * size, tokenDocument.height * size);
        const d = game.canvas.dimensions;
        const grid = game.canvas.grid.grid;
        const [x, y] = [tokenDocument.x + (tokenDocument.width * d.size) / 2, tokenDocument.y + (tokenDocument.height * d.size) / 2]; // set x,y to token center
        const distance = (Math.sqrt(tokenDocument.width * tokenDocument.width + tokenDocument.height * tokenDocument.height) / 2) * d.distance;

        // ---------- modified from foundry MeasuredTemplate._getGridHighlightPositions ----------

        // Get number of rows and columns
        const [maxRow, maxCol] = grid.getGridPositionFromPixels(d.width, d.height);
        let nRows = Math.ceil((distance * 1.5) / d.distance / (d.size / grid.h));
        let nCols = Math.ceil((distance * 1.5) / d.distance / (d.size / grid.w));
        [nRows, nCols] = [Math.min(nRows, maxRow), Math.min(nCols, maxCol)];

        // Get the offset of the template origin relative to the top-left grid space
        const [tx, ty] = grid.getTopLeft(x, y);
        const [row0, col0] = grid.getGridPositionFromPixels(tx, ty);
        const [hx, hy] = [Math.ceil(grid.w / 2), Math.ceil(grid.h / 2)];
        const isCenter = x - tx === hx && y - ty === hy;

        // Identify grid coordinates covered by the template Graphics
        const positions = [];
        for (let r = -nRows; r < nRows; r++) {
            for (let c = -nCols; c < nCols; c++) {
                const [gx, gy] = grid.getPixelsFromGridPosition(row0 + r, col0 + c);
                // const [testX, testY] = [gx + hx - x, gy + hy - y];
                // original shifts test points by shape's x,y as template shapes are defined at a 0,0 origin, but the shapes
                // ByTokens generate for collision are not relative to a 0,0 origin and instead the token's actual x,y
                // position on the grid, shifting the test points isn't required
                const [testX, testY] = [gx + hx, gy + hy];
                const contains = (r === 0 && c === 0 && isCenter) || grid._testShape(testX, testY, tokenRectangle);
                if (!contains) continue;
                // original saves top-left of grid space, save center of space instead
                positions.push({ x: testX, y: testY });
            }
        }
        return positions;
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

    static auraEffectToTemplateData(effect, token) {
        let template = {
            t: "circle",
            user: game.user.id,
            distance: effect.applicationData.radius,
            direction: 0,
            x: token.center.x,
            y: token.center.y,
            flags: {
                wfrp4e: {
                    effectUuid: effect.uuid,
                    auraToken: token.document.uuid,
                    round: game.combat?.round ?? -1
                }
            }
        };
        if (effect.flags.wfrp4e.sourceTest?.data.context.messageId) {
            template.flags.wfrp4e.messageId = effect.flags.wfrp4e.sourceTest.data.context.messageId;
        }
        return template
    }

    static async checkAreasThreadSafe(scene) {
        let tokens = scene.tokens;
        let templates = scene.templates.contents.map(t => t);

        for (let template of templates) {
            let auraTokenUuid = template.getFlag("wfrp4e", "auraToken");
            let effectUuid = template.getFlag("wfrp4e", "effectUuid");
            if (!effectUuid) continue;
            let effect = await fromUuid(effectUuid);
            if (!effect) {
                await template.delete();
            }
            if (!auraTokenUuid) continue;
            let token = await fromUuid(auraTokenUuid);
            if (!token) {
                await template.delete();
            }
        }

        for (let token of tokens) {
            //check auras and create templates if needed
            let auraEffects = token.actor.auras;
            for (let auraEffect of auraEffects) {
                    if (auraEffect.applicationData.radius) {
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
        await new Promise(resolve => setTimeout(resolve, 500));
        await AreaHelpers.SEMAPHORE.add(AreaHelpers.checkAreasThreadSafe, scene);
    }
}