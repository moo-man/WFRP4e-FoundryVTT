import { BaseItemModel } from "./base";
let fields = foundry.data.fields;

export class LocationalItemModel extends BaseItemModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.prompt = new fields.BooleanField();
        schema.location = new fields.SchemaField({
            value: new fields.StringField(),
            key: new fields.StringField(),
        })
        return schema;
    }


    async preCreateData(data, options, user) {
        let preCreateData = await super.preCreateData(data, options, user);

        if (this.parent.isOwned)
        {
            this.checkSourceTest(); // If this item has a source test, use that location
            
            let location = this.location.key
            if (!location && this.prompt) {
                await this.promptLocation()
            }
            else if (location && !options.skipLocationValue) // The location key might already be defined, but not the display value, so set that accordingly
            {
                this.updateSource({"location.value" : game.wfrp4e.config.locations[location]})
            }
        }
        return preCreateData;
    }

    checkSourceTest()
    {
        let sourceMessageId = this.parent.getFlag("wfrp4e", "sourceMessageId")
        let actor = this.parent?.actor;
        
        if (sourceMessageId && actor)
        {

            let message = game.messages.get(sourceMessageId);
            // Might come from single or opposed test
            let test = message.getTest(); 
            let opposed = message.getOpposedTest();

            if (test)
            {
                this.updateSource({"location.key" : actor.convertHitLoc(test.result.hitloc.result)})
            }
            else if (opposed)
            {
                // Opposed test already compute the "true" hit location
                this.updateSource({"location.key" : opposed.result.hitloc.value})
            }
        }
    }

    async promptLocation() {
		let leftside
		let rightside
		let locationkey
	
		if (this.location.value == game.i18n.localize("WFRP4E.Locations.arm"))
			{leftside = game.i18n.localize("Left Arm"),rightside = game.i18n.localize("Right Arm"),locationkey = "Arm"}
		else if (this.location.value == game.i18n.localize("WFRP4E.Locations.leg"))
			{leftside = game.i18n.localize("Left Leg"),rightside = game.i18n.localize("Right Leg"),locationkey = "Leg"}
		else if (this.location.value == game.i18n.localize("Hand"))
			{leftside = game.i18n.localize("Left Hand"),rightside = game.i18n.localize("Right Hand"),locationkey = "Hand"}
		else if (this.location.value == game.i18n.localize("Foot"))
			{leftside = game.i18n.localize("Left Foot"),rightside = game.i18n.localize("Right Foot"),locationkey = "Foot"}
		else if (this.location.value == game.i18n.localize("Toe"))
			{leftside = game.i18n.localize("Left Toe"),rightside = game.i18n.localize("Right Toe"),locationkey = "Toe"}
		else if (this.location.value == game.i18n.localize("Ear"))
			{leftside = game.i18n.localize("Left Ear"),rightside = game.i18n.localize("Right Ear"),locationkey = "Ear"}
		else if (this.location.value == game.i18n.localize("Eye"))
			{leftside = game.i18n.localize("Left Eye"),rightside = game.i18n.localize("Right Eye"),locationkey = "Eye"}
			
          let location = await Dialog.wait({
            title: game.i18n.localize("Dialog.Location"),
            content: game.i18n.localize("Dialog.ChooseLocation"),
            buttons: {
                l: {
                    label: leftside,
                    callback: () => {
                        return "l";
                    }
                },
                r: {
                    label: rightside,
                    callback: () => {
                        return "r";
                    }
                }
            }
         });

        let displayLocation = this.location.value;

        if (location == "l") {
            displayLocation = leftside;
        }
        if (location == "r") {
            displayLocation = rightside;
        }

        this.parent.updateSource({ "system.location": { key: location + locationkey, value: displayLocation } });
    }

    usesLocation(weapon) {
        let actor = this.parent?.actor;
        if (!this.location.key || !actor || !weapon.isEquipped) {
            return false;
        }
        
        // At this point, we know weapon is equipped

        if (weapon.system.twohanded.value)
        {
            return true;
        }

        if (actor.mainArmLoc == this.normalizeLocation(this.location.key)) {
            return !weapon.system.offhand.value // If not in offhand, it is in the main hand
        }
        else if (actor.secondaryArmLoc == this.normalizeLocation(this.location.key)) {
            return weapon.system.offhand.value
        }
    }

    // e.g. converts rHand to rArm
    normalizeLocation(key)
    {
        if (key[0] == "r")
        {
            return "rArm";
        }
        else if (key[0] == "l")
        {
            return "lArm";
        }
    }

    get weaponsAtLocation() {
        return this.parent?.actor?.itemTypes.weapon.filter(weapon => this.usesLocation(weapon)) || []
    }
}