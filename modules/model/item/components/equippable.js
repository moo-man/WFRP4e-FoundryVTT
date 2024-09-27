import {PhysicalItemModel} from "./physical.js";

let fields = foundry.data.fields;

/**
 * @extends PhysicalItemModel
 */
export class EquippableItemModel extends PhysicalItemModel {
  static defineSchema() {
    let schema = super.defineSchema();

    schema.equipped = new fields.SchemaField({
      value: new fields.BooleanField({initial: false})
    });

    return schema;
  }

  async _onUpdate(data, options, user) {
    await super._onUpdate(data, options, user) || {};

    if (game.user.id === user && foundry.utils.hasProperty(data, "system.equipped")) {
      await Promise.all(this.parent.runScripts("equipToggle", {equipped: this.isEquipped}));
      await this.onEquipToggle(data, options, user);
    }
  }

  computeBase() {
    super.computeBase();

    this.reduceEquippedEncumbrance();
  }

  shouldTransferEffect(effect)
  {
      return super.shouldTransferEffect(effect) && (!effect.system.transferData.equipTransfer || this.isEquipped)
  }

  /**
   * Used to identify an Item as one being a child of EquippableItemModel
   *
   * @final
   * @returns {boolean}
   */
  get isEquippable() {
    return true;
  }

  get tags() 
  {
    return super.tags.add("equippable");
  }

  /**
   * @returns {boolean}
   */
  get isEquipped() {
    return this.equipped.value;
  }

  /**
   * @returns {Promise<boolean>}
   */
  async toggleEquip(data = {}) {
    let equipped = this.isEquipped;
    if (equipped || this.canEquip) {
      equipped = !equipped;
      data = foundry.utils.mergeObject(data, {"system.equipped.value": equipped});
      await this.parent.update(data);
    }

    return equipped;
  }

  reduceEquippedEncumbrance() {
    if (this.isEquipped && this.weighsLessEquipped) {
      this.encumbrance.total = Math.max(0, this.encumbrance.total - 1);
    }
  }

  /**
   * @returns {boolean}
   */
  get usesHands() {
    return false;
  }

  /**
   * @returns {boolean}
   */
  get canEquip() {
    return true;
  }

  /**
   * @returns {boolean}
   */
  get weighsLessEquipped() {
    return false;
  }

  /**
   * @returns {number}
   */
  get equipPoints() {
    return 0;
  }

  async onEquipToggle(data, options, user) {

  }
}
