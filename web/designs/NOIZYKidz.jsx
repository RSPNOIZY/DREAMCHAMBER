import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================
// NOIZYKIDZ — GLOBAL MUSIC THEORY ATLAS
// Every rhythm, scale, and tradition since the first rock was banged.
// A living library for the children of Earth.
// Built: March 14, 2026 · NOIZY.ai · MC96ECO Universe
// ============================================================

const C = {
  void:    '#04030a',
  deep:    '#080615',
  panel:   '#0e0b20',
  card:    '#141028',
  border:  '#1e1a38',
  dim:     '#2a2550',

  // Tradition colors — each world has its own sun
  prehistoric: '#8B6914',
  africa:      '#C84B11',
  india:       '#D4156A',
  china:       '#C41E3A',
  mideast:     '#7B4F9E',
  greece:      '#1A6B9E',
  europe:      '#1A7A6E',
  indigenous:  '#3A7A3A',
  latin:       '#B8860B',
  modern:      '#4B6CB7',

  // Universal
  gold:    '#D4A843',
  amber:   '#E8833A',
  cream:   '#F5F0E8',
  white:   '#FFFFFF',
  ghost:   'rgba(255,255,255,0.07)',
  glow:    'rgba(212,168,67,0.15)',
};

// ============================================================
// DATA — THE 10 WORLDS
// ============================================================

