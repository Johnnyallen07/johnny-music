import json

data = [
  {
    "title": "01. Beethoven Violin Concerto in D Major Op.61 - I. Allegro ma non troppo",
    "title_zh": "01. 贝多芬D大调小提琴协奏曲Op.61 - I. 快板但不过分",
    "artist": "Beethoven",
    "artist_zh": "贝多芬",
    "performer": "Mahler Chamber Orchestra & Pekka Kuusisto",
    "category": "Violin Concerto",
    "category_zh": "小提琴协奏曲",
    "path": "/source/01. 贝多芬D大调小提琴协奏曲Op.61 - I. 快板但不过分 (Mahler Chamber Orchestra & Pekka Kuusisto).mp3"
  },
  {
    "title": "02. Beethoven Violin Concerto in D Major Op.61 - II. Larghetto",
    "title_zh": "02. 贝多芬D大调小提琴协奏曲Op.61 - II. 甚缓板",
    "artist": "Beethoven",
    "artist_zh": "贝多芬",
    "performer": "Mahler Chamber Orchestra & Pekka Kuusisto",
    "category": "Violin Concerto",
    "category_zh": "小提琴协奏曲",
    "path": "/source/02. 贝多芬D大调小提琴协奏曲Op.61 - II. 甚缓板 (Mahler Chamber Orchestra & Pekka Kuusisto).mp3"
  },
  {
    "title": "03. Beethoven Violin Concerto in D Major Op.61 - III. Rondo",
    "title_zh": "03. 贝多芬D大调小提琴协奏曲Op.61 - III. 回旋曲",
    "artist": "Beethoven",
    "artist_zh": "贝多芬",
    "performer": "Mahler Chamber Orchestra & Pekka Kuusisto",
    "category": "Violin Concerto",
    "category_zh": "小提琴协奏曲",
    "path": "/source/03. 贝多芬D大调小提琴协奏曲Op.61 - III. 回旋曲 (Mahler Chamber Orchestra & Pekka Kuusisto).mp3"
  },
  {
    "title": "01. Bach Violin Concerto in A Minor BWV1041 - I. Allegro",
    "title_zh": "01. 巴赫a小调小提琴协奏曲BWV1041 - I. 快板",
    "artist": "Bach",
    "artist_zh": "巴赫",
    "performer": "Hilary Hahn",
    "category": "Violin Concerto",
    "category_zh": "小提琴协奏曲",
    "path": "/source/01. 巴赫a小调小提琴协奏曲BWV1041 - I. 快板 (Hilary Hahn).mp3"
  },
  {
    "title": "02. Bach Violin Concerto in A Minor BWV1041 - II. Andante",
    "title_zh": "02. 巴赫a小调小提琴协奏曲BWV1041 - II. 行板",
    "artist": "Bach",
    "artist_zh": "巴赫",
    "performer": "Hilary Hahn",
    "category": "Violin Concerto",
    "category_zh": "小提琴协奏曲",
    "path": "/source/02. 巴赫a小调小提琴协奏曲BWV1041 - II. 行板 (Hilary Hahn).mp3"
  },
  {
    "title": "03. Bach Violin Concerto in A Minor BWV1041 - III. Allegro",
    "title_zh": "03. 巴赫a小调小提琴协奏曲BWV1041 - III. 快板",
    "artist": "Bach",
    "artist_zh": "巴赫",
    "performer": "Hilary Hahn",
    "category": "Violin Concerto",
    "category_zh": "小提琴协奏曲",
    "path": "/source/03. 巴赫a小调小提琴协奏曲BWV1041 - III. 快板 (Hilary Hahn).mp3"
  },
  {
    "title": "01. Mendelssohn Violin Concerto in E Minor Op.64 - I. Allegro molto appassionato",
    "title_zh": "01. 门德尔松e小调协奏曲Op.64 - I. 热情的快板",
    "artist": "Mendelssohn",
    "artist_zh": "门德尔松",
    "performer": "Itzhak Perlman",
    "category": "Violin Concerto",
    "category_zh": "小提琴协奏曲",
    "path": "/source/01. 门德尔松e小调协奏曲Op.64 - I. 热情的快板 (Itzhak Perlman).mp3"
  },
  {
    "title": "02. Mendelssohn Violin Concerto in E Minor Op.64 - II. Andante",
    "title_zh": "02. 门德尔松e小调协奏曲Op.64 - II. 行板",
    "artist": "Mendelssohn",
    "artist_zh": "门德尔松",
    "performer": "Itzhak Perlman",
    "category": "Violin Concerto",
    "category_zh": "小提琴协奏曲",
    "path": "/source/02. 门德尔松e小调协奏曲Op.64 - II. 行板 (Itzhak Perlman).mp3"
  },
  {
    "title": "03. Mendelssohn Violin Concerto in E Minor Op.64 - III. Allegro molto vivace",
    "title_zh": "03. 门德尔松e小调协奏曲Op.64 - III. 活泼的快板",
    "artist": "Mendelssohn",
    "artist_zh": "门德尔松",
    "performer": "Itzhak Perlman",
    "category": "Violin Concerto",
    "category_zh": "小提琴协奏曲",
    "path": "/source/03. 门德尔松e小调协奏曲Op.64 - III. 活泼的快板 (Itzhak Perlman).mp3"
  },
  {
    "title": "01. Rachmaninoff Piano Concerto No. 2 Op.18 - I. Moderato",
    "title_zh": "01. 拉赫玛尼诺夫第2钢琴协奏曲Op.18 - I. 中板",
    "artist": "Rachmaninoff",
    "artist_zh": "拉赫玛尼诺夫",
    "performer": "Kissin & Chung",
    "category": "Piano Concerto",
    "category_zh": "钢琴协奏曲",
    "path": "/source/01. 拉赫玛尼诺夫第2钢琴协奏曲Op.18 - I. 中板 (Kissin & Chung).mp3"
  },
  {
    "title": "02. Rachmaninoff Piano Concerto No. 2 Op.18 - II. Adagio sostenuto",
    "title_zh": "02. 拉赫玛尼诺夫第2钢琴协奏曲Op.18 - II. 舒缓的柔板",
    "artist": "Rachmaninoff",
    "artist_zh": "拉赫玛尼诺夫",
    "performer": "Kissin & Chung",
    "category": "Piano Concerto",
    "category_zh": "钢琴协奏曲",
    "path": "/source/02. 拉赫玛尼诺夫第2钢琴协奏曲Op.18 - II. 舒缓的柔板 (Kissin & Chung).mp3"
  },
  {
    "title": "03. Rachmaninoff Piano Concerto No. 2 Op.18 - III. Allegro scherzando",
    "title_zh": "03. 拉赫玛尼诺夫第2钢琴协奏曲Op.18 - III. 诙谐的快板",
    "artist": "Rachmaninoff",
    "artist_zh": "拉赫玛尼诺夫",
    "performer": "Kissin & Chung",
    "category": "Piano Concerto",
    "category_zh": "钢琴协奏曲",
    "path": "/source/03. 拉赫玛尼诺夫第2钢琴协奏曲Op.18 - III. 诙谐的快板 (Kissin & Chung).mp3"
  },
  {
    "title": "01. Rachmaninoff Piano Concerto No. 3 Op.30 - I. Allegro ma non tanto",
    "title_zh": "01. 拉赫玛尼诺夫第3钢琴协奏曲Op.30 - I. 不太快的快板",
    "artist": "Rachmaninoff",
    "artist_zh": "拉赫玛尼诺夫",
    "performer": "Yuja Wang",
    "category": "Piano Concerto",
    "category_zh": "钢琴协奏曲",
    "path": "/source/01. 拉赫玛尼诺夫第3钢琴协奏曲Op.30 - I. 不太快的快板 (Yuja Wang).mp3"
  },
  {
    "title": "02. Rachmaninoff Piano Concerto No. 3 Op.30 - II. Intermezzo",
    "title_zh": "02. 拉赫玛尼诺夫第3钢琴协奏曲Op.30 - II. 间奏曲",
    "artist": "Rachmaninoff",
    "artist_zh": "拉赫玛尼诺夫",
    "performer": "Yuja Wang",
    "category": "Piano Concerto",
    "category_zh": "钢琴协奏曲",
    "path": "/source/02. 拉赫玛尼诺夫第3钢琴协奏曲Op.30 - II. 间奏曲 (Yuja Wang).mp3"
  },
  {
    "title": "03. Rachmaninoff Piano Concerto No. 3 Op.30 - III. Finale",
    "title_zh": "03. 拉赫玛尼诺夫第3钢琴协奏曲Op.30 - III. 终曲",
    "artist": "Rachmaninoff",
    "artist_zh": "拉赫玛尼诺夫",
    "performer": "Yuja Wang",
    "category": "Piano Concerto",
    "category_zh": "钢琴协奏曲",
    "path": "/source/03. 拉赫玛尼诺夫第3钢琴协奏曲Op.30 - III. 终曲 (Yuja Wang).mp3"
  },
  {
    "title": "Salut d'Amour",
    "title_zh": "Salut d'Amour",
    "artist": "Elgar",
    "artist_zh": "埃尔加",
    "performer": "Esther Abrami & Iyad Sughayer",
    "category": "Violin + Piano Duet",
    "category_zh": "小提琴 + 钢琴合奏",
    "path": "/source/Salut d'Amour (Esther Abrami & Iyad Sughayer).mp3"
  },
  {
    "title": "01. Vivaldi Violin Concerto No. 1 Op.8 Spring",
    "title_zh": "01. 维瓦尔第第1小提琴协奏曲Op.8 春",
    "artist": "Vivaldi",
    "artist_zh": "维瓦尔第",
    "performer": "Gabor Szabo",
    "category": "Violin Concerto",
    "category_zh": "小提琴协奏曲",
    "path": "/source/01. 维瓦尔第第1小提琴协奏曲Op.8 春 (Gabor Szabo).mp3"
  },
  {
    "title": "02. Vivaldi Violin Concerto No. 2 Op.8 Summer",
    "title_zh": "02. 维瓦尔第第2小提琴协奏曲Op.8 夏",
    "artist": "Vivaldi",
    "artist_zh": "维瓦尔第",
    "performer": "Gabor Szabo",
    "category": "Violin Concerto",
    "category_zh": "小提琴协奏曲",
    "path": "/source/02. 维瓦尔第第2小提琴协奏曲Op.8 夏 (Gabor Szabo).mp3"
  },
  {
    "title": "03. Vivaldi Violin Concerto No. 3 Op.8 Autumn",
    "title_zh": "03. 维瓦尔第第3小提琴协奏曲Op.8 秋",
    "artist": "Vivaldi",
    "artist_zh": "维瓦尔第",
    "performer": "Gabor Szabo",
    "category": "Violin Concerto",
    "category_zh": "小提琴协奏曲",
    "path": "/source/03. 维瓦尔第第3小提琴协奏曲Op.8 秋 (Gabor Szabo).mp3"
  },
  {
    "title": "04. Vivaldi Violin Concerto No. 4 Op.8 Winter",
    "title_zh": "04. 维瓦尔第第4小提琴协奏曲Op.8 冬",
    "artist": "Vivaldi",
    "artist_zh": "维瓦尔第",
    "performer": "Gabor Szabo",
    "category": "Violin Concerto",
    "category_zh": "小提琴协奏曲",
    "path": "/source/04. 维瓦尔第第4小提琴协奏曲Op.8 冬 (Gabor Szabo).mp3"
  },
  {
    "title": "01. Sibelius Violin Concerto No. 1 Op.47 - I. Allegro moderato",
    "title_zh": "01. 西贝柳斯第1小提琴协奏曲Op.47 - I. 中速的快板",
    "artist": "Sibelius",
    "artist_zh": "西贝柳斯",
    "performer": "Vengerov & Barenboim",
    "category": "Violin Concerto",
    "category_zh": "小提琴协奏曲",
    "path": "/source/01. 西贝柳斯第1小提琴协奏曲Op.47 - I. 中速的快板 (Vengerov & Barenboim).mp3"
  },
  {
    "title": "02. Sibelius Violin Concerto No. 1 Op.47 - II. Adagio di molto",
    "title_zh": "02. 西贝柳斯第1小提琴协奏曲Op.47 - II. 甚缓板",
    "artist": "Sibelius",
    "artist_zh": "西贝柳斯",
    "performer": "Vengerov & Barenboim",
    "category": "Violin Concerto",
    "category_zh": "小提琴协奏曲",
    "path": "/source/02. 西贝柳斯第1小提琴协奏曲Op.47 - II. 甚缓板 (Vengerov & Barenboim).mp3"
  },
  {
    "title": "03. Sibelius Violin Concerto No. 1 Op.47 - III. Allegro ma non tanto",
    "title_zh": "03. 西贝柳斯第1小提琴协奏曲Op.47 - III. 不太快的快板",
    "artist": "Sibelius",
    "artist_zh": "西贝柳斯",
    "performer": "Vengerov & Barenboim",
    "category": "Violin Concerto",
    "category_zh": "小提琴协奏曲",
    "path": "/source/03. 西贝柳斯第1小提琴协奏曲Op.47 - III. 不太快的快板 (Vengerov & Barenboim).mp3"
  },
  {
    "title": "01. Tchaikovsky Violin Concerto No. 1 Op.35 - I. Allegro moderato",
    "title_zh": "01. 柴可夫斯基第1小提琴协奏曲Op.35 - I. 中速的快板",
    "artist": "Tchaikovsky",
    "artist_zh": "柴可夫斯基",
    "performer": "Joshua Bell",
    "category": "Violin Concerto",
    "category_zh": "小提琴协奏曲",
    "path": "/source/01. 柴可夫斯基第1小提琴协奏曲Op.35 - I. 中速的快板 (Joshua Bell).mp3"
  },
  {
    "title": "02. Tchaikovsky Violin Concerto No. 1 Op.35 - II. Canzonetta: Andante",
    "title_zh": "02. 柴可夫斯基第1小提琴协奏曲Op.35 - II. 小歌：行板",
    "artist": "Tchaikovsky",
    "artist_zh": "柴可夫斯基",
    "performer": "Joshua Bell",
    "category": "Violin Concerto",
    "category_zh": "小提琴协奏曲",
    "path": "/source/02. 柴可夫斯基第1小提琴协奏曲Op.35 - II. 小歌：行板 (Joshua Bell).mp3"
  },
  {
    "title": "03. Tchaikovsky Violin Concerto No. 1 Op.35 - III. Finale: Allegro vivacissimo",
    "title_zh": "03. 柴可夫斯基第1小提琴协奏曲Op.35 - III. 终曲：活泼的快板",
    "artist": "Tchaikovsky",
    "artist_zh": "柴可夫斯基",
    "performer": "Joshua Bell",
    "category": "Violin Concerto",
    "category_zh": "小提琴协奏曲",
    "path": "/source/03. 柴可夫斯基第1小提琴协奏曲Op.35 - III. 终曲：活泼的快板 (Joshua Bell).mp3"
  },
  {
    "title": "Octopath Traveler 2 - The Wildlands Night",
    "title_zh": "Octopath Traveler 2 - The Wildlands Night",
    "artist": "N/A",
    "artist_zh": "N/A",
    "performer": "N/A",
    "category": "Game BGM",
    "category_zh": "游戏BGM",
    "path": "/source/Octopath Traveler 2 - The Wildlands Night.mp3"
  }
]

import json
import uuid

# ... (data list omitted for brevity, assuming it's defining 'data' variable) ...
# Please ensure the 'data' list definition is preserved before this block if re-writing the whole file. 
# However, for this tool, I will assume I am replacing the logic at the end.

# Generate IDs for each item
for item in data:
    # Use path as namespace for reproducibility if needed, or just random UUID
    # Here using random UUID for simplicity as requested, but a stable ID based on path might be better for updates?
    # Let's use a stable UUID based on path to avoid changing IDs on every run if we were to re-run it.
    item['id'] = str(uuid.uuid5(uuid.NAMESPACE_URL, item['path']))
    
    # Ensure no count in music-info
    if 'count' in item:
        del item['count']

# Separate counts (initially 0)
music_counts = {item['id']: 0 for item in data}

# Write music-info.json
with open('/Users/johnny/.gemini/antigravity/brain/0599cacb-b58e-489e-82de-54eee84494a3/music-info.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Write music-count.json
with open('/Users/johnny/.gemini/antigravity/brain/0599cacb-b58e-489e-82de-54eee84494a3/music-count.json', 'w', encoding='utf-8') as f:
    json.dump(music_counts, f, ensure_ascii=False, indent=2)
