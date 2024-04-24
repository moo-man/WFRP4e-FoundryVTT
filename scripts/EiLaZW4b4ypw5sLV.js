// can't use Damage application type because that checks if wounds were dealt
args.actor.applyEffect({effectUuids : this.item.effects.contents[0].uuid})