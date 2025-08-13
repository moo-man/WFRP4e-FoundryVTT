

export default class CareerSelector extends  HandlebarsApplicationMixin(ApplicationV2)
{
    static DEFAULT_OPTIONS = {
        tag: "form",
        classes: ["warhammer", "standard-form", "career-selector", "item-dialog"],
        window: {
            title: "Career Selector",
            resizable : true,
        },
        position : {
            width: 400,
            height: 800
        },
        form: {
            submitOnChange: false,
            closeOnSubmit : true,
            handler: this._onSubmit
        },
        actions : {
            clickCareer : {buttons: [0, 2], handler : this._onClickCareer}
        }
    }

    constructor(document, options) {
        super(options)
        this.careers = []
        this.document = document;
        this.currentCareer = document.currentCareer
        this.selectedIndex = -1;
    }


      /** @override */
    static PARTS = {
        form: {
        template: "systems/wfrp4e/templates/apps/career-selector.hbs",
        scrollable: [".dialog-list"]
        },
    };

    async _prepareContext(options) {
        let context = await super._prepareContext(options)

        await this.loadCareers();

        if (!this._sortedCareers)
        {
            this._sortedCareers = this.sortCareers();
        }
        context.currentCareer = this.currentCareer;
        context.careers = this._sortedCareers;
        context.xp = this.computeXP();
        return context
    }

    async loadCareers() {
        if (this.careers.length)
        {
            return 
        }
        const currentCareerGroup = this.currentCareer.system.careergroup.value;
        this.careers = await warhammer.utility.findAllItems("career", game.i18n.localize("CAREER.Loading"), true, ["system.careergroup.value", "system.level.value", "system.class.value"])
        this.careers = this.careers.sort((a, b) => a.system.careergroup.value > b.system.careergroup.value ? 1 : -1)
        const currentCareers = this.careers.filter((a) => a.system.careergroup.value === currentCareerGroup)
        this.careers = this.careers.filter((a) => a.system.careergroup.value !== currentCareerGroup)
        this.careers.unshift(...currentCareers)

        this.careers = this.careers.filter(i =>
        {
            if (game.user.isGM)
            {
                return true;
            }
            
            let {collection} = foundry.utils.parseUuid(i.uuid);

            return ((collection.metadata && collection.visible) || i.testUserPermission?.(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER))
        })
    }

    sortCareers() {
        let careerList = {
            inClass: {},
            outOfClass: {},
        }
        if (!this.careers.length)
            return careerList

        this.careers.forEach((tier, i) => {
            try 
            {
                if (tier.system.careergroup.value) 
                {
                    let data = { level: tier.system.level.value, uuid: tier.uuid, img: tier.img, name: tier.name, index: i }
                    let type = "outOfClass"
                    if (this.currentCareer && this.currentCareer.system.class.value == tier.system.class.value)
                        type = "inClass"

                    if (careerList[type][tier.system.careergroup.value]?.length) 
                    {
                        if (!careerList[type][tier.system.careergroup.value].find(i => i.name == tier.name)) // avoid duplicates
                            careerList[type][tier.system.careergroup.value].push(data)
                    }
                    else
                        careerList[type][tier.system.careergroup.value] = [data]
                }
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

    static async _onSubmit(event, form, formData) {
        let selectedCareer = this.careers[this.selectedIndex];
        await this.document.createEmbeddedDocuments("Item", [(await fromUuid(selectedCareer.uuid)).toObject()])
        let experience = foundry.utils.duplicate(this.document.system.details.experience)
        experience.spent += parseInt(formData.object.xp);
        experience.log = this.document.system.addToExpLog(formData.exp, `${game.i18n.format("LOG.CareerChange", { career: selectedCareer.name })}`, experience.spent, undefined);
        this.document.update({ "system.details.experience" : experience })
    }

    computeXP(careerIndex) 
    {
        let exp = 0, reasons = []
        if (!careerIndex || careerIndex == -1)
        {
            return { exp, reasons }
        }

        let selectedCareer = this.careers[careerIndex];
        if (this.currentCareer) 
        {
            exp += this.currentCareer.complete.value ? 100 : 200

            reasons.push(this.currentCareer.complete.value ? game.i18n.localize("CAREER.LeaveComplete") : game.i18n.localize("CAREER.LeaveIncomplete"))


            if (selectedCareer.system.class.value != this.currentCareer.system.class.value) 
            {
                exp += 100
                reasons.push(game.i18n.localize("CAREER.DifferentClass"))
            }

        }
        else 
        {
            exp += 100
        }

        return { amount: exp, tooltip: reasons.join(", ") }
    }

    static _onClickCareer(ev,target)
    {
        if (ev.button == 2)
        {
            fromUuid(this.careers[target.dataset.index].uuid).then(i => i.sheet.render(true));
        }
        else 
        {

            if (target.classList.contains("active"))
            {
                target.classList.toggle("active");
                this.selectedIndex = -1;
            }
            else 
            {
                this.element.querySelectorAll(".dialog-item").forEach(e => e.classList.remove("active"));
                target.classList.toggle("active");
               this.selectedIndex = target.dataset.index;
            }

            let input = this.element.querySelector("input[name='xp']");
            let xp = this.computeXP(this.selectedIndex);
            input.value = xp.amount;
            input.closest(".form-group").dataset.tooltip = xp.tooltip;
        }
    }
}