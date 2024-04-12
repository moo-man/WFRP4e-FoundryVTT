if (!this.item.system.twohanded.value)
{
    this.item.system.flaws.value = this.item.system.flaws.value.concat([{name : "tiring"}, {name : "slow"}])
}