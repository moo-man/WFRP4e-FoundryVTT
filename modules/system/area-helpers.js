export default class AreaHelpers
{
    /**
     * Determines if a coordinate is within a Template's strokes
     *
     * @param {Object} {x, y} object being tested
     * @param {Template} template Template object being tested
     * @returns
     */
    static isInTemplate(point, template)
    {
        if (template.document.t == "rect")
        {
            return this._isInRect(point, template);
        }
        else if (["ray", "cone"].includes(template.document.t))
        {
            return this._isInPolygon(point, template);
        }
        else if (template.document.t == "circle")
        {
            return this._isInEllipse(point, template);
        }
    }


    /**
     * Get all Tokens inside template
     *
     * @returns
     */
    static tokensInTemplate(template)
    {
        let scene = template.scene;
        let tokens = scene.tokens.contents;
        return tokens.filter(t => this.isInTemplate(t.object.center, template));
    }

    static _isInEllipse(point, template)
    {
        let grid = canvas.scene.grid;
        let templateGridSize = template.document.distance/grid.distance * grid.size
        // NEED TO USE template.document - hooks don't reflect template.x/y immediately
        let ellipse = new PIXI.Ellipse(template.document.x, template.document.y, templateGridSize, templateGridSize);
        return ellipse.contains(point.x, point.y);
    }


    // Not used currently
    static _isInRect(point, template)
    {
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
    static _isInPolygon(point, template)
    {                                                                                 // points are relative to origin of the template, needs to be origin of the map
        let polygon = new PIXI.Polygon(template.shape.points.map((coord, index) => coord += index % 2 == 0 ? template.document.x : template.document.y ));
        return polygon.contains(point.x, point.y);
    }


    // Perhaps this is expensive to run on every token update
    // but works for now
    static async checkAreas(scene)
    {
        let tokens = scene.tokens;
        let templates = scene.templates.contents.map(t => t.object).concat(await this.aurasInScene(scene));

        for(let token of tokens)
        {
            for(let template of templates)
            {
                // An area could be a template, but could be an effect (aura)
                let areaUuid = (template.document.id ? template.document?.uuid : template.document.flags.wfrp4e.effectUuid);

                let existingEffect = token.actor.currentAreaEffects.find(effect => effect.getFlag("wfrp4e", "fromArea") == areaUuid && !effect.applicationData.keep);
                let inTemplate = this.isInTemplate(token.object.center, template)
                if (inTemplate && !existingEffect)
                {
                    let effect = template.document.areaEffect() || template.auraEffect
                    if (effect)
                    {

                        let effectData = effect.convertToApplied();
                        setProperty(effectData, "flags.wfrp4e.fromArea",  areaUuid);
                        // Can't just send UUID because we need to include fromArea flags
                        token.actor.applyEffect({effectData : [effectData]});
                    }
                }
                else if (!inTemplate && existingEffect) // If not in template, remove all effects originating from that template
                {
                    existingEffect.delete();
                }
            }
        }
    }

    /**
     * When a token is updated, check new position vs old and collect which area effects
     * to add or remove based on areas left and entered.
     *
     * @param {Token} token Token being updated
     * @param {Object} update Token update data (new x and y)
     * @param {Array} templates Array of Template instances to check
     */
    // static async checkTokenUpdate(token, update, templates)
    // {
    //     if (!(templates instanceof Array))
    //     {
    //         templates = [templates];
    //     }

    //     templates = templates.concat(await this.aurasInScene(token.parent));

    //     if (update.x || update.y)
    //     {
    //         let preX = {x : token.object.center.x, y: token.object.center.y};
    //         let postX = {
    //             x :(update.x || token.x) + canvas.grid.size / 2 ,
    //             y: (update.y || token.y) + canvas.grid.size / 2
    //         };

    //         let toAdd = [];
    //         let toRemove = [];

    //         let currentAreaEffects = token.actor?.currentAreaEffects || [];



    //         let entered = [];
    //         let left = [];
    //         for (let template of templates)
    //         {
    //             if (AreaHelpers.isInTemplate(postX, template) && !AreaHelpers.isInTemplate(preX, template)) // If entering Area
    //             {
    //                 entered.push(template);
    //             }

    //             if (!AreaHelpers.isInTemplate(postX, template) && AreaHelpers.isInTemplate(preX, template)) // If leaving Area
    //             {
    //                 left.push(template);
    //             }
    //         }

    //         for(let template of left)
    //         {
    //             toRemove = toRemove.concat(currentAreaEffects.filter(effect => effect.getFlag("wfrp4e", "fromArea") == (template.document.id ? template.document?.uuid : template.document.flags.wfrp4e.effectUuid) && !effect.applicationData.keep));
    //         }

    //         for(let template of entered)
    //         {
    //             toAdd = toAdd.concat(template.document.areaEffect());
    //         }


    //         await token.actor.deleteEmbeddedDocuments("ActiveEffect", toRemove.filter(e => e).map(e => e.id));
    //         await token.actor.createEmbeddedDocuments("ActiveEffect", toAdd.filter(e => e).map(e => e.convertToApplied()));
    //     }
    // }


    // Create temporary MeasuredTemplates so that auras can
    // be processed the same way as normal Area effects
    static aurasInScene(scene)
    {
        let templates = []
        for(let token of scene.tokens)
        {
            let auraEffects = token.actor.auras;
            for (let effect of auraEffects)
            {
                templates.push(this.effectToTemplate(effect));
            }
        }
        return Promise.all(templates);
    }

    static async effectToTemplate(effect)
    {
        let token = effect.actor.getActiveTokens()[0];
        let template = new MeasuredTemplate(new CONFIG.MeasuredTemplate.documentClass({
            t: "circle",
            user: game.user.id,
            distance: await effect.computeAuraRadius(),
            direction: 0,
            x: token.center.x,
            y: token.center.y,
            flags: {
                wfrp4e: {
                    effectUuid: effect.uuid
                }
            }
            }, {parent : canvas.scene}));

        // For some reason, these temporary templates have 0,0 as their coordinates
        // instead of the ones provided by the document, so set them manually
        template.x = template.document.x;
        template.y = template.document.y;
        template.auraEffect = effect;
        return template
    }

    /**
     * When a Template is updated (either moved, or an effect is added to it), remove all existing
     * effects from that area, and add them back again to all tokens in that area
     *
     * TODO: this does not account for permissions yet
     *
     * @param {Template} template Template being updated
     * @param {Array} tokens Array of Token objects
     */
    // static async checkTemplateUpdate(template, update)
    // {
    //     let effect
    //     if (template instanceof ActiveEffect)
    //     {
    //         effect = template;
    //         template = await this.effectToTemplate(effect);
    //     }
    //     else 
    //     {
    //         effect = template.document.areaEffect()
    //     }

    //     if (!effect)
    //     {
    //         return;
    //     }

    //     for(let token of template.scene.tokens.map(t => t.object))
    //     {
    //         let hasEffect = token.actor.currentAreaEffects.find(e => e.getFlag("wfrp4e", "fromArea") == (template.document.id ? template.document?.uuid : template.document.flags.wfrp4e.effectUuid));
    //         let tokenInTemplate = AreaHelpers.isInTemplate(token.center, template) && !hasEffect
    //         if (tokenInTemplate && !hasEffect)
    //         {
    //             let effectData = effect.convertToApplied();
    //             setProperty(effectData, "flags.wfrp4e.fromArea",  effect.uuid);
    //             // Can't just send UUID because we need to include fromArea flags
    //             token.actor.applyEffect({effectData : [effectData]});
    //         }
    //         else if (!tokenInTemplate && hasEffect)
    //         {
    //             hasEffect.delete();
    //         }
    //     }
    // }
}