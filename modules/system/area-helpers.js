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
    static isInTemplate(tokenDocument, templateObject) {
        let collisionMethod = game.settings.get("wfrp4e", "templateCollisionMethod");
        let minimalRatio = 0.25;
        // since template from Auras is not drawn, it doesn't have a shape and has to be recalculated.
        if (!templateObject.shape) {
            let {x, y, direction, distance} = templateObject.document;
            distance *= game.canvas.dimensions.distancePixels;
            direction = Math.toRadians(direction);
            templateObject.ray = Ray.fromAngle(x, y, direction, distance);

            templateObject.shape = templateObject._computeShape();
        }
        if (collisionMethod == "centerPoint") {
            let point = tokenDocument.object.center;
            return templateObject.shape.contains(point.x - templateObject.x, point.y - templateObject.y);
        } else if (collisionMethod == "grid") {
            let points = this.getTokenGridCenterPoints(tokenDocument);
            const containedCount = points.reduce((counter, p) => (counter += templateObject.shape.contains(p.x - templateObject.x, p.y - templateObject.y) ? 1 : 0), 0);
            return containedCount / points.length >= minimalRatio; // if more than 25% of the centers of grid cells taken by token is in the template, return true
        } else if (collisionMethod == "area") {

            const size  = tokenDocument.parent.dimensions.size;
            const tokenRectanglePolygon = new PIXI.Rectangle(tokenDocument.x, tokenDocument.y, tokenDocument.width * size, tokenDocument.height * size).toPolygon();
            let templatePoly;

            switch (templateObject.shape.type) {
                case 0: // generic poly
                    let x = templateObject.x * 100;
                    let y = templateObject.y * 100;
                    const clipperPolygon = templateObject.shape.toClipperPoints();
                    clipperPolygon.forEach((p) => {
                        p.X += x;
                        p.Y += y;
                    });
                    templatePoly = PIXI.Polygon.fromClipperPoints(clipperPolygon, options);
                    break;
                case 1: // rect
                case 2: // circle
                    const shapeCopy = templateObject.shape.clone();
                    shapeCopy.x += templateObject.x;
                    shapeCopy.y += templateObject.y;
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
                const contains = (r === 0 && c === 0 && isCenter) || this.testShape(testX, testY, tokenRectangle);
                if (!contains) continue;
                // original saves top-left of grid space, save center of space instead
                positions.push({ x: testX, y: testY });
            }
        }
        return positions;
    }

    static testShape(x, y, shape) {
        for (let dx = -0.5; dx <= 0.5; dx += 0.5) {
            for (let dy = -0.5; dy <= 0.5; dy += 0.5) {
                if (shape.contains(x + dx, y + dy)) return true;
            }
        }
    }

    /**
     * Get all Tokens inside template
     *
     * @returns
     */
    static tokensInTemplate(templateObject) {
        let scene = templateObject.document.scene;
        let tokens = scene.tokens.contents;
        return tokens.filter(t => AreaHelpers.isInTemplate(t, templateObject));
    }

    static auraEffectToTemplate(effect, token) {
        let messageId = effect.flags.wfrp4e.sourceTest?.data.context.messageId;
        let radius = 1;
        try {
            radius = effect.radius;
        } catch (e) {
            console.warn("Error getting radius for aura effect", effect, e);
        }

        let template = new MeasuredTemplate(new CONFIG.MeasuredTemplate.documentClass(mergeObject({
            t: "circle",
            _id : effect.id,
            user: game.user.id,
            distance: radius,
            direction: 0,
            x: token.center.x, // Using the token x/y will double the template's coordinates, as it's already a child of the token
            y: token.center.y, // However, this is necessary to get tho correct grid highlighting. The template's position is corrected when it's rendered (see renderAura)
            fillColor: game.user.color,
            flags: {
                wfrp4e: {
                    effectUuid: effect.uuid,
                    auraToken: token.document.uuid,
                    round: game.combat?.round ?? -1,
                    messageId: messageId
                }
            }
        }, effect.flags.wfrp4e?.applicationData?.templateData || {}), {parent : canvas.scene}));

        // For some reason, these temporary templates have 0,0 as their coordinates
        // instead of the ones provided by the document, so set them manually
        template.x = template.document.x;
        template.y = template.document.y;
        template.auraEffect = effect;
        return template;
    }

    static async checkAreasThreadSafe(scene) {
        scene = scene || canvas.scene;
        let tokens = scene.tokens;
        let auras = await AreaHelpers.aurasInScene(scene);
        let templates = scene.templates.contents.map(t => t.object).concat(auras);

        for (let template of templates) {
            let auraTokenUuid = template.document.getFlag("wfrp4e", "auraToken");
            let effectUuid = template.document.getFlag("wfrp4e", "effectUuid");
            if (!effectUuid) continue;
            if (auraTokenUuid) continue;
            let effect = await fromUuid(effectUuid);
            if (!effect) {
                await template.document.delete();
            }
        }

        for (let token of tokens) {
            for (let template of templates) {
                // An area could be a template, but could be an effect (aura)
                let areaUuid = (template.document.uuid ? template.document.uuid : template.document.flags.wfrp4e.effectUuid);
                let effectUuid = template.document.getFlag("wfrp4e", "effectUuid");
                let auraTokenUuid = template.document.getFlag("wfrp4e", "auraToken");
                if (!effectUuid) continue;

                let existingEffect = token.actor.currentAreaEffects.find(effect => effect.getFlag("wfrp4e", "fromArea") == areaUuid && !effect.applicationData.keep)
                                    ?? token.actor.auras.find(effect => effect.uuid == effectUuid);
                let inTemplate = AreaHelpers.isInTemplate(token, template)
                if (inTemplate && !existingEffect) {
                    let effect = template.document.areaEffect() || template.auraEffect;
                    if (effect && auraTokenUuid != token.uuid) {// Specifically don't apply auras to self
                        // if template was placed from a test
                        let messageId = template.document.getFlag("wfrp4e", "messageId")
                        let effectData = effect.convertToApplied(game.messages.get(messageId)?.getTest(), token.actor);
                        setProperty(effectData, "flags.wfrp4e.fromArea", areaUuid);
                        // Can't just send UUID because we need to include fromArea flags
                        await token.actor.applyEffect({effectData : [effectData], messageId});
                    }
                } else if (!inTemplate && existingEffect && !template.document.getFlag("wfrp4e", "instantaneous") && auraTokenUuid != token.uuid) {// If not in template, remove all effects originating from that template
                    await existingEffect.delete();
                }
            }

            // Remove effects that are from templates that don't exist anymore
            for (let effect of token.actor.effects.filter(e => e.getFlag("wfrp4e", "fromArea") && !e.applicationData.keep)) {
                let fromId = effect.getFlag("wfrp4e", "fromArea")
                let foundTemplate = templates.find(t => t.document.uuid == fromId);                
                if (!foundTemplate) {
                    await effect.delete();
                }
            }
        }
    }


    // Create temporary MeasuredTemplates so that auras can
    // be processed the same way as normal Area effects
    static aurasInScene(scene) {
        let templates = [];
        for (let token of scene.tokens) {
            if (!token.actor)
                continue;

            let auraEffects = token.actor.auras;
            for (let effect of auraEffects) {
                templates.push(this.auraEffectToTemplate(effect, token.object));
            }
        }
        return Promise.all(templates);
    }
 
    // Perhaps this is expensive to run on every token update
    // but works for now
    static async checkAreas(scene) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await AreaHelpers.SEMAPHORE.add(AreaHelpers.checkAreasThreadSafe, scene);
    }
}