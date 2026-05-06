'use strict';

const KANA_EXAMPLES = {
  hiragana: {
    "あ": {
      common:  { word: "新しい",   reading: "あたら しい",  meaning: "New" },
      slang:   { word: "垢",       reading: "あか",          meaning: "Account" },
      pokemon: { word: "あちゃも", reading: "あちゃも",      meaning: "Torchic" }
    },
    "い": {
      common:  { word: "忙しい",     reading: "いそが しい",  meaning: "Busy" },
      slang:   { word: "いみふ",     reading: "いみふ",        meaning: "Meaningless" },
      pokemon: { word: "いしつぶて", reading: "いしつぶて",    meaning: "Geodude" }
    },
    "う": {
      common:  { word: "海",   reading: "うみ",   meaning: "Sea" },
      slang:   { word: "うぽつ", reading: "うぽつ", meaning: "Thanks for the upload" },
      pokemon: { word: "うっう", reading: "うっう", meaning: "Cramorant" }
    },
    "え": {
      common:  { word: "笑顔",   reading: "え がお", meaning: "Smile" },
      slang:   { word: "えごさ", reading: "えごさ",  meaning: "Ego-search" },
      pokemon: { word: "えもんが", reading: "えもんが", meaning: "Emolga" }
    },
    "お": {
      common:  { word: "同じ",       reading: "おな じ", meaning: "Same" },
      slang:   { word: "おつ",       reading: "おつ",    meaning: "Good job" },
      pokemon: { word: "おーろんげ", reading: "おーろんげ", meaning: "Grimmsnarl" }
    },
    "か": {
      common:  { word: "傘",       reading: "かさ",     meaning: "Umbrella" },
      slang:   { word: "神",       reading: "かみ",     meaning: "God-tier" },
      pokemon: { word: "かいりゅー", reading: "かいりゅー", meaning: "Dragonite" }
    },
    "き": {
      common:  { word: "昨日",     reading: "きのう",   meaning: "Yesterday" },
      slang:   { word: "きたこれ", reading: "きたこれ", meaning: "It's here!" },
      pokemon: { word: "きばご",   reading: "きばご",   meaning: "Axew" }
    },
    "く": {
      common:  { word: "車",   reading: "くるま", meaning: "Car" },
      slang:   { word: "草",   reading: "くさ",   meaning: "LOL" },
      pokemon: { word: "くゎっす", reading: "くゎっす", meaning: "Quaxly" }
    },
    "け": {
      common:  { word: "携帯",   reading: "けい たい", meaning: "Mobile phone" },
      slang:   { word: "けち",   reading: "けち",      meaning: "Stingy" },
      pokemon: { word: "けろまつ", reading: "けろまつ",  meaning: "Froakie" }
    },
    "こ": {
      common:  { word: "子供",     reading: "こ ども",   meaning: "Child" },
      slang:   { word: "これ",     reading: "これ",      meaning: "This (emphasis)" },
      pokemon: { word: "こらいどん", reading: "こらいどん", meaning: "Koraidon" }
    },
    "さ": {
      common:  { word: "魚",       reading: "さかな",   meaning: "Fish" },
      slang:   { word: "され",     reading: "され",     meaning: "Surrender" },
      pokemon: { word: "さっちむし", reading: "さっちむし", meaning: "Blipbug" }
    },
    "し": {
      common:  { word: "仕事",       reading: "し ごと",      meaning: "Work" },
      slang:   { word: "しかと",     reading: "しかと",        meaning: "Ignore" },
      pokemon: { word: "しるゔぁでぃ", reading: "しるゔぁでぃ", meaning: "Silvally" }
    },
    "す": {
      common:  { word: "寿司",       reading: "す し",     meaning: "Sushi" },
      slang:   { word: "すこ",       reading: "すこ",      meaning: "Love/Like" },
      pokemon: { word: "すいみっくる", reading: "すいみっくる", meaning: "Dewpider" }
    },
    "せ": {
      common:  { word: "背中",   reading: "せ なか", meaning: "Back" },
      slang:   { word: "せのび", reading: "せのび",  meaning: "Showing off" },
      pokemon: { word: "せびえ", reading: "せびえ",  meaning: "Frigibax" }
    },
    "そ": {
      common:  { word: "空",       reading: "そら",     meaning: "Sky" },
      slang:   { word: "そーしゃげ", reading: "そーしゃげ", meaning: "Social game" },
      pokemon: { word: "そーなんす", reading: "そーなんす", meaning: "Wobbuffet" }
    },
    "た": {
      common:  { word: "食べ物",   reading: "た べ もの", meaning: "Food" },
      slang:   { word: "たいぱ",   reading: "たいぱ",     meaning: "Time performance" },
      pokemon: { word: "たっつー", reading: "たっつー",   meaning: "Horsea" }
    },
    "ち": {
      common:  { word: "地下",   reading: "ち か",   meaning: "Underground" },
      slang:   { word: "ちーと", reading: "ちーと", meaning: "Cheat" },
      pokemon: { word: "ちごらす", reading: "ちごらす", meaning: "Tyrunt" }
    },
    "つ": {
      common:  { word: "机",       reading: "つくえ",   meaning: "Desk" },
      slang:   { word: "つんでれ", reading: "つんでれ", meaning: "Tsundere" },
      pokemon: { word: "つたーじゃ", reading: "つたーじゃ", meaning: "Snivy" }
    },
    "て": {
      common:  { word: "手紙",   reading: "て がみ", meaning: "Letter" },
      slang:   { word: "てら",   reading: "てら",    meaning: "Very" },
      pokemon: { word: "てらきおん", reading: "てらきおん", meaning: "Terrakion" }
    },
    "と": {
      common:  { word: "時計",     reading: "と けい",   meaning: "Watch" },
      slang:   { word: "とつ",     reading: "とつ",      meaning: "Contact" },
      pokemon: { word: "とさきんと", reading: "とさきんと", meaning: "Goldeen" }
    },
    "な": {
      common:  { word: "夏",       reading: "なつ",     meaning: "Summer" },
      slang:   { word: "なう",     reading: "なう",     meaning: "Now" },
      pokemon: { word: "なぞのくさ", reading: "なぞのくさ", meaning: "Oddish" }
    },
    "に": {
      common:  { word: "肉",     reading: "にく",   meaning: "Meat" },
      slang:   { word: "にっち", reading: "にっち", meaning: "Niche" },
      pokemon: { word: "にゃおは", reading: "にゃおは", meaning: "Sprigatito" }
    },
    "ぬ": {
      common:  { word: "温い",   reading: "ぬる い", meaning: "Lukewarm" },
      slang:   { word: "ぬるぽ", reading: "ぬるぽ",  meaning: "NullPointer" },
      pokemon: { word: "ぬめら", reading: "ぬめら",  meaning: "Goomy" }
    },
    "ね": {
      common:  { word: "猫",     reading: "ねこ",   meaning: "Cat" },
      slang:   { word: "ねた",   reading: "ねた",   meaning: "Joke/Meme" },
      pokemon: { word: "ねくろずま", reading: "ねくろずま", meaning: "Necrozma" }
    },
    "の": {
      common:  { word: "喉",   reading: "のど", meaning: "Throat" },
      slang:   { word: "のり", reading: "のり", meaning: "Vibe" },
      pokemon: { word: "のこっち", reading: "のこっち", meaning: "Dunsparce" }
    },
    "は": {
      common:  { word: "花",     reading: "はな",   meaning: "Flower" },
      slang:   { word: "はげど", reading: "はげど", meaning: "Strongly agree" },
      pokemon: { word: "はっさむ", reading: "はっさむ", meaning: "Scizor" }
    },
    "ひ": {
      common:  { word: "光",     reading: "ひかり", meaning: "Light" },
      slang:   { word: "ひく",   reading: "ひく",   meaning: "To be put off" },
      pokemon: { word: "ひとかげ", reading: "ひとかげ", meaning: "Charmander" }
    },
    "ふ": {
      common:  { word: "船",     reading: "ふね",   meaning: "Ship" },
      slang:   { word: "ふぁぼ", reading: "ふぁぼ", meaning: "Favorite" },
      pokemon: { word: "ふしぎだね", reading: "ふしぎだね", meaning: "Bulbasaur" }
    },
    "へ": {
      common:  { word: "平和",     reading: "へい わ", meaning: "Peace" },
      slang:   { word: "へたれ",   reading: "へたれ",  meaning: "Coward" },
      pokemon: { word: "へらくろす", reading: "へらくろす", meaning: "Heracross" }
    },
    "ほ": {
      common:  { word: "本当",   reading: "ほん とう", meaning: "Really" },
      slang:   { word: "ほしゅ", reading: "ほしゅ",   meaning: "Thread bump" },
      pokemon: { word: "ほげーた", reading: "ほげーた", meaning: "Fuecoco" }
    },
    "ま": {
      common:  { word: "毎日",   reading: "まい にち", meaning: "Every day" },
      slang:   { word: "まじ",   reading: "まじ",      meaning: "Serious" },
      pokemon: { word: "まねね", reading: "まねね",    meaning: "Mime Jr." }
    },
    "み": {
      common:  { word: "水",   reading: "みず", meaning: "Water" },
      slang:   { word: "みす", reading: "みす", meaning: "Mistake" },
      pokemon: { word: "みゅー", reading: "みゅー", meaning: "Mew" }
    },
    "む": {
      common:  { word: "難しい",   reading: "むずか しい", meaning: "Difficult" },
      slang:   { word: "むかつく", reading: "むかつく",    meaning: "Irritating" },
      pokemon: { word: "むっくる", reading: "むっくる",    meaning: "Starly" }
    },
    "め": {
      common:  { word: "珍しい",   reading: "めずら しい", meaning: "Rare" },
      slang:   { word: "めしてろ", reading: "めしてろ",    meaning: "Food porn" },
      pokemon: { word: "めっそん", reading: "めっそん",    meaning: "Sobble" }
    },
    "も": {
      common:  { word: "森",   reading: "もり",   meaning: "Forest" },
      slang:   { word: "もえ", reading: "もえ",   meaning: "Cute" },
      pokemon: { word: "もくろー", reading: "もくろー", meaning: "Rowlet" }
    },
    "や": {
      common:  { word: "山",   reading: "やま",   meaning: "Mountain" },
      slang:   { word: "やばい", reading: "やばい", meaning: "Insane" },
      pokemon: { word: "やどん", reading: "やどん", meaning: "Slowpoke" }
    },
    "ゆ": {
      common:  { word: "雪",     reading: "ゆき",   meaning: "Snow" },
      slang:   { word: "ゆるふわ", reading: "ゆるふわ", meaning: "Soft/Fluffy" },
      pokemon: { word: "ゆきわらし", reading: "ゆきわらし", meaning: "Snorunt" }
    },
    "よ": {
      common:  { word: "夜",   reading: "よる", meaning: "Night" },
      slang:   { word: "よろ", reading: "よろ", meaning: "Please" },
      pokemon: { word: "よわし", reading: "よわし", meaning: "Wishiwashi" }
    },
    "ら": {
      common:  { word: "来週",       reading: "らい しゅう", meaning: "Next week" },
      slang:   { word: "ラグる",     reading: "らぐ る",     meaning: "To lag (Gaming)" },
      pokemon: { word: "らうどぼーん", reading: "らうどぼーん", meaning: "Skeledirge" }
    },
    "り": {
      common:  { word: "林檎",   reading: "りん ご", meaning: "Apple" },
      slang:   { word: "りぷ",   reading: "りぷ",    meaning: "Reply" },
      pokemon: { word: "りざーどん", reading: "りざーどん", meaning: "Charizard" }
    },
    "る": {
      common:  { word: "留守",   reading: "る す",  meaning: "Absence" },
      slang:   { word: "るーぷ", reading: "るーぷ", meaning: "Loop" },
      pokemon: { word: "るぎあ", reading: "るぎあ", meaning: "Lugia" }
    },
    "れ": {
      common:  { word: "歴史",   reading: "れき し", meaning: "History" },
      slang:   { word: "れす",   reading: "れす",    meaning: "Response" },
      pokemon: { word: "れっくうざ", reading: "れっくうざ", meaning: "Rayquaza" }
    },
    "ろ": {
      common:  { word: "六",   reading: "ろく", meaning: "Six" },
      slang:   { word: "ろむ", reading: "ろむ", meaning: "Lurking" },
      pokemon: { word: "ろこん", reading: "ろこん", meaning: "Vulpix" }
    },
    "わ": {
      common:  { word: "私",     reading: "わたし", meaning: "Me" },
      slang:   { word: "わろた", reading: "わろた", meaning: "LOL" },
      pokemon: { word: "わにのこ", reading: "わにのこ", meaning: "Totodile" }
    },
    "を": {
      common:  { word: "〜を", reading: "を",  meaning: "Object marker" },
      slang:   { word: "N/A",  reading: "N/A", meaning: "N/A" },
      pokemon: { word: "N/A",  reading: "N/A", meaning: "N/A" }
    },
    "ん": {
      common:  { word: "全然",   reading: "ぜん ぜん", meaning: "Not at all" },
      slang:   { word: "〜んご", reading: "んご",       meaning: "Suffix" },
      pokemon: { word: "めたもん", reading: "めたもん",  meaning: "Ditto" }
    },
    "が": {
      common:  { word: "学校",   reading: "がっ こう", meaning: "School" },
      slang:   { word: "がち",   reading: "がち",      meaning: "Serious" },
      pokemon: { word: "がちぐま", reading: "がちぐま", meaning: "Ursaluna" }
    },
    "ぎ": {
      common:  { word: "銀",     reading: "ぎん",   meaning: "Silver" },
      slang:   { word: "ぎが",   reading: "ぎが",   meaning: "Data" },
      pokemon: { word: "ぎゃらどす", reading: "ぎゃらどす", meaning: "Gyarados" }
    },
    "ぐ": {
      common:  { word: "軍隊",   reading: "ぐん たい", meaning: "Army" },
      slang:   { word: "ぐぐる", reading: "ぐぐる",   meaning: "To google" },
      pokemon: { word: "ぐらーどん", reading: "ぐらーどん", meaning: "Groudon" }
    },
    "げ": {
      common:  { word: "元気",   reading: "げん き", meaning: "Healthy" },
      slang:   { word: "げす",   reading: "げす",    meaning: "Scum" },
      pokemon: { word: "げんがー", reading: "げんがー", meaning: "Gengar" }
    },
    "ご": {
      common:  { word: "ご飯",   reading: "ご はん", meaning: "Meal" },
      slang:   { word: "ごみ",   reading: "ごみ",    meaning: "Trash" },
      pokemon: { word: "ごーす", reading: "ごーす",  meaning: "Gastly" }
    },
    "ざ": {
      common:  { word: "雑誌",   reading: "ざっ し", meaning: "Magazine" },
      slang:   { word: "ざこ",   reading: "ざこ",    meaning: "Weakling" },
      pokemon: { word: "ざしあん", reading: "ざしあん", meaning: "Zacian" }
    },
    "じ": {
      common:  { word: "時間",   reading: "じ かん", meaning: "Time" },
      slang:   { word: "じわる", reading: "じわる",  meaning: "Amusing" },
      pokemon: { word: "じらーち", reading: "じらーち", meaning: "Jirachi" }
    },
    "ず": {
      common:  { word: "図画",   reading: "ず が",  meaning: "Drawing" },
      slang:   { word: "ずっと", reading: "ずっと", meaning: "Always" },
      pokemon: { word: "ずばっと", reading: "ずばっと", meaning: "Zubat" }
    },
    "ぜ": {
      common:  { word: "全部",   reading: "ぜん ぶ", meaning: "All" },
      slang:   { word: "ぜろ",   reading: "ぜろ",    meaning: "None" },
      pokemon: { word: "ぜくろむ", reading: "ぜくろむ", meaning: "Zekrom" }
    },
    "ぞ": {
      common:  { word: "画像",   reading: "が ぞう", meaning: "Image" },
      slang:   { word: "だぞ",   reading: "だぞ",    meaning: "Assertion" },
      pokemon: { word: "ぞろあーく", reading: "ぞろあーく", meaning: "Zoroark" }
    },
    "だ": {
      common:  { word: "大学",     reading: "だい がく", meaning: "University" },
      slang:   { word: "だれとく", reading: "だれ とく", meaning: "Who benefits?" },
      pokemon: { word: "だるまっか", reading: "だるまっか", meaning: "Darumaka" }
    },
    "で": {
      common:  { word: "出口",     reading: "で ぐち", meaning: "Exit" },
      slang:   { word: "でふぉ",   reading: "でふぉ",  meaning: "Default" },
      pokemon: { word: "でかぬちゃん", reading: "でかぬちゃん", meaning: "Tinkaton" }
    },
    "ど": {
      common:  { word: "道具",     reading: "どう ぐ",   meaning: "Tool" },
      slang:   { word: "どやがお", reading: "どや がお", meaning: "Smug face" },
      pokemon: { word: "どどげざん", reading: "どどげざん", meaning: "Kingambit" }
    },
    "ば": {
      common:  { word: "番組",   reading: "ばん ぐみ", meaning: "Program" },
      slang:   { word: "ばずる", reading: "ばずる",    meaning: "Go viral" },
      pokemon: { word: "ばくふーん", reading: "ばくふーん", meaning: "Typhlosion" }
    },
    "び": {
      common:  { word: "病院",     reading: "びょう いん", meaning: "Hospital" },
      slang:   { word: "びれぞん", reading: "びれぞん",    meaning: "Tiny chance" },
      pokemon: { word: "びっぱ",   reading: "びっぱ",      meaning: "Bidoof" }
    },
    "ぶ": {
      common:  { word: "豚",     reading: "ぶた",   meaning: "Pig" },
      slang:   { word: "ぶひる", reading: "ぶひる", meaning: "Obsessing" },
      pokemon: { word: "ぶいぜる", reading: "ぶいぜる", meaning: "Buizel" }
    },
    "べ": {
      common:  { word: "弁当",   reading: "べん とう", meaning: "Lunch box" },
      slang:   { word: "べた",   reading: "べた",      meaning: "Cliche" },
      pokemon: { word: "べとべたー", reading: "べとべたー", meaning: "Grimer" }
    },
    "ぼ": {
      common:  { word: "防止",   reading: "ぼう し", meaning: "Prevention" },
      slang:   { word: "ぼっち", reading: "ぼっち",  meaning: "Loner" },
      pokemon: { word: "ぼーまんだ", reading: "ぼーまんだ", meaning: "Salamence" }
    },
    "ぱ": {
      common:  { word: "いっぱい", reading: "いっ ぱい", meaning: "Full" },
      slang:   { word: "ぱにくる", reading: "ぱにくる",   meaning: "Panic" },
      pokemon: { word: "ぱも",     reading: "ぱも",       meaning: "Pawmi" }
    },
    "ぴ": {
      common:  { word: "発表",   reading: "はっ ぴょう", meaning: "Presentation" },
      slang:   { word: "ぴえん", reading: "ぴえん",      meaning: "Sad emoji" },
      pokemon: { word: "ぴかちゅう", reading: "ぴかちゅう", meaning: "Pikachu" }
    },
    "ぷ": {
      common:  { word: "切符",   reading: "きっ ぷ",  meaning: "Ticket" },
      slang:   { word: "ぷぎゃー", reading: "ぷぎゃー", meaning: "Laughing" },
      pokemon: { word: "ぷりん", reading: "ぷりん",   meaning: "Jigglypuff" }
    },
    "ぺ": {
      common:  { word: "ほっぺ",   reading: "ほっ ぺ",   meaning: "Cheek" },
      slang:   { word: "ぺこ",     reading: "ぺこ",      meaning: "Hungry" },
      pokemon: { word: "ぺりっぱー", reading: "ぺりっぱー", meaning: "Pelipper" }
    },
    "ぽ": {
      common:  { word: "散歩",   reading: "さん ぽ", meaning: "Walk" },
      slang:   { word: "ぽい",   reading: "ぽい",    meaning: "Like" },
      pokemon: { word: "ぽっちゃま", reading: "ぽっちゃま", meaning: "Piplup" }
    }
  },
  katakana: {
    "ア": {
      common:  { word: "アイス", reading: "アイス", meaning: "Ice cream" },
      slang:   { word: "アンチ", reading: "アンチ", meaning: "Hater" },
      pokemon: { word: "アチャモ", reading: "アチャモ", meaning: "Torchic" }
    },
    "イ": {
      common:  { word: "インク",   reading: "インク",   meaning: "Ink" },
      slang:   { word: "イケメン", reading: "イケメン", meaning: "Handsome" },
      pokemon: { word: "イーブイ", reading: "イーブイ", meaning: "Eevee" }
    },
    "ウ": {
      common:  { word: "ウサギ", reading: "ウサギ", meaning: "Rabbit" },
      slang:   { word: "ウケる", reading: "ウケる", meaning: "Funny" },
      pokemon: { word: "ウパー",  reading: "ウパー",  meaning: "Wooper" }
    },
    "エ": {
      common:  { word: "エプロン", reading: "エプロン", meaning: "Apron" },
      slang:   { word: "エモい",   reading: "エモい",   meaning: "Emotional" },
      pokemon: { word: "エモンガ", reading: "エモンガ", meaning: "Emolga" }
    },
    "オ": {
      common:  { word: "オフィス", reading: "オフィス", meaning: "Office" },
      slang:   { word: "オワコン", reading: "オワコン", meaning: "Dated" },
      pokemon: { word: "オタチ",   reading: "オタチ",   meaning: "Sentret" }
    },
    "カ": {
      common:  { word: "カメラ",   reading: "カメラ",   meaning: "Camera" },
      slang:   { word: "カモ",     reading: "カモ",     meaning: "Target" },
      pokemon: { word: "カメックス", reading: "カメックス", meaning: "Blastoise" }
    },
    "キ": {
      common:  { word: "キーボード", reading: "キー ボード", meaning: "Keyboard" },
      slang:   { word: "キタ",       reading: "キタ",        meaning: "It's here!" },
      pokemon: { word: "キモリ",     reading: "キモリ",      meaning: "Treecko" }
    },
    "ク": {
      common:  { word: "クラス", reading: "クラス", meaning: "Class" },
      slang:   { word: "ググる", reading: "ググる", meaning: "To google" },
      pokemon: { word: "クチート", reading: "クチート", meaning: "Mawile" }
    },
    "ケ": {
      common:  { word: "ケーキ", reading: "ケーキ", meaning: "Cake" },
      slang:   { word: "ケチ",   reading: "ケチ",   meaning: "Stingy" },
      pokemon: { word: "ケロマツ", reading: "ケロマツ", meaning: "Froakie" }
    },
    "コ": {
      common:  { word: "コップ",   reading: "コップ",   meaning: "Cup" },
      slang:   { word: "コスプレ", reading: "コスプレ", meaning: "Cosplay" },
      pokemon: { word: "ココドラ", reading: "ココドラ", meaning: "Aron" }
    },
    "サ": {
      common:  { word: "サラダ",   reading: "サラダ",   meaning: "Salad" },
      slang:   { word: "サレ",     reading: "サレ",     meaning: "Surrender" },
      pokemon: { word: "サンダース", reading: "サンダース", meaning: "Jolteon" }
    },
    "シ": {
      common:  { word: "シカ",     reading: "シカ",     meaning: "Deer" },
      slang:   { word: "シカト",   reading: "シカト",   meaning: "Ignore" },
      pokemon: { word: "シルヴァディ", reading: "シルヴァディ", meaning: "Silvally" }
    },
    "ス": {
      common:  { word: "スキー",   reading: "スキー",   meaning: "Ski" },
      slang:   { word: "スルー",   reading: "スルー",   meaning: "Ignore" },
      pokemon: { word: "ストライク", reading: "ストライク", meaning: "Scyther" }
    },
    "セ": {
      common:  { word: "セミ",   reading: "セミ",   meaning: "Cicada" },
      slang:   { word: "センス", reading: "センス", meaning: "Style" },
      pokemon: { word: "セレビィ", reading: "セレビィ", meaning: "Celebi" }
    },
    "ソ": {
      common:  { word: "ソファー", reading: "ソファー", meaning: "Sofa" },
      slang:   { word: "ソシャゲ", reading: "ソシャゲ", meaning: "Social game" },
      pokemon: { word: "ソーナンス", reading: "ソーナンス", meaning: "Wobbuffet" }
    },
    "タ": {
      common:  { word: "タオル", reading: "タオル", meaning: "Towel" },
      slang:   { word: "タイパ", reading: "タイパ", meaning: "Time performance" },
      pokemon: { word: "タッツー", reading: "タッツー", meaning: "Horsea" }
    },
    "チ": {
      common:  { word: "チーム", reading: "チーム", meaning: "Team" },
      slang:   { word: "チート", reading: "チート", meaning: "Cheat" },
      pokemon: { word: "チコリータ", reading: "チコリータ", meaning: "Chikorita" }
    },
    "ツ": {
      common:  { word: "ツリー",   reading: "ツリー",   meaning: "Tree" },
      slang:   { word: "ツンデレ", reading: "ツンデレ", meaning: "Tsundere" },
      pokemon: { word: "ツタージャ", reading: "ツタージャ", meaning: "Snivy" }
    },
    "テ": {
      common:  { word: "テレビ", reading: "テレビ", meaning: "TV" },
      slang:   { word: "テラ",   reading: "テラ",   meaning: "Huge" },
      pokemon: { word: "テラキオン", reading: "テラキオン", meaning: "Terrakion" }
    },
    "ト": {
      common:  { word: "トイレ",   reading: "トイレ",   meaning: "Toilet" },
      slang:   { word: "トラウマ", reading: "トラウマ", meaning: "Trauma" },
      pokemon: { word: "トサキント", reading: "トサキント", meaning: "Goldeen" }
    },
    "ナ": {
      common:  { word: "ナイフ", reading: "ナイフ", meaning: "Knife" },
      slang:   { word: "ナウい", reading: "ナウい", meaning: "Trendy" },
      pokemon: { word: "ナエトル", reading: "ナエトル", meaning: "Turtwig" }
    },
    "ニ": {
      common:  { word: "ニュース", reading: "ニュース", meaning: "News" },
      slang:   { word: "ニッチ",   reading: "ニッチ",   meaning: "Niche" },
      pokemon: { word: "ニャース", reading: "ニャース",  meaning: "Meowth" }
    },
    "ヌ": {
      common:  { word: "ヌードル", reading: "ヌードル", meaning: "Noodle" },
      slang:   { word: "ヌルい",   reading: "ヌル い",  meaning: "Weak" },
      pokemon: { word: "ヌオー",   reading: "ヌオー",   meaning: "Quagsire" }
    },
    "ネ": {
      common:  { word: "ネクタイ", reading: "ネクタイ", meaning: "Tie" },
      slang:   { word: "ネタ",     reading: "ネタ",     meaning: "Meme" },
      pokemon: { word: "ネクロズマ", reading: "ネクロズマ", meaning: "Necrozma" }
    },
    "ノ": {
      common:  { word: "ノート", reading: "ノート", meaning: "Notebook" },
      slang:   { word: "ノリ",   reading: "ノリ",   meaning: "Vibe" },
      pokemon: { word: "ノコッチ", reading: "ノコッチ", meaning: "Dunsparce" }
    },
    "ハ": {
      common:  { word: "ハム",   reading: "ハム",   meaning: "Ham" },
      slang:   { word: "ハズい", reading: "ハズ い", meaning: "Embarrassing" },
      pokemon: { word: "ハッサム", reading: "ハッサム", meaning: "Scizor" }
    },
    "ヒ": {
      common:  { word: "ヒント", reading: "ヒント", meaning: "Hint" },
      slang:   { word: "ヒキ弱", reading: "ヒキ 弱", meaning: "Bad luck" },
      pokemon: { word: "ヒトカゲ", reading: "ヒトカゲ", meaning: "Charmander" }
    },
    "フ": {
      common:  { word: "フォーク", reading: "フォーク", meaning: "Fork" },
      slang:   { word: "フェチ",   reading: "フェチ",   meaning: "Fetish" },
      pokemon: { word: "フシギダネ", reading: "フシギダネ", meaning: "Bulbasaur" }
    },
    "ヘ": {
      common:  { word: "ヘリコプター", reading: "ヘリコプター", meaning: "Helicopter" },
      slang:   { word: "ヘタレ",       reading: "ヘタレ",       meaning: "Coward" },
      pokemon: { word: "ヘラクロス",   reading: "ヘラクロス",   meaning: "Heracross" }
    },
    "ホ": {
      common:  { word: "ホテル", reading: "ホテル", meaning: "Hotel" },
      slang:   { word: "ポジ",   reading: "ポジ",   meaning: "Positive" },
      pokemon: { word: "ホエルオー", reading: "ホエルオー", meaning: "Wailord" }
    },
    "マ": {
      common:  { word: "マスク", reading: "マスク", meaning: "Mask" },
      slang:   { word: "マジ",   reading: "マジ",   meaning: "Serious" },
      pokemon: { word: "マリル", reading: "マリル", meaning: "Marill" }
    },
    "ミ": {
      common:  { word: "ミルク", reading: "ミルク", meaning: "Milk" },
      slang:   { word: "ミス",   reading: "ミス",   meaning: "Mistake" },
      pokemon: { word: "ミュウ", reading: "ミュウ", meaning: "Mew" }
    },
    "ム": {
      common:  { word: "ムース",   reading: "ムース",   meaning: "Mousse" },
      slang:   { word: "ムカつく", reading: "ムカ つく", meaning: "Irritating" },
      pokemon: { word: "ムックル", reading: "ムックル", meaning: "Starly" }
    },
    "メ": {
      common:  { word: "メール",   reading: "メール",   meaning: "Email" },
      slang:   { word: "メンヘラ", reading: "メンヘラ", meaning: "Mental health" },
      pokemon: { word: "メタグロス", reading: "メタグロス", meaning: "Metagross" }
    },
    "モ": {
      common:  { word: "モデル", reading: "モデル", meaning: "Model" },
      slang:   { word: "モニタ", reading: "モニタ", meaning: "Monitor" },
      pokemon: { word: "モクロー", reading: "モクロー", meaning: "Rowlet" }
    },
    "ヤ": {
      common:  { word: "ヤカン", reading: "ヤカン",  meaning: "Kettle" },
      slang:   { word: "ヤバい", reading: "ヤバ い", meaning: "Insane" },
      pokemon: { word: "ヤドン", reading: "ヤドン",  meaning: "Slowpoke" }
    },
    "ユ": {
      common:  { word: "ユニホーム", reading: "ユニホーム", meaning: "Uniform" },
      slang:   { word: "ユルい",     reading: "ユル い",    meaning: "Lax" },
      pokemon: { word: "ユキワラシ", reading: "ユキワラシ", meaning: "Snorunt" }
    },
    "ヨ": {
      common:  { word: "ヨガ", reading: "ヨガ", meaning: "Yoga" },
      slang:   { word: "ヨロ", reading: "ヨロ", meaning: "Pls" },
      pokemon: { word: "ヨワシ", reading: "ヨワシ", meaning: "Wishiwashi" }
    },
    "ラ": {
      common:  { word: "ラジオ", reading: "ラジオ", meaning: "Radio" },
      slang:   { word: "ライフ", reading: "ライフ", meaning: "HP" },
      pokemon: { word: "ラプラス", reading: "ラプラス", meaning: "Lapras" }
    },
    "リ": {
      common:  { word: "リボン", reading: "リボン", meaning: "Ribbon" },
      slang:   { word: "リプ",   reading: "リプ",   meaning: "Reply" },
      pokemon: { word: "リザードン", reading: "リザードン", meaning: "Charizard" }
    },
    "ル": {
      common:  { word: "ルール", reading: "ルール", meaning: "Rule" },
      slang:   { word: "ループ", reading: "ループ", meaning: "Loop" },
      pokemon: { word: "ルギア", reading: "ルギア", meaning: "Lugia" }
    },
    "レ": {
      common:  { word: "レジ", reading: "レジ", meaning: "Register" },
      slang:   { word: "レス", reading: "レス", meaning: "Response" },
      pokemon: { word: "レックウザ", reading: "レックウザ", meaning: "Rayquaza" }
    },
    "ロ": {
      common:  { word: "ロボット", reading: "ロボット", meaning: "Robot" },
      slang:   { word: "ロム",     reading: "ロム",     meaning: "Lurk" },
      pokemon: { word: "ロコン",   reading: "ロコン",   meaning: "Vulpix" }
    },
    "ワ": {
      common:  { word: "ワイン", reading: "ワイン", meaning: "Wine" },
      slang:   { word: "ワロタ", reading: "ワロタ", meaning: "LOL" },
      pokemon: { word: "ワニノコ", reading: "ワニノコ", meaning: "Totodile" }
    },
    "ヲ": {
      common:  { word: "〜ヲ", reading: "ヲ",  meaning: "Object marker" },
      slang:   { word: "N/A",  reading: "N/A", meaning: "N/A" },
      pokemon: { word: "N/A",  reading: "N/A", meaning: "N/A" }
    },
    "ン": {
      common:  { word: "パン",   reading: "パン",   meaning: "Bread" },
      slang:   { word: "〜ンゴ", reading: "んご",   meaning: "Suffix" },
      pokemon: { word: "サンダース", reading: "サンダース", meaning: "Jolteon" }
    },
    "ガ": {
      common:  { word: "ガス", reading: "ガス", meaning: "Gas" },
      slang:   { word: "ガチ", reading: "ガチ", meaning: "Serious" },
      pokemon: { word: "ガーディ", reading: "ガーディ", meaning: "Growlithe" }
    },
    "ギ": {
      common:  { word: "ギター", reading: "ギター", meaning: "Guitar" },
      slang:   { word: "ギガ",   reading: "ギガ",   meaning: "Data" },
      pokemon: { word: "ギャラドス", reading: "ギャラドス", meaning: "Gyarados" }
    },
    "グ": {
      common:  { word: "グラフ", reading: "グラフ",  meaning: "Graph" },
      slang:   { word: "ググる", reading: "ググ る", meaning: "Google it" },
      pokemon: { word: "グラードン", reading: "グラードン", meaning: "Groudon" }
    },
    "ゲ": {
      common:  { word: "ゲーム", reading: "ゲーム", meaning: "Game" },
      slang:   { word: "ゲス",   reading: "ゲス",   meaning: "Scum" },
      pokemon: { word: "ゲンガー", reading: "ゲンガー", meaning: "Gengar" }
    },
    "ゴ": {
      common:  { word: "ゴルフ", reading: "ゴルフ", meaning: "Golf" },
      slang:   { word: "ゴミ",   reading: "ゴミ",   meaning: "Trash" },
      pokemon: { word: "ゴース", reading: "ゴース", meaning: "Gastly" }
    },
    "ザ": {
      common:  { word: "雑誌",   reading: "ザッシ", meaning: "Magazine" },
      slang:   { word: "ザコ",   reading: "ザコ",   meaning: "Weakling" },
      pokemon: { word: "ザシアン", reading: "ザシアン", meaning: "Zacian" }
    },
    "ジ": {
      common:  { word: "時間",   reading: "ジカン",  meaning: "Time" },
      slang:   { word: "ジワる", reading: "ジワ る", meaning: "Amusing" },
      pokemon: { word: "ジラーチ", reading: "ジラーチ", meaning: "Jirachi" }
    },
    "ズ": {
      common:  { word: "図画",   reading: "ズガ",   meaning: "Drawing" },
      slang:   { word: "ずっと", reading: "ずっと", meaning: "Always" },
      pokemon: { word: "ズバット", reading: "ズバット", meaning: "Zubat" }
    },
    "ゼ": {
      common:  { word: "全部",   reading: "ゼンブ", meaning: "All" },
      slang:   { word: "ゼロ",   reading: "ゼロ",   meaning: "None" },
      pokemon: { word: "ゼクロム", reading: "ゼクロム", meaning: "Zekrom" }
    },
    "ゾ": {
      common:  { word: "ゾーン", reading: "ゾーン", meaning: "Zone" },
      slang:   { word: "〜ゾ",   reading: "ぞ",     meaning: "Assertion" },
      pokemon: { word: "ゾロアーク", reading: "ゾロアーク", meaning: "Zoroark" }
    },
    "ダ": {
      common:  { word: "大学",     reading: "ダイガク",  meaning: "University" },
      slang:   { word: "誰得",     reading: "ダレ トク", meaning: "Who benefits?" },
      pokemon: { word: "ダグトリオ", reading: "ダグトリオ", meaning: "Dugtrio" }
    },
    "デ": {
      common:  { word: "データ", reading: "データ", meaning: "Data" },
      slang:   { word: "デフォ", reading: "デフォ", meaning: "Default" },
      pokemon: { word: "デデンネ", reading: "デデンネ", meaning: "Dedenne" }
    },
    "ド": {
      common:  { word: "ドア",   reading: "ドア",    meaning: "Door" },
      slang:   { word: "ドヤ顔", reading: "ドヤ 顔", meaning: "Smug face" },
      pokemon: { word: "ドドゲザン", reading: "ドドゲザン", meaning: "Kingambit" }
    },
    "バ": {
      common:  { word: "バナナ", reading: "バナナ",  meaning: "Banana" },
      slang:   { word: "バズる", reading: "バズ る", meaning: "Go viral" },
      pokemon: { word: "バクフーン", reading: "バクフーン", meaning: "Typhlosion" }
    },
    "ビ": {
      common:  { word: "ビール", reading: "ビール",  meaning: "Beer" },
      slang:   { word: "微レ存", reading: "ビレゾン", meaning: "Tiny chance" },
      pokemon: { word: "ビッパ",  reading: "ビッパ",  meaning: "Bidoof" }
    },
    "ブ": {
      common:  { word: "豚",     reading: "ブタ",    meaning: "Pig" },
      slang:   { word: "ブヒる", reading: "ブヒ る", meaning: "Obsessing" },
      pokemon: { word: "フシギバナ", reading: "フシギバナ", meaning: "Venusaur" }
    },
    "ベ": {
      common:  { word: "ベッド", reading: "ベッド", meaning: "Bed" },
      slang:   { word: "ベタ",   reading: "ベタ",   meaning: "Cliche" },
      pokemon: { word: "ベトベター", reading: "ベトベター", meaning: "Grimer" }
    },
    "ボ": {
      common:  { word: "ボタン", reading: "ボタン", meaning: "Button" },
      slang:   { word: "ボッチ", reading: "ボッチ", meaning: "Loner" },
      pokemon: { word: "ボーマンダ", reading: "ボーマンダ", meaning: "Salamence" }
    },
    "パ": {
      common:  { word: "パスタ",   reading: "パスタ",   meaning: "Pasta" },
      slang:   { word: "パニクる", reading: "パニク る", meaning: "Panic" },
      pokemon: { word: "パルキア", reading: "パルキア", meaning: "Palkia" }
    },
    "ピ": {
      common:  { word: "ピアノ", reading: "ピアノ", meaning: "Piano" },
      slang:   { word: "ピエン", reading: "ピエン", meaning: "Sad" },
      pokemon: { word: "ピカチュウ", reading: "ピカチュウ", meaning: "Pikachu" }
    },
    "プ": {
      common:  { word: "プール",   reading: "プール",   meaning: "Pool" },
      slang:   { word: "プギャー", reading: "プギャー", meaning: "Laughing" },
      pokemon: { word: "プリン",   reading: "プリン",   meaning: "Jigglypuff" }
    },
    "ペ": {
      common:  { word: "ページ",   reading: "ページ",   meaning: "Page" },
      slang:   { word: "ペコ",     reading: "ペコ",     meaning: "Hungry" },
      pokemon: { word: "ペリッパー", reading: "ペリッパー", meaning: "Pelipper" }
    },
    "ポ": {
      common:  { word: "ポスト",   reading: "ポスト",   meaning: "Post box" },
      slang:   { word: "ポイ",     reading: "ポイ",     meaning: "Like" },
      pokemon: { word: "ポッチャマ", reading: "ポッチャマ", meaning: "Piplup" }
    }
  }
};
