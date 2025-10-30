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
      "The obstacle is the way. The impediment to action advances action. What stands in the way becomes the way.",
    author: "Ryan Holiday",
  },
  {
    quote:
      "Choose not to be harmed — and you won't feel harmed. Don't feel harmed — and you haven't been.",
    author: "Ryan Holiday",
  },
  {
    quote:
      "The more we do, the more we can do. The busier we are, the more leisure we have.",
    author: "Ryan Holiday",
  },
  {
    quote:
      "What stands in the way becomes the way. The obstacle is not only to be overcome but to be used.",
    author: "Ryan Holiday",
  },
  {
    quote:
      "The best revenge is not to be like your enemy. The best revenge is to be better than your enemy.",
    author: "Ryan Holiday",
  },
  {
    quote:
      "The only way to do great work is to love what you do. If you haven't found it yet, keep looking.",
    author: "Steve Jobs",
  },
  {
    quote:
      "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs",
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
      "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
  },
  {
    quote:
      "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
  },
  {
    quote:
      "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
  },
  {
    quote:
      "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
  },
  {
    quote:
      "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    quote:
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    quote:
      "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt",
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
  {
    quote:
      "The mind is everything. What you think you become.",
    author: "Buddha",
  },
  {
    quote:
      "Happiness is not something ready-made. It comes from your own actions.",
    author: "Dalai Lama",
  },
  {
    quote:
      "The journey of a thousand miles begins with one step.",
    author: "Lao Tzu",
  },
  {
    quote:
      "When one door of happiness closes, another opens; but often we look so long at the closed door that we do not see the one which has been opened for us.",
    author: "Helen Keller",
  },
  {
    quote:
      "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
  },
  {
    quote:
      "What you get by achieving your goals is not as important as what you become by achieving your goals.",
    author: "Zig Ziglar",
  },
  {
    quote:
      "The difference between the impossible and the possible lies in determination.",
    author: "Tommy Lasorda",
  },
  {
    quote:
      "It always seems impossible until it's done.",
    author: "Nelson Mandela",
  },
  {
    quote:
      "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela",
  },
  {
    quote:
      "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
  },
  {
    quote:
      "With the new day comes new strength and new thoughts.",
    author: "Eleanor Roosevelt",
  },
  {
    quote:
      "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
  },
  {
    quote:
      "Don't let yesterday take up too much of today.",
    author: "Will Rogers",
  },
  {
    quote:
      "The only way to achieve the impossible is to believe it is possible.",
    author: "Charles Kingsleigh",
  },
  {
    quote:
      "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson",
  },
  {
    quote:
      "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    quote:
      "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do.",
    author: "Mark Twain",
  },
  {
    quote:
      "The only person you should try to be better than is the person you were yesterday.",
    author: "Anonymous",
  },
  {
    quote:
      "Success is walking from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill",
  },
  {
    quote:
      "The harder you work for something, the greater you'll feel when you achieve it.",
    author: "Anonymous",
  },
  {
    quote:
      "Dream big and dare to fail.",
    author: "Norman Vaughan",
  },
  {
    quote:
      "The only limit to the height of your achievements is the reach of your dreams and your willingness to work for them.",
    author: "Michelle Obama",
  },
  {
    quote:
      "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.",
    author: "Roy T. Bennett",
  },
  {
    quote:
      "The future depends on what you do today.",
    author: "Mahatma Gandhi",
  },
  {
    quote:
      "Be the change that you wish to see in the world.",
    author: "Mahatma Gandhi",
  },
  {
    quote:
      "Strength does not come from the physical capacity. It comes from an indomitable will.",
    author: "Mahatma Gandhi",
  },
  {
    quote:
      "The mind is not a vessel to be filled, but a fire to be kindled.",
    author: "Plutarch",
  },
  {
    quote:
      "The only real mistake is the one from which we learn nothing.",
    author: "Henry Ford",
  },
  {
    quote:
      "Whether you think you can or think you can't, you're right.",
    author: "Henry Ford",
  },
  {
    quote:
      "The most difficult thing is the decision to act, the rest is merely tenacity.",
    author: "Amelia Earhart",
  },
  {
    quote:
      "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    quote:
      "Stay hungry, stay foolish.",
    author: "Steve Jobs",
  },
  {
    quote:
      "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
  },
  {
    quote:
      "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
    author: "Steve Jobs",
  },
  {
    quote:
      "The people who are crazy enough to think they can change the world are the ones who do.",
    author: "Steve Jobs",
  },
];

let randomNum = Math.floor(Math.random() * quotesMap.length);

document.getElementById("quote").innerHTML = quotesMap[randomNum].quote;
document.getElementById("author").innerText = quotesMap[randomNum].author;

