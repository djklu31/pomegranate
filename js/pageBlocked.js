let quotesMap = [
  {
    quote:
      "There is no good or bad without us, there is only perception. There is the event itself and the story we tell ourselves about what it means.",
    author: "Ryan Holiday",
  },
  {
    quote:
      "Focus on the moment, not the monsters that may or may not be up ahead.",
    author: "Ryan Holiday",
  },
  {
    quote:
      "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
  },
  {
    quote:
      "Everything we hear is an opinion, not a fact. Everything we see is a perspective, not the truth.",
    author: "Marcus Aurelius",
  },
  {
    quote: "You may delay, but time will not.",
    author: "Benjamin Franklin",
  },
  {
    quote:
      "You cannot escape the responsibility of tomorrow by evading it today.",
    author: "Abraham Lincoln",
  },
  {
    quote:
      "Courage is the most important of all the virtues because without courage, you can't practice any other virtue consistently.",
    author: "Maya Angelou",
  },
  {
    quote:
      "Success is liking yourself, liking what you do, and liking how you do it.",
    author: "Maya Angelou",
  },
  {
    quote: "The best way out is always through.",
    author: "Robert Frost",
  },
  {
    quote:
      "The three great essentials to achieve anything worthwhile are, first, hard work; second, stick-to-itiveness; third, common sense.",
    author: "Thomas A. Edison",
  },
  {
    quote: "O snail <br/>Climb Mount Fuji<br/>But slowly, slowly!",
    author: "Kobayashi Issa",
  },
  {
    quote:
      "Procrastination is also a subtle act of corruption – it corrupts valuable time",
    author: "Amit Abraham",
  },
  {
    quote: "Life always begins with one step outside of your comfort zone.",
    author: "Shannon L. Alder",
  },
  {
    quote: "Someday is not a day of the week.",
    author: "Janet Dailey",
  },
  {
    quote: "It is better to act too quickly than it is to wait too long.",
    author: "Jack Welch",
  },
  {
    quote: "Thankfully, persistence is a great substitute for talent.",
    author: "Steve Martin",
  },
  {
    quote: "Whatever you fight, you strengthen, and what you resist, persists.",
    author: "Eckhart Tolle",
  },
  {
    quote:
      "That which we persist in doing becomes easier to do, not that the nature of the thing has changed but that our power to do has increased.",
    author: "Ralph Waldo Emerson",
  },
];

let randomNum = Math.floor(Math.random() * quotesMap.length);

document.getElementById("quote").innerHTML = quotesMap[randomNum].quote;
document.getElementById("author").innerText = quotesMap[randomNum].author;
