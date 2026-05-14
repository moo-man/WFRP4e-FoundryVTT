export default class WFRP4eActiveEffectConfig extends WarhammerActiveEffectConfig 
{
    systemTemplate=""


    hiddenProperties(){
        let hidden = super.hiddenProperties();
        hidden.equipTransfer = !this.document.item?.system?.isEquippable && this.document.item;
        return hidden;
    }
}