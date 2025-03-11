export default function()
{
return {
    name: "Imperial Calendar",
    description: "The calendar as defined by the Empire, dating from the year of Sigmar's coronation.",
    years: {
      yearZero: 2512,
      firstWeekday: 1,
    },
    months: {
      values: [
        {name: "Hexenstag", ordinal: 1, days: 1, intercalary : true},
        {name: "Nachhexen",  ordinal: 1, days: 32},
        {name: "Jahrdrung",  ordinal: 2, days: 33},
        {name: "Mitterfruhl", days: 1, ordinal : 3, intercalary : true},
        {name: "Plugzeit",  ordinal: 3, days: 33},
        {name: "Sigmarzeit",  ordinal: 4, days: 33},
        {name: "Sommerzeit",  ordinal: 5, days: 33},
        {name: "Sonnstill", days: 1, ordinal : 6, intercalary : true},
        {name: "Vorgeheim",  ordinal: 6, days: 33},
        {name: "Geheimnistag", days: 1, ordinal : 7, intercalary : true},
        {name: "Nachgeheim",  ordinal: 7, days: 32},
        {name: "Erntezeit",  ordinal: 8, days: 33},
        {name: "Mittherbst", days: 1, ordinal : 9, intercalary : true},
        {name: "Brauzeit",  ordinal: 9, days: 33},
        {name: "Kaldezeit",  ordinal: 10, days: 33},
        {name: "Ulriczeit",  ordinal: 11, days: 33},
        {name: "Mondstille", days: 1, ordinal : 12, intercalary : true},
        {name: "Vorhexen",  ordinal: 12, days: 33}
      ]
    },
    days: {
      values: [
        {name: "Wellentag", ordinal: 1},
        {name: "Aubentag", ordinal: 2},
        {name: "Marktag", ordinal: 3},
        {name: "Backertag", ordinal: 4},
        {name: "Bezahltag", ordinal: 5},
        {name: "Konigstag", ordinal: 6},
        {name: "Angestag", ordinal: 7},
        {name: "Festag", ordinal: 8, isRestDay: true}
      ],
      daysPerYear: 400,
      hoursPerDay: 24,
      minutesPerHour: 60,
      secondsPerMinute: 60
    },
    seasons: {
      values: [
        {name: "Spring", ordinal: 1, monthStart: 3, monthEnd: 5},
        {name: "Summer", ordinal: 2, monthStart: 6, monthEnd: 8},
        {name: "Fall", ordinal: 3, monthStart: 9, monthEnd: 11},
        {name: "Winter", ordinal: 4, monthStart: 12, monthEnd: 2}
      ]
    }
  };
}