const WORLDS = [
  {
    id: 'prehistoric',
    emoji: '🪨',
    name: 'The First Beat',
    subtitle: 'Prehistoric Rhythm',
    era: '~100,000 BCE → Present',
    region: 'Everywhere on Earth',
    color: C.prehistoric,
    bg: 'linear-gradient(135deg, #3d2b00 0%, #1a1000 100%)',
    tagline: 'Before language, there was rhythm.',
    story: 'Long before anyone could write a word, before cities existed, before metal was discovered — humans were already making music. A rock against a rock. A hollow log. A stretched animal skin. The first musicians were also the first humans.',
    elements: ['Pulse', 'Repetition', 'Call & Response', 'Group Synchronization'],
    instruments: ['Bone flutes', 'Stone percussion', 'Skin drums', 'Clapping hands', 'The human voice'],
    theory: [
      { name: 'Pulse', desc: 'The heartbeat. Every culture starts here. Bang something. Stop. Bang again. That gap is time — and time is everything in music.' },
      { name: 'Repetition', desc: 'Repeat a pattern and it becomes a groove. Our brains are wired to love it. This is why you nod your head without thinking.' },
      { name: 'Call & Response', desc: 'One person sings or plays. Others answer. The first conversation. Still alive in gospel, jazz, hip-hop, and every playground in the world.' },
      { name: 'Group Sync', desc: 'When people play together and lock into the same pulse, something magical happens: strangers become one. This is why music brings people together.' },
    ],
    kidActivity: '🥁 Try this: tap your hand on your desk once per second. Now have a friend tap twice in between each of your taps. You just invented polyrhythm — 100,000 years ago!',
    connection: 'This is the root of ALL music. Every tradition below grew from this seed.',
    funFact: 'The oldest known musical instrument is a flute carved from a vulture bone, found in Germany — 43,000 years old.',
  },
  {
    id: 'africa',
    emoji: '🥁',
    name: 'The Rhythm Continent',
    subtitle: 'African Music Theory',
    era: 'Ancient → Now (Living Tradition)',
    region: 'Sub-Saharan Africa, Diaspora (Americas, Caribbean, World)',
    color: C.africa,
    bg: 'linear-gradient(135deg, #5c1e00 0%, #1a0800 100%)',
    tagline: 'The foundation of jazz, blues, funk, and hip-hop.',
    story: 'Africa gave the world its most sophisticated rhythm systems. While Europe was thinking about harmony, Africa was inventing rhythmic complexity that would take centuries for the rest of the world to catch up to. The Griot tradition means every village has a living historian who sings the community\'s memory.',
    elements: ['Polyrhythm', 'Call & Response', 'Cross-Rhythm', 'Improvisation', 'Community Role'],
    instruments: ['Djembe', 'Talking Drum', 'Balafon', 'Mbira (Thumb Piano)', 'Kora', 'Ngoni'],
    theory: [
      { name: 'Polyrhythm', desc: 'Multiple different rhythms playing at the same time, each pattern locking with the others. Like 3 clocks running at different speeds that somehow always land together. The most complex rhythm theory on Earth.' },
      { name: 'Cross-Rhythm', desc: '2 against 3. Or 3 against 4. Two rhythms that don\'t share the same pulse, but happen simultaneously. This creates a beautiful tension that makes bodies move.' },
      { name: 'The Clave', desc: 'A short rhythmic pattern (usually 2 bars) that everything else is built around. Like a heartbeat for the whole song. Clave traveled to Cuba and became the DNA of salsa and Latin music.' },
      { name: 'Griot Tradition', desc: 'In West Africa, the Griot is the keeper of history. They memorize generations of family history and sing it. Music is not entertainment — it is memory. It is culture. It is survival.' },
      { name: 'Mbira Theory', desc: 'The thumb piano of Zimbabwe (Shona people) uses scales and tuning systems completely different from Western music. Certain notes are slightly "out of tune" intentionally to create a shimmering, overtone-rich sound.' },
    ],
    kidActivity: '🎵 Try this: clap your hands in groups of 3 (ONE-two-three, ONE-two-three). Now have a friend clap in groups of 2 (ONE-two, ONE-two). Listen to the pattern they make together. That\'s African polyrhythm!',
    connection: 'Led to: Jazz, Blues, Gospel, R&B, Funk, Hip-Hop, House, Afrobeats, Cumbia, Samba',
    funFact: 'The Mbira has been played in Zimbabwe for over 1,000 years. It\'s sometimes called "the voice of the ancestors."',
  },
  {
    id: 'india',
    emoji: '🪘',
    name: 'The World of Ragas',
    subtitle: 'Indian Classical Music Theory',
    era: '~3,500 BCE → Now (Living Tradition)',
    region: 'South Asia (India, Pakistan, Bangladesh, Sri Lanka)',
    color: C.india,
    bg: 'linear-gradient(135deg, #5c0029 0%, #1a000a 100%)',
    tagline: 'Music as a map of time, mood, and the cosmos.',
    story: 'Indian classical music is one of the oldest continuous musical traditions on Earth. The Sama Veda, written around 1500 BCE, is essentially a book of music notation. India invented a system where every scale (Raga) has a personality, a season, a time of day, and an emotion. Playing the wrong Raga at the wrong time of day is considered musically incorrect.',
    elements: ['Raga (melodic framework)', 'Tala (rhythm cycle)', 'Sruti (microtones)', 'Improvisation', 'Devotion'],
    instruments: ['Sitar', 'Tabla (paired drums)', 'Sarod', 'Santoor', 'Bansuri (flute)', 'Sarangi (bowed string)', 'Harmonium', 'Tanpura (drone)'],
    theory: [
      { name: 'Raga', desc: 'A melodic framework with specific rules: which notes to use, which notes to emphasize, which to avoid, how to ornament them. Each Raga creates a specific emotional state (Rasa). Bhairav Raga is for dawn. Yaman for evening. Malkauns for midnight. There are over 500 Ragas.' },
      { name: 'Tala', desc: 'Rhythmic cycles of extraordinary complexity. Teentaal: 16 beats. Rupak: 7 beats. Jhaptaal: 10 beats. The tabla player and the melodic player interact in real-time improvisation that can last hours. The moment when both players land on beat 1 (called "Sam") together is one of music\'s greatest thrills.' },
      { name: 'Sruti (Microtones)', desc: 'Where Western music divides an octave into 12 equal semitones, Indian music divides it into 22 Shrutis — tiny intervals between notes. This is why Indian music sounds differently "in tune" — it IS in tune, to a finer scale.' },
      { name: 'Alap', desc: 'The slow, unmetered opening of a classical performance where the Raga is introduced note by note, like a painter priming a canvas before the real composition begins. No rhythm. Pure melody. Sometimes 30 minutes long.' },
      { name: 'Call Between Instruments', desc: 'In a Raga performance, the melodic player and tabla player have a conversation — the melody plays a phrase, the drums answer it, elaborate it, challenge it. Live improvisation around an agreed-upon structure.' },
    ],
    kidActivity: '🎶 Try this: sing "do re mi fa sol." Now try singing a note that\'s BETWEEN "re" and "mi." That tiny in-between note is a Shruti! Indian music lives in those spaces between the notes we know.',
    connection: 'Influenced: Western jazz (John Coltrane was obsessed with Ragas), The Beatles, ambient music, meditation music, world fusion',
    funFact: 'Raga Deepak is said to be so powerful that singing it perfectly can cause lamps to spontaneously light. Masters reportedly refused to sing it fearing the consequences.',
  },
  {
    id: 'china',
    emoji: '🎋',
    name: 'The Five Elements Scale',
    subtitle: 'Chinese Music Theory',
    era: '~2,697 BCE → Now (Living Tradition)',
    region: 'East Asia (China, Korea, Japan, Vietnam, Mongolia)',
    color: C.china,
    bg: 'linear-gradient(135deg, #5c0000 0%, #1a0000 100%)',
    tagline: '5 notes. 5 elements. 5 seasons. One universe.',
    story: 'The Emperor Huangdi (2697 BCE) commanded his music master to create a perfect tuning system. He invented the Pentatonic scale — 5 notes that correspond to the 5 elements (Wood, Fire, Earth, Metal, Water), the 5 seasons, the 5 directions, and the 5 organs of the body. Music in China has always been understood as medicine for the soul.',
    elements: ['Pentatonic Scale', 'Tone Poetry', 'Mathematical Tuning', 'Timbre Focus', 'Silence as Music'],
    instruments: ['Guqin (7-string zither, 3,000+ years old)', 'Pipa (lute)', 'Erhu (2-string violin)', 'Dizi (bamboo flute)', 'Sheng (mouth organ)', 'Zhongruan', 'Guzheng'],
    theory: [
      { name: 'Pentatonic Scale', desc: 'Five notes per octave instead of seven. Play only the black keys on a piano — that\'s a pentatonic scale. It appears in Chinese, African, Celtic, Native American, and many other traditions independently. Some researchers believe it may be hardwired into human hearing.' },
      { name: 'Tuning Mathematics', desc: 'Chinese music theory discovered the "circle of fifths" (generating all notes by going up a perfect fifth each time) independently from Europe, around 100 BCE. The mathematician Jing Fang calculated 53-tone equal temperament — something Western theory didn\'t fully grasp until the 20th century.' },
      { name: 'Timbre Over Harmony', desc: 'Chinese music theory prioritizes the quality and color of a single sound (timbre) over combining multiple sounds (harmony). A master Guqin player focuses on the exact texture of each note — buzzing, pure, whispering. The silence between notes is as important as the notes.' },
      { name: 'Five Tones & Emotion', desc: 'Gong (Earth, stability), Shang (Metal, grief), Jue (Wood, anger), Zhi (Fire, joy), Yu (Water, fear). Each pitch is associated with a emotion, element, organ, and season. Music is a holistic medicine.' },
    ],
    kidActivity: '🎹 Try this: on a piano, play ONLY the black keys (5 of them). Make up a melody using only those 5 notes. Does it sound a bit Chinese? A bit Celtic? That\'s because the pentatonic scale is one of humanity\'s universal musical discoveries.',
    connection: 'Influenced: Japanese Koto music, Korean Gayageum, Vietnamese Dan Tranh, Celtic folk music, modern pop (pentatonic is EVERYWHERE)',
    funFact: 'The Guqin has been played continuously for over 3,000 years. Confucius played it. The oldest written music in the world is Guqin notation from 590 AD.',
  },
  {
    id: 'mideast',
    emoji: '🌙',
    name: 'The Maqam Worlds',
    subtitle: 'Middle Eastern & Persian Music Theory',
    era: '~800 BCE → Now (Living Tradition)',
    region: 'Middle East, North Africa, Turkey, Iran, Central Asia',
    color: C.mideast,
    bg: 'linear-gradient(135deg, #2e0050 0%, #0e0018 100%)',
    tagline: 'Between the notes where Western ears dare not go.',
    story: 'While European music settled into 12 fixed notes per octave, the music of the Middle East and Persia kept exploring the microtonal universe between those notes. The Maqam system is a family of hundreds of melodic frameworks (like Indian Ragas) — each with its own emotional character, traditional repertoire, and ornamentation vocabulary.',
    elements: ['Maqam (melodic mode)', 'Microtones', 'Ornamentation', 'Improvisation (Taqsim)', 'Modal Modulation'],
    instruments: ['Oud (the ancestor of the guitar)', 'Ney (end-blown flute)', 'Qanun (zither)', 'Riq (tambourine)', 'Darbuka (goblet drum)', 'Saz (Turkish lute)', 'Santoor (Persian)'],
    theory: [
      { name: 'Maqam', desc: 'Like the Western scale, but with more notes and strict rules about how to move between them. Maqam Rast (like major but with flattened 3rd and 7th — in between major and minor). Maqam Hijaz (has that dramatic sound in flamenco and blues). Maqam Bayati (deeply melancholy). Each is a world unto itself.' },
      { name: 'Quarter Tones', desc: 'Divide each Western semitone in half. That\'s a quarter tone. Middle Eastern music uses notes that exist in the cracks between the piano keys. When you hear Arabic music and a note sounds "bent" or "in between" — that\'s not out of tune. That\'s a quarter tone, precisely placed.' },
      { name: 'Taqsim (Improvisation)', desc: 'A solo improvisation that travels through a Maqam\'s emotional landscape without a fixed rhythm. Like a spoken monologue in music. The player\'s job is to tell a story — from the Maqam\'s "home note" on a journey through tension and yearning back to resolution.' },
      { name: 'Rhythmic Cycles', desc: 'Turkish usul, Arabic iqa\'at — complex rhythmic cycles like Aksak (9/8 felt as 2+2+2+3). The name "Aksak" means "limping" in Turkish — the rhythm actually does feel like a rhythmic limp, and it\'s one of the most hypnotic patterns in world music.' },
    ],
    kidActivity: '🎸 Try this: play or sing a regular minor scale. Now raise the 7th note slightly — make it a tiny bit higher than normal. That slight sharpening creates the sound of Maqam Hijaz. You can hear it in flamenco guitar and in the theme from Pulp Fiction.',
    connection: 'Influenced: Flamenco (Moorish Spain), Greek Rebetiko, Turkish classical, Qawwali (Sufi devotional), Blues (the "blue notes" may have Middle Eastern ancestry via West Africa)',
    funFact: 'The Oud is the ancestor of the European lute, the Spanish guitar, and possibly the entire family of plucked string instruments in Western music. When the Moors ruled Spain (711–1492), they brought the Oud with them.',
  },
  {
    id: 'greece',
    emoji: '⚗️',
    name: 'The Mathematics of Sound',
    subtitle: 'Ancient Greek Music Theory',
    era: '~600 BCE → 400 CE',
    region: 'Mediterranean (Greece, Rome, Byzantine Empire)',
    color: C.greece,
    bg: 'linear-gradient(135deg, #001e3c 0%, #000a14 100%)',
    tagline: 'Pythagoras discovered that music is mathematics.',
    story: 'The Ancient Greeks were the first to write down a systematic music theory in the Western world. Pythagoras discovered that pleasing musical intervals correspond to simple mathematical ratios: an octave is 2:1. A perfect fifth is 3:2. A perfect fourth is 4:3. This was one of the most consequential scientific discoveries in history — mathematics could describe beauty.',
    elements: ['Mathematical Ratios', 'Modal Scales', 'Ethos Theory', 'Notation Beginnings', 'Cosmological Music'],
    instruments: ['Aulos (double reed)', 'Kithara (7-string lyre)', 'Syrinx (pan pipes)', 'Lyra', 'Tympanum (frame drum)'],
    theory: [
      { name: 'Pythagorean Tuning', desc: 'Pythagoras (560 BCE): pluck a string. Now pluck half the string — you get the note an octave higher (2:1 ratio). Two-thirds of the string? A perfect fifth (3:2). Three-quarters? A perfect fourth (4:3). All musical harmony is hidden in these simple fractions.' },
      { name: 'The Greek Modes', desc: 'The Greeks defined scales by starting on different notes of the same set of pitches. Dorian Mode (D to D on white keys): sounds noble, martial. Phrygian Mode (E to E): mysterious, Eastern. Lydian (F to F): bright, magical. Mixolydian (G to G): bluesy, open. These became the foundation of ALL Western music theory and are still used in jazz today.' },
      { name: 'Ethos Theory', desc: 'The Greeks believed different scales and modes had direct effects on human character. Plato wanted to BAN certain modes from his ideal Republic because he believed they made people weak or immoral. Dorian = courage. Phrygian = religious ecstasy. Lydian = relaxation (Plato banned this one).' },
      { name: 'Musica Universalis', desc: 'The "Music of the Spheres." Pythagoras believed the planets moving through space created music — ratios between their orbital periods corresponding to musical intervals. You couldn\'t hear it, but the mathematics proved it existed. This idea lasted 2,000 years, through Kepler in the 1600s.' },
      { name: 'Aristoxenus', desc: 'Aristotle\'s student and the world\'s first music theorist to focus on what the ear hears rather than what mathematics says. He said: if it sounds in tune, it IS in tune. This debate between mathematical perfection and practical hearing still drives music theory today.' },
    ],
    kidActivity: '🎸 Try this: take a guitar string or a rubber band. Pluck it. Now press exactly halfway down the string and pluck again — that note is exactly one octave higher. Press at two-thirds of the string — that\'s a perfect fifth. Pythagoras discovered this. You just became a Greek philosopher.',
    connection: 'Led directly to: Medieval Church modes, Renaissance polyphony, all Western music theory, Bach, Mozart, Beethoven, jazz theory',
    funFact: 'Pythagoras ran a secret society that worshipped mathematics and music. Members had strict rules: no eating beans, no stepping over a broom, and always honor the mathematical beauty of music.',
  },
  {
    id: 'europe',
    emoji: '🎼',
    name: 'The Great Cathedral',
    subtitle: 'European Classical Music Theory',
    era: '~900 CE → Present',
    region: 'Western Europe, Global (via colonialism and recording)',
    color: C.europe,
    bg: 'linear-gradient(135deg, #001e1a 0%, #000a08 100%)',
    tagline: 'Building music upward, like the cathedrals.',
    story: 'European classical music theory is the newest of the world\'s great traditions — but it grew faster than any other. Starting from Gregorian chant in medieval monasteries, European composers discovered polyphony (multiple melodies at once), invented the symphony orchestra, equal temperament, and developed the most complex written notation system in the world. In 400 years they went from one voice singing to 100-player orchestras.',
    elements: ['Harmony (chords)', 'Polyphony', 'Equal Temperament', 'Written Notation', 'Formal Structure'],
    instruments: ['Piano', 'Violin family (viola, cello, bass)', 'Woodwinds', 'Brass', 'Timpani', 'Pipe organ', 'Harpsichord'],
    theory: [
      { name: 'Polyphony', desc: 'Multiple independent melodic lines playing simultaneously. Invented in European churches around 900 CE. Organum: the priest sings the chant and another voice sings a parallel melody a fifth above. By Bach\'s time (1700s), composers were writing 8 independent voices weaving together — the most complex music ever written.' },
      { name: 'Chord Theory', desc: 'A chord is 3 or more notes played together. Major chords (happy, bright), Minor chords (sad, dark), Diminished (tense, scary), Augmented (mysterious). Chords can be organized into progressions — sequences that create tension and resolution. The I-IV-V-I progression is in thousands of songs.' },
      { name: 'Equal Temperament', desc: 'Divide the octave into exactly 12 equal semitones. This is a mathematical compromise — none of the intervals are perfectly pure, but you can play in ANY key and it sounds equally good (or equally impure). Johann Sebastian Bach wrote The Well-Tempered Clavier to prove this worked. It changed music forever.' },
      { name: 'Sonata Form', desc: 'Exposition (introduce themes) → Development (tear them apart and explore) → Recapitulation (bring them home). This three-part structure became the architecture for symphonies, concertos, and string quartets. Like a story with a beginning, complicated middle, and satisfying end.' },
      { name: 'The Common Practice Period', desc: 'Bach → Haydn → Mozart → Beethoven → Brahms → Debussy. 300 years of musical development where composers built on each other\'s discoveries like scientific progress. Each one pushed harmony further than the last, until Schoenberg (1908) finally threw away the rules entirely.' },
    ],
    kidActivity: '🎹 Try this: play C-E-G on a piano (or sing "do-mi-sol"). That\'s a C major chord — the most fundamental sound in Western music. Now play C-Eb-G (the middle note one step lower). Hear the sadness enter? That\'s a minor chord. That one-note change contains centuries of emotional theory.',
    connection: 'Dominated global pop music via colonialism and the recording industry. Found in: pop, rock, metal, film scores, video game music, virtually every genre worldwide',
    funFact: 'The symphony orchestra has its roots in 18th-century European courts. The word "orchestra" comes from Greek — it was the space in front of the ancient Greek stage where the chorus would dance. Europeans borrowed the word and gave it to their instrumental ensembles.',
  },
  {
    id: 'indigenous',
    emoji: '🌿',
    name: 'The Living Land',
    subtitle: 'Indigenous & First Nations Music Theory',
    era: '~40,000+ BCE → Now (Living Tradition)',
    region: 'Americas, Australia, Arctic, Pacific Islands, Africa, Asia',
    color: C.indigenous,
    bg: 'linear-gradient(135deg, '#001e00' 0%, #000a00 100%)',
    bg: 'linear-gradient(135deg, #001e00 0%, #000a00 100%)',
    tagline: 'Music as a conversation with the living world.',
    story: 'Indigenous musical traditions around the world share a profound belief: music is not separate from the land, from the animals, from the seasons, from the ancestors. Song is a technology for maintaining relationships — between humans and nature, between the living and the dead, between this generation and the next. The Australian Aboriginal songlines are perhaps the oldest navigational and historical record system in the world.',
    elements: ['Oral Transmission', 'Ceremonial Function', 'Land as Music', 'Spirit Voices', 'Overtone Singing'],
    instruments: ['Native American flute', 'Frame drum (pow-wow)', 'Didgeridoo', 'Bullroarer', 'Water drum', 'Rainstick', 'Voice (primary instrument in all traditions)'],
    theory: [
      { name: 'Songlines (Aboriginal Australia)', desc: 'Criss-crossing the Australian continent are invisible paths called songlines. Each path has a song associated with it. To navigate across the desert, you sing the song — and the landmarks in the song tell you where to walk. The oldest GPS system on Earth, encoded in music.' },
      { name: 'Overtone / Throat Singing', desc: 'Tuvan throat singing (Siberia), Inuit throat singing (Arctic), Mongolian Khöömei — one person makes TWO or THREE notes simultaneously by shaping the resonant chambers of their body. The melody floats above a fundamental drone. This requires mastery of acoustics that took Western scientists centuries to understand.' },
      { name: 'Native American Flute Theory', desc: 'The Plains flute uses a pentatonic minor scale but the scale is relative — it depends on the physical length and holes of each individual flute. No two flutes are identical. Music is therefore personal, physical, a relationship between player and instrument unique to each pair.' },
      { name: 'Ceremonial Structure', desc: 'Songs often have prescribed uses — healing songs, hunting songs, rain songs, planting songs, death songs. Using the wrong song at the wrong time is a serious transgression. Music has power. It does things in the world, not just to your emotions.' },
      { name: 'Call to Non-Human Beings', desc: 'Across many traditions, music is directed at animals, plants, weather, spirits, and the land itself. A whale song. An eagle call worked into melody. Rain drummed in a ceremony. The boundary between human music and "nature sounds" doesn\'t exist.' },
    ],
    kidActivity: '🎵 Try this: go outside and listen for 2 full minutes without making any sound. What do you hear? Wind? Birds? Traffic? Water? Now hum one note that matches the loudest natural sound you hear. You\'re doing what Indigenous musicians have done for 40,000 years — finding your place in the music that already exists.',
    connection: 'Influenced: New Age music, ambient music, nature recordings, electronic minimalism. Deeply underrepresented in world music scholarship.',
    funFact: 'The didgeridoo has been played by Aboriginal Australians for at least 1,500 years (some estimates say 40,000). It requires a breathing technique called "circular breathing" — breathing in through the nose while continuing to exhale through the instrument. No pause. Endless sound.',
  },
  {
    id: 'latin',
    emoji: '💃',
    name: 'The Clave & The Cross',
    subtitle: 'Latin American Music Theory',
    era: '~1500 CE → Now (Living Tradition)',
    region: 'Caribbean, South America, Central America, U.S. Latino communities',
    color: C.latin,
    bg: 'linear-gradient(135deg, #3d2800 0%, #110a00 100%)',
    tagline: 'The collision of three worlds made the most danceable music on Earth.',
    story: 'Latin American music is the sound of a collision: West African rhythms brought on slave ships. Spanish and Portuguese harmonic and melodic traditions from colonizers. Indigenous rhythms and instruments of the Americas. These three streams crashed together in Cuba, Brazil, Colombia, Argentina, and across the Caribbean — and from that violent mixing came something entirely new and irresistibly alive.',
    elements: ['Clave (the key rhythm)', 'Syncopation', 'Call & Response', 'Improvisation', 'African + European Fusion'],
    instruments: ['Congas', 'Bongos', 'Timbales', 'Claves', 'Maracas', 'Güiro', 'Tres (Cuban guitar)', 'Accordion (cumbia/norteño)', 'Piano', 'Bass'],
    theory: [
      { name: 'Clave', desc: 'A two-bar rhythmic pattern that is the heartbeat of Afro-Cuban and salsa music. Son clave (3-2): three hits in bar 1, two hits in bar 2. Or reversed (2-3). Every instrument in the band must align with the clave — if someone loses the clave, the whole house collapses. The most important rhythm in the Western Hemisphere.' },
      { name: 'Syncopation', desc: 'Placing accents on the weak beats or between beats. Instead of ONE-two-three-four, you hit on the "and" of two: ONE-two-AND-three-four. Latin music lives in the spaces between beats. That off-beat feeling is what makes your body move without your permission.' },
      { name: 'Brazilian Samba Theory', desc: 'Samba is built on a 2/4 pattern with the surdo (bass drum) on beats 2 and 4 (the opposite of European music). Layers of percussion on top: tamborim, cuíca, chocalho, repinique — each with its own interlocking pattern. A Carnival samba school with 300 drummers in perfect polyrhythmic lockstep is one of the most astonishing musical events on Earth.' },
      { name: 'Bossa Nova Harmony', desc: 'João Gilberto and Tom Jobim took American jazz harmony (complex ninth and thirteenth chords) and combined it with samba rhythm, playing it quietly on acoustic guitar. The result was intimate, harmonically sophisticated, and globally influential. "The Girl from Ipanema" is built on some of the most advanced jazz chord changes ever put into a popular song.' },
      { name: 'Cumbia (Colombia)', desc: 'One of the most widely spread Latin rhythms. Built on a 2/4 African clave foundation with Indigenous flute melodies on top and Spanish guitar and accordion. Cumbia traveled to Mexico, Peru, Argentina, and became local in each. The rhythm that unified a continent.' },
    ],
    kidActivity: '🥁 Try the clave: clap this pattern: [1] . [2] . . [3] [4] . [5] . . . [6] . [7] . (count to 8, clap on 1, 3, 5, 7 with spaces between). That\'s the 3-2 son clave. Now have someone walk in time while you clap it. Watch how the clave makes you move differently than a straight beat.',
    connection: 'Led to: Bossa nova, Afrobeats (via diaspora), Miami bass, reggaeton, bachata, merengue. Influenced: jazz (Dizzy Gillespie), pop (Paul Simon\'s Graceland), electronic (Caribou)',
    funFact: 'The accordion — now central to norteño music and cumbia — was invented in Germany in 1822. It arrived in Mexico and Colombia with European immigrants and was completely adopted by Indigenous and mestizo musicians within a generation.',
  },
  {
    id: 'modern',
    emoji: '🎛️',
    name: 'The New Genome',
    subtitle: 'Modern & Electronic Music Theory (20th–21st Century)',
    era: '1900 CE → Now (Still being invented)',
    region: 'Global (No borders anymore)',
    color: C.modern,
    bg: 'linear-gradient(135deg, #0a0e30 0%, #020408 100%)',
    tagline: 'When every sound ever made became available as a tool.',
    story: 'The 20th century did something no century before it could: record sound. Suddenly, music from any culture could travel. African polyrhythm reached Chicago and became Blues. Blues reached England and became Rock. Jazz harmony reached Brazil and became Bossa Nova. By the 21st century, a producer in Lagos could sample a 1970s Fela Kuti recording, layer a Berlin techno kick drum, use a New York rapper\'s flow, and release it globally in seconds. Music theory became: everything, all at once.',
    elements: ['Jazz Harmony', 'Modal Improvisation', 'Electronic Synthesis', 'Sampling', 'AI-Assisted Composition', 'Genre Fusion'],
    instruments: ['Electric guitar', 'Bass guitar', 'Drum kit', 'Synthesizer', 'Sampler', 'Digital Audio Workstation (DAW)', 'TR-808 drum machine', 'Human voice (still #1)'],
    theory: [
      { name: 'Jazz Harmony', desc: 'Jazz extended chords beyond the traditional triad (1-3-5) to include the 7th, 9th, 11th, and 13th — color tones that added emotional complexity. Charlie Parker and Dizzy Gillespie invented Bebop: playing the chord tones of one chord against a different chord, at impossible speed. Modal jazz (Miles Davis, Kind of Blue) released melody from chord changes entirely.' },
      { name: 'Electronic Synthesis', desc: 'Robert Moog built a synthesizer (1964) that could create any sound from nothing but electricity and mathematics. Suddenly the instrument was the sound itself — designers shaped waveforms, filtered frequencies, added envelope and modulation. Every pop song since 1980 contains synthesized sounds.' },
      { name: 'The 808', desc: 'The Roland TR-808 drum machine (1980) was a commercial failure — it didn\'t sound like a real drum kit. Hip-hop producers discovered you could detune its bass drum to create a sub-bass "thump" that went through walls. The 808 bass drum is now the most heard percussion sound on Earth. Still being used in every chart-topping song 45 years later.' },
      { name: 'Sampling & Collage', desc: 'Take a 2-second loop from a 1975 soul record. Loop it. Rap over it. Add a 808 bass. That\'s a hip-hop beat. Sampling turned all of music history into a toolkit. Every sound ever recorded became a potential ingredient. Music theory expanded to include: which samples sound good together, how to license them, and what constitutes originality.' },
      { name: 'AI-Assisted Composition', desc: 'Machine learning trained on millions of songs can now suggest chord progressions, generate melodies, separate instruments from recordings, and extend fragments into full compositions. The question is no longer "can a machine make music?" The question is: "who owns it, and who gets paid?" This is exactly why NOIZY.ai exists.' },
    ],
    kidActivity: '🎛️ Try this: use a free app like GarageBand or Soundtrap. Start with a drum loop. Add a bass. Add a melody on top. Layer sounds from different parts of the world. You are doing exactly what every modern producer does. You are composing a world-music hybrid that no human in history could have made before the internet existed.',
    connection: 'Is ALL of the above, remixed. Modern music theory is the synthesis of every tradition on this Atlas. Nothing is separate anymore.',
    funFact: 'The sample "Amen Break" (a 6-second drum solo from 1969 by The Winstons) has been sampled in thousands of songs and is considered the most important 6 seconds of recorded audio in history. It gave birth to jungle, drum and bass, and hip-hop.',
  },
];

