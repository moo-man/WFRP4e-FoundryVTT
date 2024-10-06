export default class WFRP4eActiveEffectConfig extends WarhammerActiveEffectConfig 
{
    systemTemplate=""

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes.push("wfrp4e");
        options.width = 610;
        return options;
    }

    hiddenProperties(){
        let hidden = super.hiddenProperties();
        hidden.equipTransfer = !this.object.item?.system?.isEquippable;
        return hidden;
    }
}