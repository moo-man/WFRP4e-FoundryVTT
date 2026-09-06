import TestWFRP5e from "./test-wfrp5e.js";

export default class CharacteristicTest5e extends TestWFRP5e {
  
  constructor(data)
  {
    super(data);
    this.context.characteristic = data?.characteristic;
  }
  
  static fromData(...args)
  {
    return new this(...args);
  }
}
