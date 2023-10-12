let fields = foundry.data.fields;
/**
 * Abstract class that interfaces with the Actor class
 */
export class BaseActorModel extends foundry.abstract.DataModel {

    static preventItemTypes = [];

    static defineSchema() {
        let schema = {};
        return schema;
    }

    preCreateData(data, options) {
        if (data._id)
            options.keepId = WFRP_Utility._keepID(data._id, this)

        let preCreateData = {};

        let defaultToken = game.settings.get("core", "defaultToken");

        // Set wounds, advantage, and display name visibility
        if (!data.prototypeToken)
            mergeObject(preCreateData,
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
            createData.img = "systems/wfrp4e/tokens/unknown.png"
        }

        return preCreateData;
    }

    allowCreation() {
        return true;
    }

    initialize() {

    }

    preUpdateChecks(data) {
        return data;
    }

    updateChecks() {
        return {};
    }

    itemIsAllowed(item) {
        if (this.constructor.preventItemTypes.includes(item.type)) {
            ui.notifications.error(game.i18n.localize("Error.ItemsNotAllowed"), { type: item.type });
            return false;
        }
        else {
            return true;
        }
    }

    computeBase() {
        this.initialize();
    }

    computeDerived() {
        // Abstract
    }
}