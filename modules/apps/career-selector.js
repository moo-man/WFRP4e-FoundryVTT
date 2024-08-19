

export default class CareerSelector extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "career-selector";
        options.template = "systems/wfrp4e/templates/apps/career-selector.hbs";
        options.height = 800;
        options.width = 400;
        options.minimizable = true;
        options.title = "Career Selector"
        return options;
    }

    constructor(app) {
        super(app)
        this.careers = []
        this.currentCareer = this.object.currentCareer
        this.selectedCareer = -1
    }

    async _render(...args) {
        await super._render(...args)
    }

    async getData() {
        let data = await super.getData()
        if (this.careers.length == 0)
        {
            await this.loadCareers();
        }

        data.careers = this.careers;
        data.careerList = {}

        if (this.careers.length) {
            data.careerList = this.sortCareers()
        }
        return data
    }

    async loadCareers() {
        this.careers = []
        this.careers = await warhammer.utility.findAllItems("career", game.i18n.localize("CAREER.Loading"))
        this.careers = this.careers.sort((a, b) => a.careergroup.value > b.careergroup.value ? 1 : -1)
        this.careers = this.careers.filter(i => (i.compendium && !i.compendium.private) || i.ownership > 2)
    }

    sortCareers() {
        let careerList = {
            inClass: {},
            outOfClass: {},
        }
        if (!this.careers.length)
            return careerList

        this.careers.forEach((tier, i) => {
            try {

                let data = { link: tier.link, level: tier.level.value, img: tier.img, name: tier.name, index: i }
                let type = "outOfClass"
                if (this.currentCareer && this.currentCareer.class.value == tier.class.value)
                    type = "inClass"

                if (careerList[type][tier.careergroup.value]?.length) {
                    if (!careerList[type][tier.careergroup.value].find(i => i.name == tier.name)) // avoid duplicates
                        careerList[type][tier.careergroup.value].push(data)
                }
                else
                    careerList[type][tier.careergroup.value] = [data]
            }
            catch (e) {
                ui.notifications.error(`Error when displaying ${tier.name}: ${e}`)
            }
        })

        for (let career in careerList.inClass)
            careerList.inClass[career] = careerList.inClass[career].sort((a, b) => a.level > b.level ? 1 : -1)
        for (let career in careerList.outOfClass)
            careerList.outOfClass[career] = careerList.outOfClass[career].sort((a, b) => a.level > b.level ? 1 : -1)

        return careerList
    }

    async _updateObject(event, formData) {
        await this.object.createEmbeddedDocuments("Item", [this.selectedCareer.toObject()])
        let experience = foundry.utils.duplicate(this.object.details.experience)
        experience.spent += parseInt(formData.exp);
        experience.log = this.object.system.addToExpLog(formData.exp, `${game.i18n.format("LOG.CareerChange", { career: this.selectedCareer.name })}`, experience.spent, undefined);
        this.object.update({ "system.details.experience" : experience })
    }

    calculateMoveExp() {
        let exp = 0, reasons = []
        if (!this.selectedCareer)
            return { exp }

        if (this.currentCareer)
        {
        exp += this.currentCareer.complete.value ? 100 : 200

        reasons.push(this.currentCareer.complete.value ? game.i18n.localize("CAREER.LeaveComplete") : game.i18n.localize("CAREER.LeaveIncomplete"))




        if (this.selectedCareer.class.value != this.currentCareer.class.value) {
            exp += 100
            reasons.push(game.i18n.localize("CAREER.DifferentClass"))
        }

        }
        else {
            exp += 100
        }

        return { exp, tooltip: reasons.join(", ") }
    }

    activateListeners(html) {
        super.activateListeners(html)

        let input = html.find("input")[0]

        html.find(".career-tier").mousedown(ev => {
            if (ev.button == 0) {
                html.find(".career-tier.active").each(function () {
                    $(this).removeClass("active")
                })
                $(ev.currentTarget).toggleClass("active")
                this.selectedCareer = this.careers[Number($(ev.currentTarget).attr("data-index"))]
                let { exp, tooltip } = this.calculateMoveExp()
                input.value = exp
                input.setAttribute("title", tooltip)
            }
            else if (ev.button == 2) {
                this.careers[Number($(ev.currentTarget).attr("data-index"))].sheet.render(true)
            }
        })
    }



}