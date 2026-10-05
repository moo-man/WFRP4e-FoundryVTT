import WFRP5E from "../system/5e/config-wfrp5e";
import OpposedTest5e from "../system/5e/opposed-test5e";
import WFRP4E from "../system/config-wfrp4e";
import OpposedTest from "../system/opposed-test";
import CastTest5e from "../system/rolls/5e/cast-test5e";
import ChannellingTest5e from "../system/rolls/5e/channelling-test5e";
import CharacteristicTest5e from "../system/rolls/5e/characteristic-test5e";
import PrayerTest5e from "../system/rolls/5e/prayer-test5e";
import SkillTest5e from "../system/rolls/5e/skill-test5e";
import TraitTest5e from "../system/rolls/5e/trait-test5e";
import WeaponTest5e from "../system/rolls/5e/weapon-test5e";
import CastTest from "../system/rolls/cast-test";
import ChannelTest from "../system/rolls/channel-test";
import CharacteristicTest from "../system/rolls/characteristic-test";
import PrayerTest from "../system/rolls/prayer-test";
import SkillTest from "../system/rolls/skill-test";
import TraitTest from "../system/rolls/trait-test";
import WeaponTest from "../system/rolls/weapon-test";
import WomCastTest from "../system/rolls/wom-cast-test";
import CastDialog5e from "./roll-dialog/5e/cast-dialog5e";
import ChannellingDialog5e from "./roll-dialog/5e/channelling-dialog5e";
import CharacteristicDialog5e from "./roll-dialog/5e/characteristic-dialog5e";
import PrayerDialog5e from "./roll-dialog/5e/prayer-dialog5e";
import SkillDialog5e from "./roll-dialog/5e/skill-dialog5e";
import TraitDialog5e from "./roll-dialog/5e/trait-dialog5e";
import WeaponDialog5e from "./roll-dialog/5e/weapon-dialog5e";
import CastDialog from "./roll-dialog/cast-dialog";
import ChannellingDialog from "./roll-dialog/channelling-dialog";
import CharacteristicDialog from "./roll-dialog/characteristic-dialog";
import PrayerDialog from "./roll-dialog/prayer-dialog";
import SkillDialog from "./roll-dialog/skill-dialog";
import TraitDialog from "./roll-dialog/trait-dialog";
import WeaponDialog from "./roll-dialog/weapon-dialog";

export default class EditionManager extends WHFormApplication
{
    static DEFAULT_OPTIONS = {
        tag: "form",
        classes: ["warhammer", "standard-form", "edition-manager"],
        window: {
            title: "Edition Configuration",
            resizable : true,
        },
        position : {
            width: 400
        },
        form: {
            submitOnChange: false,
            closeOnSubmit: true,
            handler: this._onSubmit
        }
    }

    /** @override */
    static PARTS = {
        form: {
            template: "systems/wfrp4e/templates/apps/edition-manager.hbs",
            scrollable: [""],
            classes: ["standard-form"]
        },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };

    static #schema = new foundry.data.fields.SchemaField({
        use5e : new foundry.data.fields.BooleanField({label : "5e.SETTINGS.Use5e"}),
    })

    static get schema()
    {
        return this.#schema
    }

    async _prepareContext(options) {
        let context = await super._prepareContext(options);
        context.source = game.settings.get("wfrp4e", "editionSettings");
        context.schema = this.constructor.schema;
        return context
    }

    static async _onSubmit(event, form, formData) {
        return game.settings.set("wfrp4e", "editionSettings", formData.object)
    }


    static getConfig()
    {
        let e4 = WFRP4E;
        let e5 = WFRP5E;

        // Todo: add settings
        if (game.settings.get("wfrp4e", "editionSettings")?.use5e)
        {
            return foundry.utils.mergeObject(e4, e5);
        }
        else 
        {
            return e4;
        }
    }

    static getDialog(type)
    {
        let e5 = game.settings.get("wfrp4e", "editionSettings")?.use5e;
        switch(type)
        {
            case "characteristic": 
                return e5 ? CharacteristicDialog5e : CharacteristicDialog;
            case "skill": 
                return e5 ? SkillDialog5e : SkillDialog;
            case "weapon":
                return e5 ? WeaponDialog5e : WeaponDialog;
            case "cast": 
                return e5 ? CastDialog5e : CastDialog;
            case "channelling":
                return e5 ? ChannellingDialog5e : ChannellingDialog;
            case "prayer": 
                return e5 ? PrayerDialog5e : PrayerDialog;
            case "trait": 
                return e5 ? TraitDialog5e : TraitDialog;
        }
    }

    static getTestClass(type)
    {
        let e5 = game.settings.get("wfrp4e", "editionSettings")?.use5e;
        switch(type)
        {
            case "characteristic": 
                return e5 ? CharacteristicTest5e : CharacteristicTest;
            case "skill": 
                return e5 ? SkillTest5e : SkillTest;
            case "weapon":
                return e5 ? WeaponTest5e : WeaponTest;
            case "cast": 
                return e5 ? CastTest5e : (game.settings.get("wfrp4e", "useWoMOvercast") ? WomCastTest : CastTest);
            case "channelling":
                return e5 ? ChannellingTest5e : ChannelTest;
            case "prayer": 
                return e5 ? PrayerTest5e : PrayerTest;
            case "trait": 
                return e5 ? TraitTest5e : TraitTest;
        }
    }

    static getOpposedTest()
    {
        return game.settings.get("wfrp4e", "editionSettings")?.use5e ? OpposedTest5e : OpposedTest;
    }
  

}