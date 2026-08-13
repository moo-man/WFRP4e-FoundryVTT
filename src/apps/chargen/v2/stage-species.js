export class SpeciesStage extends BaseCharacterCreationStage
{
    static DEFAULT_OPTIONS = 
        {
            tag: "form",
            classes : ["species", "wfrp4e"],
            window : {
                title : "WH.CharacterCreation.Stage",
                contentClasses : ["standard-form"],
                frame: false,
                positioned: false
            },
            position : {
            },
            actions : {
                rollSpecies: this._onRollSpecies,
                chooseSpecies: this._onChooseSpecies,
                chooseSubspecies: this._onChooseSubspecies
            }
        };

    static PARTS = {
        species : {template : "systems/wfrp4e/templates/apps/chargen/v2/stages/species.hbs"},
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };

    constructor(...args)
    {
        super(...args)
        this._table = game.wfrp4e.tables.findTable("species");

        if (!this._table)
        {
            ui.notifications.error("CHARGEN.ERROR.SpeciesTable", {localize: true, permanent: true})
            throw new Error (game.i18n.localize("CHARGEN.ERROR.SpeciesTable"))
        }
        
    }

    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        context.table = this._table;
        context.rolledSpecies = await fromUuid(this.data.rolled);
        context.chosenSpecies = await fromUuid(this.data.chosen);
        context.chosenSubspecies = await fromUuid(this.data.subspecies);
        
        context.activeSpecies = await this.activeSpecies;
        context.speciesItem = await (await this.speciesItem)?.system.compileSpecies();
        context.speciesSkills = context.speciesItem?.system.skills.list.join(", ")
        context.speciesTalents = context.speciesItem?.system.talents.choices.textDisplay;

        context.subspeciesAvailable = await this.getSubspecies(context.activeSpecies);

        context.buttons = [{ type: "submit", label: "Submit Stage" }];
        return context;
    }

    // Chosen or rolled species, chosen preempts rolled
    get activeSpecies()
    {

        return this.data.chosen ? fromUuid(this.data.chosen) : fromUuid(this.data.rolled);
    }

    // The actual item that will be added to the actor
    get speciesItem()
    {
        if (this.data.subspecies)
        {
            return fromUuid(this.data.subspecies)
        }
        else 
        {
            return this.activeSpecies
        }
    }
    
    async _getStageResults() 
    {
        return {

        }
    }

    async getSubspecies(species)
    {
        if (!species)
        {
            return [];
        }
        let parentSpecies = species.system.subspeciesOf.document || species;
        let allSpecies = await warhammer.utility.findAllItems("species", null, true, ["system.subspeciesOf"]);

        return allSpecies.filter(i => i.system.subspeciesOf.id == parentSpecies.id);
    }

    static async _onRollSpecies(ev, target)
    {
        let roll = await this._table.roll();
        let document = await fromUuid(roll.results[0].documentUuid);
        if (!this.data.rolled && document)
        {
            this.data.rolled = document.uuid;
            this.data.roll = roll.roll.total;
            this.render({force: true});
        }
        else if (!document)
        {
            throw new Error(game.i18n.localize("CHARGEN.ERROR."))
        }
        else 
        {
            throw new Error(game.i18n.localize("CHARGEN.ERROR."))
        }
    }

    static async _onChooseSpecies(ev, target)
    {

        let uuid = target.closest("[data-uuid]").dataset.uuid;
        // If chosen a species you rolled, don't consider it chosen
        if (uuid == this.data.rolled)
        {
            delete this.data.chosen;
            this.render({force: true});
            return;
        }

        let document = await fromUuid(uuid);

        if (!document)
        {
            throw new Error(game.i18n.localize("CHARGEN.ERROR."))
        }
        else 
        {
            this.data.chosen = document.uuid
            this.render({force: true});
        }
    }

    static async _onChooseSubspecies(ev, target)
    {

        let uuid = target.closest("[data-uuid]").dataset.uuid;
        this.data.subspecies = uuid;
        this.render({force: true});
    }
}





