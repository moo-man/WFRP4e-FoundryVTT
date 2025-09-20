export default class EndeavourJournalSheet extends foundry.applications.sheets.journal.JournalEntryPageProseMirrorSheet 
{
    static DEFAULT_OPTIONS = {
        actions : {
            configureScript : this._onConfigureScript,
            removeEffect : this._onRemoveEffect,
            openEffect : this._onOpenEffect,
            performEndeavour : this._onPerformEndeavour
        },
    }

    async _onRender(options)
    {
        await super._onRender(options);
        let html = await foundry.applications.handlebars.renderTemplate("systems/wfrp4e/templates/partials/endeavour.hbs", this.document.flags.wfrp4e?.endeavour || {})
        this.element.querySelector(".journal-header")?.insertAdjacentHTML("beforeend", html);

        // Kinda weird but I'm not sure a good way to check if it's being rendered in a journal or independently
        if (!this.element.querySelector(".journal-header"))
        {
            this.element.insertAdjacentHTML("beforeend", `<button type="button" data-action="performEndeavour">Perform Endeavour</button>`);
        }


        new foundry.applications.ux.DragDrop(
            {
                dropSelector: ".effect",
                permissions : {
                    drop: () => true
                },
                callbacks: {
                  drop: this._onDrop.bind(this)
                }
              }
        ).bind(this.element);
    }

    static async _onConfigureScript(ev, target)
    {
        new WarhammerScriptEditor(this.document, {path : "flags.wfrp4e.endeavour.script"}).render(true);
    }

    static async _onRemoveEffect(ev, target)
    {
        this.document.update({"flags.wfrp4e.endeavour.effect" : null});
    }

    static async _onOpenEffect()
    {
        ui.notifications.warn("Changes cannot be made to this Active Effect while within an Endeavour!")
        new ActiveEffect.implementation(this.document.flags.wfrp4e.endeavour.effect, {parent: this.document}).sheet.render({force: true, editable: false});
    }

    async _onDrop(ev)
    {
        let dragData = JSON.parse(ev.dataTransfer.getData("text/plain"));

        if (dragData.type == "ActiveEffect")
        {
            let effect = await ActiveEffect.implementation.fromDropData(dragData);
            if (effect)
            {
                this.document.update({"flags.wfrp4e.endeavour.effect" : effect.toObject()});
            }
        }
    }

    static async  _onPerformEndeavour(ev, target)
    {
        let data = this.document.getFlag("wfrp4e", "endeavour");

        // Get Actor, if no actor assigned, choose from owned actors
        let actor = game.user.character;
        if (!actor)
        {
            if (game.user.isGM)
            {
                actor = await DragDialog.create({title : this.document.name, text : "Provide an Actor to perform the Endeavour"})
            }
            else 
            {
                ui.notifications.warn("No Actor assigned, select from Owned Actors");

                let ownedActors = game.actors.filter(a => a.isOwner);
                actor = await ItemDialog(ownedActors, 1, {title: this.document.name, text: "Provide an Actor to perform the Endeavour"});
            }
        }


        // Script takes priority, if a script is defined, just run it and do nothing with the other data
        if (data.script)
        {
            let asyncFunction = Object.getPrototypeOf(async function () { }).constructor
            try 
            {
                new asyncFunction(["actor, journal, test, effect"], data.script).bind(this)(actor, this.document, data.test, data.effect);
            }
            catch(e)
            {
                ui.notifications.error(e.message);
            }
        }

        // If a test is defined, roll it, and if an effect is defined, add to actor if the test succeeded
        else if (data.test?.characteristic || data.test?.skill)
        {
            let test;
            if (data.test.skill)
            {
                test = await actor.setupSkill(data.test.skill, {fields: {characteristic : data.test.characteristic}, appendTitle: ` - ${this.document.name}`})
            }
            else 
            {
                test = await actor.setupCharacteristic(data.test.characteristic, {appendTitle: ` - ${this.document.name}`})
            }
            await test.roll();

            if (test.succeeded && data.effect)
            {
                actor.createEmbeddedDocuments("ActiveEffect", [data.effect]);
            }
        }

        // If only an effect is defined, just add it to the actor that performs the endeavour
        else if (data.effect)
        {
            actor.createEmbeddedDocuments("ActiveEffect", [data.effect]);
        }
        else 
        {
            ui.notifications.error("Endeavour Test, Script, or Active Effect has not been defined.")
        }
    }
}