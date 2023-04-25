import WFRP_Utility from "../system/utility-wfrp4e";

export default class RollDialog extends Dialog {

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.resizable = true;
        options.classes.push("wfrp4e-dialog");
        return options;
    }

    async _render(force=false, options)
    {
        await super._render(force, options);
        switch(options.type)
        {
            case "characteristic" :
            this.element[0].classList.add("characteristic-roll-dialog")
            break;

            case "skill" :
                this.element[0].classList.add("skill-roll-dialog")
                break;

            case "weapon" :
                this.element[0].classList.add("weapon-roll-dialog")
                break;

            case "cast" :
                this.element[0].classList.add("spell-roll-dialog")
                break;

            case "channel" :
                this.element[0].classList.add("channel-roll-dialog")
                break;

            case "prayer" :
                this.element[0].classList.add("prayer-roll-dialog")
                break;
        }
    }



    updateValues(html) {


        let modifier = html.find('[name="testModifier"]')[0]
        let successBonus = html.find('[name="successBonus"]')[0]

        modifier.value = 
        (this.userEntry.testModifier || 0) + 
        (this.cumulativeBonuses.testModifier || 0) + 
        (this.userEntry.calledShot || 0)


        if (!game.settings.get("wfrp4e", "mooAdvantage") && game.settings.get("wfrp4e", "autoFillAdvantage"))
            modifier.value = Number(modifier.value) + (game.settings.get("wfrp4e", "advantageBonus") * this.advantage || 0) || 0

        successBonus.value = (this.userEntry.successBonus || 0) + (this.cumulativeBonuses.successBonus || 0)
        //@HOUSE
        if (game.settings.get("wfrp4e", "mooAdvantage"))
        {
            successBonus.value =  Number(successBonus.value) + Number(this.advantage || 0)
            WFRP_Utility.logHomebrew("mooAdvantage")
        }
        //@/HOUSE

        html.find('[name="slBonus"]')[0].value = (this.userEntry.slBonus || 0) + (this.cumulativeBonuses.slBonus || 0)


        let difficultySelect = html.find('[name="testDifficulty"]')
        difficultySelect.val(game.wfrp4e.utility.alterDifficulty(this.userEntry.difficulty, this.cumulativeBonuses.difficultyStep || 0))
    }


    changeAdvantage(advantage) {
        this.data.actor.update({ "system.status.advantage.value": advantage })
        ui.notifications.notify(game.i18n.localize("DIALOG.AdvantageUpdate"))
        this.advantage = advantage
    }

    activateListeners(html) {
        super.activateListeners(html);
        this.userEntry = {};
        this.cumulativeBonuses = {};

        this.advantage = Number(html.find('[name="advantage"]').change(ev => {
            let advantage = parseInt(ev.target.value)
            if (Number.isNumeric(advantage)) {
                this.changeAdvantage(advantage)
                this.updateValues(html)
            }
        }).val());

        html.find('[name="charging"]').change(ev => {

            let onlyModifier = game.settings.get("wfrp4e","useGroupAdvantage");
            if (ev.target.checked)
            {
                // If advantage cap, only add modifier if at cap
                if (!onlyModifier && game.settings.get("wfrp4e", "capAdvantageIB"))
                {
                    onlyModifier = (this.advantage >= this.data.actor.characteristics.i.bonus)
                }

                onlyModifier ? this.userEntry.testModifier += (+10) : this.changeAdvantage((this.advantage || 0) + 1)
            }
            else
            {
                onlyModifier ?  this.userEntry.testModifier += (-10) : this.changeAdvantage((this.advantage || 0) - 1)
            }

            html.find('[name="advantage"]')[0].value = this.advantage
            this.updateValues(html)
        })

        html.find(".dialog-bonuses").change(ev => {

            this.cumulativeBonuses = {
                testModifier: 0,
                successBonus: 0,
                slBonus: 0,
                difficultyStep: 0
            };

            ev.stopPropagation();
            $(ev.currentTarget).find("option").filter((o, option) => option.selected).each((o, option) => {
                if (option.dataset.modifier)
                    this.cumulativeBonuses.testModifier += Number(option.dataset.modifier)
                if (option.dataset.successbonus)
                    this.cumulativeBonuses.successBonus += Number(option.dataset.successbonus)
                if (option.dataset.slbonus)
                    this.cumulativeBonuses.slBonus += Number(option.dataset.slbonus)
                if (option.dataset.difficultystep)
                    this.cumulativeBonuses.difficultyStep += Number(option.dataset.difficultystep)
            })
            this.updateValues(html)
        })

        this.userEntry.testModifier = Number(html.find('[name="testModifier"]').change(ev => {
            this.userEntry.testModifier = Number(ev.target.value)
            if (!game.settings.get("wfrp4e", "mooAdvantage") && game.settings.get("wfrp4e", "autoFillAdvantage"))
                this.userEntry.testModifier -= (game.settings.get("wfrp4e", "advantageBonus") * this.advantage || 0) || 0

            this.updateValues(html)
        }).val())
        this.userEntry.successBonus = Number(html.find('[name="successBonus"]').change(ev => {
            this.userEntry.successBonus = Number(ev.target.value)
            if (game.settings.get("wfrp4e", "mooAdvantage"))
                this.userEntry.successBonus -= (this.advantage || 0)
            this.updateValues(html)
        }).val())
        this.userEntry.slBonus = Number(html.find('[name="slBonus"]').change(ev => {
            this.userEntry.slBonus = Number(ev.target.value)
            this.updateValues(html)
        }).val())
        this.userEntry.difficulty = html.find('[name="testDifficulty"]').change(ev => {
            this.userEntry.difficulty = ev.target.value
            this.updateValues(html)
        }).val()

        this.userEntry.calledShot = 0;
        this.selectedHitLocation = html.find('[name="selectedHitLocation"]').change(ev => {
                // Called Shot - If targeting a specific hit location
                if (ev.currentTarget.value && !["none", "roll"].includes(ev.currentTarget.value))
                {
                    // If no talents prevent the penalty from being applied
                    if (!this.data.testData.deadeyeShot && !(this.data.testData.strikeToStun && this.selectedHitLocation.value == "head")) // Deadeye shot and strike to stun not applied
                        this.userEntry.calledShot = -20;
                    else 
                        this.userEntry.calledShot = 0;
                }
                else {
                    this.userEntry.calledShot = 0;
                }
            this.updateValues(html);
        })[0]


        if (!game.settings.get("wfrp4e", "mooAdvantage") && game.settings.get("wfrp4e", "autoFillAdvantage"))
            this.userEntry.testModifier -= (game.settings.get("wfrp4e", "advantageBonus") * this.advantage || 0)
        else if (game.settings.get("wfrp4e", "mooAdvantage"))
            this.userEntry.successBonus -= (this.advantage || 0)
    }
}