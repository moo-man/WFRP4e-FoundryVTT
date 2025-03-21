import WFRP_Utility from "../../system/utility-wfrp4e";
import {StandardDetailsModel} from "./components/details.js";

let fields = foundry.data.fields;
/**
 * Abstract class that interfaces with the Actor class
 */
export class BaseActorModel extends BaseWarhammerActorModel {

    static preventItemTypes = [];

    static defineSchema() {
        let schema = {};
        return schema;
    }

    static get compendiumBrowserFilters() {
        return new Map([
            ...Array.from(super.compendiumBrowserFilters),
            ["linked", {
                label: "TOKEN.CharLink",
                type: "boolean",
                config: {
                    keyPath: "prototypeToken.actorLink"
                }
            }],
        ]);
    }

    static _deriveSource(uuid) {
        const source = super._deriveSource(uuid);

        if (game.wfrp4e.config.premiumModules[source.slug])
            source.value = game.wfrp4e.config.premiumModules[source.slug];

        return source;
    }

    async _preCreate(data, options, user) 
    {
        await super._preCreate(data, options, user);
        
        let preCreateData = {};
        let defaultToken = game.settings.get("core", "defaultToken");

        // Set wounds, advantage, and display name visibility
        if (!data.prototypeToken)
            foundry.utils.mergeObject(preCreateData,
                {
                    "prototypeToken.bar1": { "attribute": "status.wounds" },                 // Default Bar 1 to Wounds
                    "prototypeToken.bar2": { "attribute": "status.advantage" },               // Default Bar 2 to Advantage
                    "prototypeToken.displayName": defaultToken?.displayName || CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,    // Default display name to be on owner hover
                    "prototypeToken.displayBars": defaultToken?.displayBars || CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,    // Default display bars to be on owner hover
                    "prototypeToken.disposition": defaultToken?.disposition || CONST.TOKEN_DISPOSITIONS.NEUTRAL,         // Default disposition to neutral
                    "prototypeToken.name": data.name,                                       // Set token name to actor name,
                    "prototypeToken.texture.src": "systems/wfrp4e/tokens/unknown.png"      // Set token image
                })


        // Set custom default token
        if (!data.img || data.img == "icons/svg/mystery-man.svg") {
            preCreateData.img = "systems/wfrp4e/tokens/unknown.png"
        }

        this.parent.updateSource(preCreateData);
    }

    async _onUpdate(data, options, user) {
        super._onUpdate();
        if (game.user.id == user)
        {
            await this.checkSize();
        }
    }

    initialize() {}

    computeBase() {
        this.initialize();
    }

    computeItems()
    {
        
    }

    tokenSize() {
        return {}
    }

    getInitialItems()
    {
      return [];
    }

    // Resize tokens based on size property
    checkSize() {
        let actor = this.parent
        if (game.user.id != getActiveDocumentOwner(actor)?.id) {
            return
        }
        if (actor.flags.autoCalcSize && game.canvas.ready) {
            let tokenData = this.tokenSize();
            if (actor.isToken) 
            {
                return actor.token.update(tokenData)
            }
            else if (canvas) 
            {
                return actor.update({ prototypeToken: tokenData }).then(() => {
                    actor.getActiveTokens().forEach(t => t.document.update(tokenData));
                })
            }
        }
    }

    // toEmbed(config, options)
    // {
    //     config.caption = false;
    //     let img = document.createElement("img");
    //     if (config.token)
    //     {
    //         img.src = this.parent.prototypeToken.texture.src;
    //     }
    //     else 
    //     {
    //         img.src = this.parent.img;
    //     }
    //     return img;
    // }
}