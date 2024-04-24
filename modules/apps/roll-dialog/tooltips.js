/**
 * Easily handle and compute tooltips for dialog fields
 * 
 * Call #start to mark the initial values of the dialog
 * Call #finish to compare the initial with the current values
 */
export class DialogTooltips 
{
    _modifier = [];
    _slBonus = [];
    _successBonus = [];
    _difficulty = [];

    _modifier1 = null;
    _slBonus1 = null;
    _successBonus1 = null;
    _difficulty1 = null;

    _modifier2 = null;
    _slBonus2 = null;
    _successBonus2 = null;
    _difficulty2 = null;

    constructor()
    {

    }

    get modifier() 
    {
        return this._formatTooltip("modifier");
    }
    get SL() 
    {
        return this._formatTooltip("SL");
    }
    get slBonus() 
    {
        return this._formatTooltip("slBonus");
    }
    get successBonus() 
    {
        return this._formatTooltip("successBonus");
    }
    get difficulty() 
    {
        return this._formatTooltip("difficulty");
    }

    clear() 
    {
        this.reset();
        this._modifier = [];
        this._slBonus = [];
        this._successBonus = [];
        this._difficulty = [];
    }

    reset()
    {
        this._modifier1 = null;
        this._slBonus1= null;
        this._successBonus1 = null;
        this._difficulty1 = null;

        this._modifier2 = null;
        this._slBonus2= null;
        this._successBonus2 = null;
        this._difficulty2 = null;
    }

    start(dialog)
    {
        this.reset();
        this._modifier1 = dialog.fields.modifier;
        this._slBonus1 = dialog.fields.slBonus;
        this._successBonus1 = dialog.fields.successBonus;
        this._difficulty1 = dialog.fields.difficulty;
    }

    finish(dialog, label)
    {
        this._modifier2 = dialog.fields.modifier;
        this._slBonus2 = dialog.fields.slBonus;
        this._successBonus2 = dialog.fields.successBonus;
        this._difficulty2 = dialog.fields.difficulty;

        this._computeDiff(label);
    }

    addModifier(value, label)
    {
        this._addTooltip("modifier", value, label);
    }

    addSLBonus(value, label)
    {
        this._addTooltip("slBonus", value, label);
    }

    addSuccessBonus(value, label)
    {
        this._addTooltip("successBonus", value, label);
    }

    _addTooltip(type, value, label)
    {
        if (value && label)
        {
            this[`_${type}`].push({value, label});
        }
    }

    _computeDiff(label)
    {

        let modifierDiff    = this._modifier2 - this._modifier1;
        let slBonusDiff     = this._slBonus2 - this._slBonus1;
        let successBonusDiff    = this._successBonus2 - this._successBonus1;
        let difficultyDiff  = this._difficulty2 != this._difficulty1;

        if (modifierDiff)
        {
            this._modifier.push({value : modifierDiff, label});
        }
        if (slBonusDiff)
        {
            this._slBonus.push({value : slBonusDiff, label});
        }
        if (successBonusDiff)
        {
            this._successBonus.push({value : successBonusDiff, label});
        }
        if (difficultyDiff)
        {
            this._difficulty.push({label});
        }
    }

    _formatTooltip(type, addLabel=false)
    {

        let typeLabel = ({
            "modifier" : "",
            "difficulty" : "",
            "slBonus" : "SL Bonus",
            "successBonus" : "Success Bonus",
        })[type]

        if (this[`_${type}`].length == 0)
        {
            return "";
        }
        else 
        {
            return `<p>${this[`_${type}`].map(i => 
            {
                if (i.value)
                {
                    // Add sign to positive numbers
                    return `&#8226; ${i.label} (${i.value > 0 ? "+" + i.value : i.value}${(addLabel && typeLabel) ? " " + typeLabel : ""})`;
                }
                else 
                { 
                    return `&#8226; ${i.label}`; 
                }

            }).join("</p><p>")}</p>`;
        }   
    }

    // Collection of all typed tooltips
    // used to display modifiers in the chat card
    getCollectedTooltips()
    {
        return this._formatTooltip("modifier", true) + this._formatTooltip("slBonus", true) + this._formatTooltip("successBonus", true) + this._formatTooltip("difficulty", true)
    }
}