import TravelDistanceWFRP4e from "../apps/travel-distance-wfrp4e"
import WFRP_Utility from "./utility-wfrp4e"

export default class GenericActions
{

    static actions = {
        clickSymptom : WFRP_Utility.handleSymptomClick.bind(WFRP_Utility),
        clickConditionText : WFRP_Utility.handleConditionClick.bind(WFRP_Utility),
        clickProperty : WFRP_Utility.handlePropertyClick.bind(WFRP_Utility),
        clickTable : WFRP_Utility.handleTableClick.bind(WFRP_Utility),
        clickPay : WFRP_Utility.handlePayClick.bind(WFRP_Utility),
        clickCredit : WFRP_Utility.handleCreditClick.bind(WFRP_Utility),
        clickCorruption : WFRP_Utility.handleCorruptionClick.bind(WFRP_Utility),
        clickFear : WFRP_Utility.handleFearClick.bind(WFRP_Utility),
        clickTerror : WFRP_Utility.handleTerrorClick.bind(WFRP_Utility),
        clickExp : WFRP_Utility.handleExpClick.bind(WFRP_Utility),
        clickTravel : TravelDistanceWFRP4e.handleTravelClick.bind(TravelDistanceWFRP4e),
        clickSkill : this.onClickSkill,
        clickTalent : this.onClickTalent
    }

    static addEventListeners(html, document)
    {
        html.addEventListener("click", ev => {
            let element = ev.target.closest("[data-action]");
            if (!element) return;

            let action = this.actions[element.dataset.action];
            if (action)
            {
                action.bind(document)(ev, element);
            }
        })
    }

    static onClickSkill(ev)
    {
        WFRP_Utility.findSkill(ev.target.text).then(skill => skill.sheet.render(true));
    }

    static onClickTalent(ev)
    {
        WFRP_Utility.findTalent(ev.target.text).then(talent => talent.sheet.render(true));
    }
 
}