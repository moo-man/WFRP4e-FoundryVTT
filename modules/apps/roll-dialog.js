

export default class RollDialog extends Dialog {

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.resizable = true;
        return options;
    }



    updateValues(html)
    {
        html.find('[name="testModifier"]')[0].value = Number(this.userEntry.testModifier || 0) + Number(this.cumulativeBonuses.testModifier || 0)
        html.find('[name="successBonus"]')[0].value = Number(this.userEntry.successBonus || 0) + Number(this.cumulativeBonuses.successBonus || 0)
        html.find('[name="slBonus"]')[0].value = Number(this.userEntry.slBonus || 0) + Number(this.cumulativeBonuses.slBonus || 0)
        let difficultySelect = html.find('[name="testDifficulty"]')
        difficultySelect.val(game.wfrp4e.utility.alterDifficulty(this.userEntry.difficulty, this.cumulativeBonuses.difficultyStep || 0))
    }

    activateListeners(html){
        super.activateListeners(html);
        this.userEntry = {};
        this.cumulativeBonuses = {};
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

       html.find('[name="testModifier"]').change(ev => {
           this.userEntry.testModifier = ev.target.value
           this.updateValues(html)
       })
       html.find('[name="successBonus"]').change(ev => {
           this.userEntry.successBonus = ev.target.value
           this.updateValues(html)
       })
       html.find('[name="slBonus"]').change(ev => {
           this.userEntry.slBonus = ev.target.value
           this.updateValues(html)
       })
       this.userEntry.difficulty = html.find('[name="testDifficulty"]').change(ev => {
           this.userEntry.difficulty = ev.target.value
           this.updateValues(html)
       }).val();
    }   
}