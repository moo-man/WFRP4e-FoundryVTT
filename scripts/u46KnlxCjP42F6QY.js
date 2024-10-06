let table = await fromUuid("RollTable.uATmVS40DQLC1woJ");

if (table)
{
    table.roll();
}
else 
{
    this.script.notification("Personality table not found", "error");
}