// ============================================================
// UNIVERSAL ELEMENTS (the connective tissue)
// ============================================================

const UNIVERSAL = [
  {
    id: 'rhythm',
    symbol: '⏱',
    name: 'Rhythm',
    desc: 'The organization of sound in time. Found in every single musical culture on Earth. Some argue it predates melody — the first music was probably rhythmic percussion, not singing.',
    examples: 'African polyrhythm → Latin clave → electronic kick drum → your heartbeat',
    color: '#C84B11',
  },
  {
    id: 'pitch',
    symbol: '〰',
    name: 'Pitch',
    desc: 'High vs. low tones, organized into scales. Every culture uses scales — collections of notes considered "in tune" with each other. The scales differ: 5-note (pentatonic), 7-note (Western), 22-note (Indian), continuous (microtonal).',
    examples: 'Indian Raga → Chinese pentatonic → Western major scale → Blues blue notes',
    color: '#1A6B9E',
  },
  {
    id: 'harmony',
    symbol: '🎵',
    name: 'Harmony',
    desc: 'Notes sounding simultaneously. Whether it\'s African polyrhythm (rhythmic harmony), Indian tanpura drone, or European chords — every culture finds beauty in specific combinations of simultaneous sound.',
    examples: 'European chords → Indian drone + raga → African polyrhythm → overtone singing',
    color: '#1A7A6E',
  },
  {
    id: 'timbre',
    symbol: '🌊',
    name: 'Timbre',
    desc: 'The texture and color of a sound — what makes a flute sound different from a violin even at the same pitch. Every tradition has its own preferred timbres: the buzzing of a sitar, the reedy oboe, the raspy djembe.',
    examples: 'Mbira buzz → Sitar sympathetic strings → didgeridoo overtones → synthesizer waveform',
    color: '#7B4F9E',
  },
  {
    id: 'emotion',
    symbol: '❤️',
    name: 'Emotion',
    desc: 'Every musical tradition in the world uses music to access and express feelings. Whether it\'s Indian Rasa theory (9 emotions), Greek Ethos theory, or a pop song about heartbreak — music\'s job is to feel.',
    examples: 'Indian Rasa → Greek Ethos → Blues → Gospel → Qawwali devotional ecstasy',
    color: '#D4156A',
  },
  {
    id: 'community',
    symbol: '🤝',
    name: 'Community',
    desc: 'Music is almost never truly solo. Even the solo musician plays for an audience, for ancestors, for a tradition. The most common musical context across all cultures is communal: ceremony, worship, dance, celebration.',
    examples: 'African drum circle → Indian raga performance → Christian choir → Hip-hop cypher → electronic festival',
    color: '#D4A843',
  },
];

