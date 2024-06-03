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


  computeBase() {
    super.computeBase();

    this.reduceEquippedEncumbrance();
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
    if (this.canEquip) {
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
}