// ============================================================
// CANVAS: GLOBAL PULSE VISUALIZER
// ============================================================

function GlobalPulse({ activeWorld }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const worldColor = activeWorld ? activeWorld.color : C.gold;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width;
    const H = canvas.height;

    // World-specific ring configurations
    const rings = Array.from({ length: 6 }, (_, i) => ({
      phase: (i / 6) * Math.PI * 2,
      speed: 0.018 + i * 0.008,
      radius: 20 + i * 22,
      amp: 8 + i * 3,
      segments: 40 + i * 10,
    }));

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;

      rings.forEach((ring, ri) => {
        ctx.beginPath();
        for (let s = 0; s <= ring.segments; s++) {
          const angle = (s / ring.segments) * Math.PI * 2;
          const pulse = Math.sin(angle * (3 + ri) + t * ring.speed + ring.phase) * ring.amp;
          const r = ring.radius + pulse;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        const alpha = 0.15 + ri * 0.07;
        ctx.strokeStyle = worldColor + Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Center glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
      grad.addColorStop(0, worldColor + '60');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, Math.PI * 2);
      ctx.fill();

      t++;
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [worldColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}

// ============================================================
// CANVAS: FLOATING NOTES
// ============================================================

function FloatingNotes() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width;
    const H = canvas.height;

    const symbols = ['♩', '♪', '♫', '♬', '𝄞', '𝄢', '⊕', '◎', '●', '〰'];
    const colors = Object.values(WORLDS).map(w => w.color);

    const notes = Array.from({ length: 30 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 10 + Math.random() * 16,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.2 - Math.random() * 0.4,
      alpha: 0.05 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.01 + Math.random() * 0.02,
    }));

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      notes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        n.phase += n.phaseSpeed;
        if (n.y < -30) { n.y = H + 10; n.x = Math.random() * W; }
        if (n.x < -20) n.x = W + 10;
        if (n.x > W + 20) n.x = -10;
        const pulse = Math.sin(n.phase) * 0.3;
        ctx.globalAlpha = n.alpha + pulse * 0.1;
        ctx.fillStyle = n.color;
        ctx.font = `${n.size}px serif`;
        ctx.fillText(n.symbol, n.x, n.y);
      });
      ctx.globalAlpha = 1;
      t++;
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}

// ============================================================
// WORLD CARD (in the grid view)
// ============================================================

function WorldCard({ world, isActive, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: isActive || hover
          ? `linear-gradient(135deg, ${world.color}30 0%, ${world.color}10 100%)`
          : C.card,
        border: `1.5px solid ${isActive ? world.color : hover ? world.color + '80' : C.border}`,
        borderRadius: 12,
        padding: '18px 20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: isActive || hover ? 'translateY(-2px)' : 'none',
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 6 }}>{world.emoji}</div>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, color: world.color, marginBottom: 3, fontWeight: 600 }}>{world.name}</div>
      <div style={{ fontSize: 11, color: C.cream + '80', lineHeight: 1.4 }}>{world.subtitle}</div>
      <div style={{ marginTop: 8, fontSize: 10, color: world.color + 'aa', fontStyle: 'italic' }}>{world.era}</div>
    </div>
  );
}

// ============================================================
// THEORY CARD
// ============================================================

function TheoryCard({ item, color }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: open ? color + '12' : C.ghost,
        border: `1px solid ${open ? color + '60' : C.border}`,
        borderRadius: 8,
        padding: '12px 16px',
        marginBottom: 8,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onClick={() => setOpen(!open)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: color, fontSize: 14 }}>{item.name}</span>
        <span style={{ color: color, fontSize: 16 }}>{open ? '−' : '+'}</span>
      </div>
      {open && (
        <div style={{ marginTop: 10, fontSize: 13, color: C.cream + 'cc', lineHeight: 1.7, fontFamily: 'Lora, serif' }}>
          {item.desc}
        </div>
      )}
    </div>
  );
}

// ============================================================
// WORLD DETAIL PANEL
// ============================================================

function WorldDetail({ world }) {
  return (
    <div>
      {/* Hero */}
      <div style={{
        background: world.bg,
        borderRadius: 16,
        padding: '36px 40px',
        marginBottom: 28,
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${world.color}40`,
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 160, opacity: 0.15 }}>
          <GlobalPulse activeWorld={world} />
        </div>
        <div style={{ fontSize: 40, marginBottom: 10 }}>{world.emoji}</div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, color: world.color, fontWeight: 700, marginBottom: 6 }}>{world.name}</div>
        <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 16, color: C.cream + 'bb', marginBottom: 12, fontStyle: 'italic' }}>{world.subtitle}</div>
        <div style={{ fontSize: 12, color: world.color + 'aa', marginBottom: 16 }}>{world.region} · {world.era}</div>
        <div style={{ fontFamily: 'Lora, serif', fontSize: 18, color: C.cream, lineHeight: 1.5, fontStyle: 'italic', borderLeft: `3px solid ${world.color}`, paddingLeft: 16, maxWidth: 600 }}>
          "{world.tagline}"
        </div>
      </div>

      {/* Story */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '24px 28px', marginBottom: 20 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: world.color, marginBottom: 12 }}>The Story</div>
        <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + 'cc', lineHeight: 1.8 }}>{world.story}</div>
      </div>

      {/* Two columns: instruments + core elements */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, color: world.color, marginBottom: 12 }}>Instruments</div>
          {world.instruments.map((inst, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
              <span style={{ color: world.color, fontSize: 10, marginTop: 5 }}>◆</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.cream + 'cc' }}>{inst}</span>
            </div>
          ))}
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, color: world.color, marginBottom: 12 }}>Core Elements</div>
          {world.elements.map((el, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
              <span style={{ color: world.color, fontSize: 10, marginTop: 5 }}>◆</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.cream + 'cc' }}>{el}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Theory Cards */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, color: world.color, marginBottom: 16 }}>Music Theory Concepts</div>
        {world.theory.map((item, i) => <TheoryCard key={i} item={item} color={world.color} />)}
      </div>

      {/* Kid Activity */}
      <div style={{
        background: `linear-gradient(135deg, ${world.color}20 0%, ${world.color}08 100%)`,
        border: `1.5px solid ${world.color}60`,
        borderRadius: 12,
        padding: '20px 24px',
        marginBottom: 20,
      }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, color: world.color, marginBottom: 10 }}>Try It Yourself</div>
        <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream, lineHeight: 1.8 }}>{world.kidActivity}</div>
      </div>

      {/* Connection */}
      <div style={{ background: C.ghost, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: world.color, marginBottom: 6, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Musical Legacy</div>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.cream + 'bb', lineHeight: 1.6 }}>{world.connection}</div>
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.gold + 'aa', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }}>Fun Fact</div>
          <div style={{ fontFamily: 'Lora, serif', fontSize: 13, color: C.cream + 'aa', fontStyle: 'italic', lineHeight: 1.6 }}>{world.funFact}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// UNIVERSAL ELEMENTS VIEW
// ============================================================

function UniversalView() {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: C.gold, marginBottom: 12 }}>
          What Every Culture Discovered
        </div>
        <div style={{ fontFamily: 'Lora, serif', fontSize: 16, color: C.cream + 'aa', maxWidth: 600, margin: '0 auto', lineHeight: 1.7, fontStyle: 'italic' }}>
          Across 100,000 years and every continent, humans independently arrived at the same six musical truths. These are not cultural preferences. These are something deeper — possibly written into our biology.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
        {UNIVERSAL.map(u => (
          <div key={u.id} style={{
            background: C.card,
            border: `1px solid ${u.color}40`,
            borderRadius: 14,
            padding: '24px 28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 44, height: 44,
                borderRadius: '50%',
                background: `${u.color}20`,
                border: `1.5px solid ${u.color}60`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>
                {u.symbol}
              </div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: u.color, fontWeight: 700 }}>{u.name}</div>
            </div>
            <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + 'bb', lineHeight: 1.8, marginBottom: 14 }}>{u.desc}</div>
            <div style={{ fontSize: 11, color: u.color + '99', fontStyle: 'italic', fontFamily: 'DM Sans, sans-serif' }}>
              Found in: {u.examples}
            </div>
          </div>
        ))}
      </div>

      {/* The Genome Vision */}
      <div style={{
        background: `linear-gradient(135deg, ${C.gold}15 0%, transparent 100%)`,
        border: `1.5px solid ${C.gold}50`,
        borderRadius: 16,
        padding: '32px 36px',
        textAlign: 'center',
      }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.gold, marginBottom: 16 }}>
          The Global Music Genome Project
        </div>
        <div style={{ fontFamily: 'Lora, serif', fontSize: 15, color: C.cream + 'cc', lineHeight: 1.9, maxWidth: 700, margin: '0 auto', marginBottom: 20 }}>
          A living library containing every rhythm system, every scale, every instrument, every cultural tradition ever documented. Every child born on Earth deserves to know that the music they love is connected to music from everywhere and everyone who has ever lived.
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 30, flexWrap: 'wrap' }}>
          {['10 Traditions', '6 Universal Elements', '500+ Instruments', '1,000+ Scales & Modes', '100,000 Years of Music', '∞ Children'].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: C.gold, fontWeight: 700 }}>{stat.split(' ')[0]}</div>
              <div style={{ fontSize: 11, color: C.cream + '70', fontFamily: 'DM Sans, sans-serif' }}>{stat.split(' ').slice(1).join(' ')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CONNECTIONS VIEW — how traditions influenced each other
// ============================================================

function ConnectionsView() {
  const connections = [
    { from: 'prehistoric', to: 'africa', desc: 'African music preserved and amplified the first percussion traditions' },
    { from: 'prehistoric', to: 'indigenous', desc: 'Indigenous traditions worldwide are direct continuations of prehistoric music-making' },
    { from: 'africa', to: 'latin', desc: 'Enslaved Africans brought the clave, polyrhythm, and call-and-response to the Americas' },
    { from: 'africa', to: 'modern', desc: 'African rhythmic concepts are the foundation of blues, jazz, funk, and hip-hop' },
    { from: 'india', to: 'modern', desc: 'Raga theory influenced jazz (Coltrane\'s "India"), The Beatles, and ambient music' },
    { from: 'china', to: 'indigenous', desc: 'The pentatonic scale appears independently in both Chinese and many Indigenous traditions — suggesting a human universal' },
    { from: 'mideast', to: 'europe', desc: 'Arabic music theory entered Europe via Moorish Spain — the Oud became the lute, the guitar' },
    { from: 'mideast', to: 'latin', desc: 'Flamenco\'s Phrygian mode and ornamentation come directly from Moorish Andalusia' },
    { from: 'greece', to: 'europe', desc: 'All Western music theory descends from Pythagorean mathematics and Greek modal theory' },
    { from: 'europe', to: 'modern', desc: 'Jazz adopted and extended European harmony; electronic music extended European compositional forms' },
    { from: 'latin', to: 'modern', desc: 'Latin rhythm (clave, syncopation) is the heartbeat of reggaeton, salsa, and much pop music' },
    { from: 'indigenous', to: 'modern', desc: 'Throat singing influences avant-garde and experimental music; Native flute influences new age and ambient' },
  ];

  const getWorld = (id) => WORLDS.find(w => w.id === id);

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: C.gold, marginBottom: 10 }}>
          How Music Traveled the World
        </div>
        <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + 'aa', maxWidth: 560, margin: '0 auto', lineHeight: 1.7, fontStyle: 'italic' }}>
          Music doesn't stay where it was born. It travels with humans — on ships, in minds, through records, across the internet. Every genre you love is a conversation between traditions that started thousands of miles and years apart.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {connections.map((c, i) => {
          const fromWorld = getWorld(c.from);
          const toWorld = getWorld(c.to);
          return (
            <div key={i} style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 200 }}>
                <span style={{ fontSize: 18 }}>{fromWorld.emoji}</span>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: fromWorld.color, fontWeight: 600 }}>{fromWorld.name}</span>
              </div>
              <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${fromWorld.color}80, ${toWorld.color}80)`, position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 14, color: C.gold }}>→</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 200, justifyContent: 'flex-end' }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: toWorld.color, fontWeight: 600, textAlign: 'right' }}>{toWorld.name}</span>
                <span style={{ fontSize: 18 }}>{toWorld.emoji}</span>
              </div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 12, color: C.cream + '80', fontStyle: 'italic', minWidth: 220, textAlign: 'right' }}>
                {c.desc}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 32, background: C.ghost, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Lora, serif', fontSize: 16, color: C.cream, fontStyle: 'italic', lineHeight: 1.8 }}>
          "There is no such thing as a pure musical tradition.<br/>Every tradition that survived was one that could learn from its neighbors."
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: C.gold + '80', fontFamily: 'DM Sans, sans-serif' }}>— NOIZYKIDZ Global Music Atlas · NOIZY.ai · MC96ECO Universe</div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function NOIZYKidz() {
  const [view, setView] = useState('atlas');
  const [activeWorldId, setActiveWorldId] = useState(null);

  const activeWorld = WORLDS.find(w => w.id === activeWorldId) || null;

  const NAV = [
    { id: 'atlas', label: 'The Atlas' },
    { id: 'universal', label: 'Universal Elements' },
    { id: 'connections', label: 'How Music Traveled' },
  ];

  const handleWorldClick = (worldId) => {
    setActiveWorldId(worldId);
    setView('atlas');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: C.void,
      fontFamily: 'DM Sans, sans-serif',
      color: C.cream,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;600&family=IM+Fell+English:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2550; border-radius: 2px; }
      `}</style>

      {/* Background floating notes */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        <FloatingNotes />
      </div>

      {/* Content wrapper */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          padding: '52px 40px 32px',
          borderBottom: `1px solid ${C.border}`,
          background: `linear-gradient(180deg, ${C.deep} 0%, transparent 100%)`,
        }}>
          <div style={{ fontSize: 13, letterSpacing: 3, color: C.gold + '99', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'DM Sans, sans-serif' }}>
            NOIZY.ai · NOIZYKIDZ
          </div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 46, color: C.cream, fontWeight: 700, marginBottom: 8, lineHeight: 1.1 }}>
            Global Music Theory Atlas
          </div>
          <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 18, color: C.gold, fontStyle: 'italic', marginBottom: 16 }}>
            Every rhythm, scale, and tradition since the first rock was banged.
          </div>
          <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '80', maxWidth: 620, margin: '0 auto', lineHeight: 1.7 }}>
            Music is not a Western invention. It is a human inheritance — 100,000 years of rhythm, melody, and meaning from every culture on Earth. This atlas is for every child on this planet.
          </div>

          {/* World color strip */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginTop: 24, borderRadius: 6, overflow: 'hidden', maxWidth: 500, margin: '24px auto 0' }}>
            {WORLDS.map(w => (
              <div
                key={w.id}
                title={w.name}
                onClick={() => handleWorldClick(w.id)}
                style={{
                  flex: 1,
                  height: 8,
                  background: w.color,
                  cursor: 'pointer',
                  transition: 'height 0.2s',
                }}
                onMouseEnter={e => e.target.style.height = '14px'}
                onMouseLeave={e => e.target.style.height = '8px'}
              />
            ))}
          </div>
        </div>

        {/* Nav */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: C.void + 'f0',
          borderBottom: `1px solid ${C.border}`,
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          backdropFilter: 'blur(16px)',
        }}>
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => { setView(n.id); if (n.id !== 'atlas') setActiveWorldId(null); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '14px 20px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 13,
                color: view === n.id ? C.gold : C.cream + '70',
                borderBottom: view === n.id ? `2px solid ${C.gold}` : '2px solid transparent',
                marginBottom: -1,
                transition: 'color 0.15s',
                letterSpacing: 0.5,
              }}
            >{n.label}</button>
          ))}

          {activeWorld && view === 'atlas' && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, paddingRight: 4 }}>
              <span style={{ fontSize: 16 }}>{activeWorld.emoji}</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: activeWorld.color }}>{activeWorld.name}</span>
              <button
                onClick={() => setActiveWorldId(null)}
                style={{ background: 'none', border: 'none', color: C.cream + '60', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}
              >×</button>
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 40px 80px' }}>

          {/* ATLAS VIEW */}
          {view === 'atlas' && (
            <div>
              {!activeWorld ? (
                <div>
                  <div style={{ marginBottom: 28, textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: C.cream, marginBottom: 6 }}>10 Musical Worlds</div>
                    <div style={{ fontSize: 13, color: C.cream + '70', fontFamily: 'Lora, serif', fontStyle: 'italic' }}>Select any tradition to explore its theory, instruments, and living legacy</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
                    {WORLDS.map(world => (
                      <WorldCard
                        key={world.id}
                        world={world}
                        isActive={false}
                        onClick={() => setActiveWorldId(world.id)}
                      />
                    ))}
                  </div>

                  {/* Quick stat bar */}
                  <div style={{
                    marginTop: 36,
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: 14,
                    padding: '20px 30px',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                  }}>
                    {[
                      { n: '10', label: 'Traditions' },
                      { n: '100,000+', label: 'Years of Music' },
                      { n: '500+', label: 'Instruments' },
                      { n: '1,000+', label: 'Scales & Modes' },
                      { n: '6', label: 'Universal Elements' },
                      { n: '∞', label: 'Children to Reach' },
                    ].map((s, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.gold, fontWeight: 700 }}>{s.n}</div>
                        <div style={{ fontSize: 11, color: C.cream + '70', fontFamily: 'DM Sans, sans-serif', marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  {/* World selector sidebar + detail */}
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
                    {/* Sidebar */}
                    <div>
                      <div style={{ fontSize: 11, color: C.cream + '50', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', marginBottom: 10, paddingLeft: 4 }}>All Worlds</div>
                      {WORLDS.map(world => (
                        <div
                          key={world.id}
                          onClick={() => setActiveWorldId(world.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 12px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            background: world.id === activeWorldId ? world.color + '20' : 'transparent',
                            border: `1px solid ${world.id === activeWorldId ? world.color + '60' : 'transparent'}`,
                            marginBottom: 4,
                            transition: 'all 0.15s',
                          }}
                        >
                          <span style={{ fontSize: 16 }}>{world.emoji}</span>
                          <div>
                            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: world.id === activeWorldId ? world.color : C.cream + '90', fontWeight: world.id === activeWorldId ? 600 : 400 }}>{world.name}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Detail */}
                    <div>
                      <WorldDetail world={activeWorld} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* UNIVERSAL VIEW */}
          {view === 'universal' && <UniversalView />}

          {/* CONNECTIONS VIEW */}
          {view === 'connections' && <ConnectionsView />}

        </div>

        {/* Footer */}
        <div style={{
          borderTop: `1px solid ${C.border}`,
          padding: '24px 40px',
          textAlign: 'center',
          background: C.deep,
        }}>
          <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 15, color: C.gold, fontStyle: 'italic', marginBottom: 6 }}>
            "Music is the one thing every human civilization has ever done. Every single one."
          </div>
          <div style={{ fontSize: 11, color: C.cream + '50', fontFamily: 'DM Sans, sans-serif', letterSpacing: 1 }}>
            NOIZYKIDZ GLOBAL MUSIC THEORY ATLAS · NOIZY.AI · MC96ECO UNIVERSE · BUILT MARCH 2026
          </div>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 0, maxWidth: 300, margin: '12px auto 0', borderRadius: 3, overflow: 'hidden' }}>
            {WORLDS.map(w => (
              <div key={w.id} style={{ flex: 1, height: 3, background: w.color }} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
