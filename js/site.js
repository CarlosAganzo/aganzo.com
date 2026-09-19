/* AGANZO.COM site behaviour. Kept out of index.html on purpose. */

(() => {
        const hostname = window.location.hostname.toLowerCase().replace(/^www\./, "");
        const origin = new URLSearchParams(window.location.search).get("from");
        const domain = hostname === "carlosaganzo.com" || origin === "carlosaganzo.com"
          ? "CARLOSAGANZO.COM" : "AGANZO.COM";
        document.querySelector(".brand").textContent = domain;
      })();

;

const translations = {
      en: {
        emailLabel: "Email",
        heroLocation: "MADRID ↔ GREAT BRITAIN",
        pageTitle: "AGANZO.COM — Carlos Aganzo",
        metaDescription: "Carlos Aganzo — software engineering, systems, photography, travel, books, film and music. Personal site at AGANZO.COM.",
        navWork: "Work",
        navOutside: "Outside work",
        navAbout: "About",
        heroTitle: "I build systems.<br>I collect obsessions.",
        heroIntro: "Software engineering leader focused on platforms, identity and distributed systems. Outside work: photography, long walks, travel, film, music and the occasional rabbit hole.",
        personalityNote: "Currently: probably comparing two almost identical things in unnecessary detail.",
        manifesto: "I like things that are built properly: software platforms, cameras, records, films, clothes and travel plans. This occasionally turns a simple purchase into a small research project.",
        workLabel: "WORK",
        workTitle: "Engineering leadership, minus the theatre.",
        workP1: "I work on the less glamorous parts of software that become very glamorous the moment they fail: identity, authentication, shared services, messaging and platform infrastructure.",
        workP2: "My job is mostly about making complicated systems simpler and helping teams make good decisions. I am perfectly comfortable saying “I don’t know”. It is usually faster than pretending.",
        tagPlatform: "Platform",
        tagIdentity: "Identity",
        tagDistributed: "Distributed systems",
        tagManagement: "Engineering management",
        outsideLabel: "OUTSIDE WORK",
        outsideTitle: "Walking, looking, listening.",
        photoTitle: "Photography",
        photoText: "I have no idea how to take photographs. I simply take enough of them that, statistically, one occasionally looks intentional. Small cameras help because they are always there.",
        travelTitle: "Travel",
        travelText: "I have visited 76 countries: across Europe, from Canada to Argentina and Chile, and on to Egypt, China, Japan, Southeast Asia and Australia. Cities, long walks and a camera are recurring themes. I like trips with several chapters and enough time to actually look around.",
        filmTitle: "Film & music",
        filmText: "Too many films, too much music, and strong opinions about both. Melancholy is over-represented.",
        collectionsTitle: "Collections",
        collectionsText: "I collect books — thousands of them. In fact, I can collect just about anything that can be collected. Books are simply the most obvious evidence.",
        aboutLabel: "ABOUT",
        aboutTitle: "Madrid → Great Britain.",
        aboutText: "Castilian by origin, British by prolonged weather exposure. I have spent much of my adult life in Great Britain and still regard Madrid as home in a way that geography does not entirely explain.",
        smallNote: "This site is intentionally small. No newsletter popup. Nobody needs another newsletter.",
        backToTop: "Back to top ↑"
      },
      es: {
        emailLabel: "Correo electrónico",
        heroLocation: "MADRID ↔ GRAN BRETAÑA",
        pageTitle: "AGANZO.COM — Carlos Aganzo",
        metaDescription: "Carlos Aganzo — ingeniería de software, sistemas, fotografía, viajes, libros, cine y música. Web personal en AGANZO.COM.",
        navWork: "Trabajo",
        navOutside: "Fuera del trabajo",
        navAbout: "Sobre mí",
        heroTitle: "Construyo sistemas.<br>Colecciono obsesiones.",
        heroIntro: "Lidero equipos de ingeniería de software centrados en plataformas, identidad y sistemas distribuidos. Fuera del trabajo: fotografía, largas caminatas, viajes, cine, música y alguna que otra madriguera de conejo.",
        personalityNote: "Ahora mismo: probablemente comparando dos cosas casi idénticas con un nivel de detalle innecesario.",
        manifesto: "Me gustan las cosas bien hechas: plataformas de software, cámaras, discos, películas, ropa y planes de viaje. Esto hace que, de vez en cuando, una compra sencilla termine convertida en un pequeño proyecto de investigación.",
        workLabel: "TRABAJO",
        workTitle: "Liderazgo de ingeniería, sin teatro.",
        workP1: "Trabajo en las partes menos vistosas del software, que se vuelven tremendamente importantes en cuanto fallan: identidad, autenticación, servicios compartidos, mensajería e infraestructura de plataforma.",
        workP2: "Mi trabajo consiste sobre todo en simplificar sistemas complicados y ayudar a los equipos a tomar buenas decisiones. No tengo ningún problema en decir «no lo sé». Suele ser más rápido que fingir.",
        tagPlatform: "Plataforma",
        tagIdentity: "Identidad",
        tagDistributed: "Sistemas distribuidos",
        tagManagement: "Gestión de ingeniería",
        outsideLabel: "FUERA DEL TRABAJO",
        outsideTitle: "Caminar, mirar, escuchar.",
        photoTitle: "Fotografía",
        photoText: "No tengo ni idea de hacer fotos. Simplemente hago tantas que, por pura estadística, alguna acaba pareciendo intencionada. Las cámaras pequeñas ayudan porque siempre están a mano.",
        travelTitle: "Viajes",
        travelText: "He visitado 76 países: por toda Europa, de Canadá a Argentina y Chile, pasando por Egipto, China, Japón, el sudeste asiático y Australia. Ciudades, largas caminatas y una cámara son el hilo conductor. Me gustan los viajes con varios capítulos y tiempo para mirar de verdad.",
        filmTitle: "Cine y música",
        filmText: "Demasiadas películas, demasiada música y opiniones bastante firmes sobre ambas. La melancolía está sobrerrepresentada.",
        collectionsTitle: "Colecciones",
        collectionsText: "Colecciono libros: tengo miles. En realidad, puedo coleccionar cualquier cosa que se pueda coleccionar. Los libros son, simplemente, la prueba más evidente.",
        aboutLabel: "SOBRE MÍ",
        aboutTitle: "Madrid → Gran Bretaña.",
        aboutText: "Castellano de origen, británico por exposición prolongada al clima. He pasado buena parte de mi vida adulta en Gran Bretaña y sigo considerando Madrid mi casa de una forma que la geografía no explica del todo.",
        smallNote: "Esta web es pequeña a propósito. Sin popup para una newsletter. Nadie necesita otra newsletter.",
        backToTop: "Volver arriba ↑"
      },
      ja: {
        emailLabel: "メール",
        heroLocation: "マドリード ↔ 英国",
        pageTitle: "AGANZO.COM — カルロス・アガンソ",
        metaDescription: "カルロス・アガンソ — ソフトウェアエンジニアリング、システム、写真、旅、本、映画、音楽。AGANZO.COM の個人サイト。",
        navWork: "仕事",
        navOutside: "仕事以外",
        navAbout: "私について",
        heroTitle: "システムを作る。<br>こだわりを集める。",
        heroIntro: "プラットフォーム、アイデンティティ、分散システムを中心に、ソフトウェアエンジニアリングのチームを率いています。仕事以外では、写真、長い散歩、旅、映画、音楽、そして時々深すぎる寄り道を。",
        personalityNote: "現在：ほとんど同じ二つのものを、必要以上に細かく比較している可能性が高いです。",
        manifesto: "ソフトウェアのプラットフォーム、カメラ、レコード、映画、服、旅の計画。きちんと作られたものが好きです。そのせいで、簡単な買い物が小さな調査プロジェクトになることがあります。",
        workLabel: "仕事",
        workTitle: "演出抜きのエンジニアリング・リーダーシップ。",
        workP1: "普段扱っているのは、目立たないけれど、止まった瞬間に一気に重要になるソフトウェアの領域です。アイデンティティ、認証、共通サービス、メッセージング、そしてプラットフォーム基盤。",
        workP2: "複雑なシステムを少しでも単純にし、チームが良い判断をできるよう支える。それが仕事の中心です。「分からない」と言うことにも抵抗はありません。分かったふりをするより、たいてい早いので。",
        tagPlatform: "プラットフォーム",
        tagIdentity: "アイデンティティ",
        tagDistributed: "分散システム",
        tagManagement: "エンジニアリング管理",
        outsideLabel: "仕事以外",
        outsideTitle: "歩く。見る。聴く。",
        photoTitle: "写真",
        photoText: "写真の撮り方は正直よく分かっていません。ただ大量に撮るので、統計的にはたまに「狙って撮った」ように見える一枚が出ます。小さなカメラならいつでも持ち歩けるので、その確率も少し上がります。",
        travelTitle: "旅",
        travelText: "これまでに76か国を訪れました。ヨーロッパ各地、カナダからアルゼンチンやチリまで、そしてエジプト、中国、日本、東南アジア、オーストラリアへ。街歩き、長い散歩、そしてカメラが旅のお供です。いくつもの章があり、じっくり周りを見る時間もある旅が好きです。",
        filmTitle: "映画と音楽",
        filmText: "映画も音楽も多すぎるほど。そして両方について意見はかなり強めです。メランコリーは少々多め。",
        collectionsTitle: "コレクション",
        collectionsText: "本を集めていて、何千冊も持っています。実のところ、集められるものなら何でもコレクションの対象。本は、そのいちばん分かりやすい証拠です。",
        aboutLabel: "私について",
        aboutTitle: "マドリード → 英国。",
        aboutText: "生まれはカスティーリャ、英国の天気への長年の曝露で少し英国人。大人になってからの人生の多くを英国で過ごしてきました。それでも、地理だけでは説明できない意味で、今もマドリードを故郷だと思っています。",
        smallNote: "このサイトは意図的に小さくしています。ニュースレターのポップアップなし。世の中にニュースレターはもう十分あります。",
        backToTop: "ページ上部へ ↑"
      }
    };

    const additions = {"en": {"workP3": "I lead engineering teams across the UK, Romania, Ukraine and India. My focus is the common ground beneath different products: how people sign in, how services communicate, and how teams build on infrastructure they can trust.", "aboutP2": "I grew up in Madrid and have lived in Great Britain since 2008. I like having both worlds in my life: the place I come from and the place where I have built a different kind of everyday life.", "filmText": "I watch around 200 films a year, a habit that goes back to my teenage years. Paris, Texas, Drive, The Straight Story and The Assassination of Jesse James are good coordinates for my taste. Horror is comfort viewing. Yes, I know how that sounds.", "musicTitle": "Always something playing.", "musicText": "Bowie, Radiohead, Massive Attack, Interpol, Sonic Youth, Queens of the Stone Age and Los Planetas. Then Otis Redding or Neil Young. Electronic music is a big part of the picture too: Aphex Twin, The Chemical Brothers, UNKLE, Thom Yorke, and the worlds of trip-hop and experimental electronics, through to PinkPantheress and DyE. Different sounds, but the songs that stay with me tend to have a little darkness in them. Apparently happiness has weaker replay value.", "travelText": "I have visited 76 countries: across Europe, from Canada to Argentina and Chile, and on to Egypt, China, Japan, Southeast Asia and Australia. Cities, long walks and a camera are recurring themes. I like trips with several chapters and enough time to actually look around.", "collectionsText": "I collect books — thousands of them. Give me categories, variants and a finite checklist and I can probably collect almost anything. Shelves are merely an implementation detail.", "smallNote": "No newsletter popup. Nobody needs another newsletter.", "socialTitle": "Elsewhere on the internet, against my better judgement.", "socialLabel": "FIND ME", "heroIntro": "From Madrid, based in Great Britain since 2008. I lead software engineering teams; outside work I watch too many films, listen to too much music, walk long distances and take a camera almost everywhere.", "filmTitle": "Cinema, in unreasonable quantities."}, "es": {"workP3": "Lidero equipos de ingeniería en Reino Unido, Rumanía, Ucrania e India. Me ocupo de lo que distintos productos tienen en común: cómo acceden los usuarios, cómo se comunican los servicios y cómo construyen los equipos sobre una infraestructura fiable.", "aboutP2": "Crecí en Madrid y vivo en Gran Bretaña desde 2008. Me gusta tener esos dos mundos en mi vida: el lugar del que vengo y aquel en el que he construido otra forma de vivir el día a día.", "filmText": "Veo unas 200 películas al año, una costumbre que arrastro desde la adolescencia. Paris, Texas, Drive, Una historia verdadera y El asesinato de Jesse James sirven para situar mis gustos. El terror me resulta reconfortante. Sí, sé cómo suena.", "musicTitle": "Siempre hay algo sonando.", "musicText": "Bowie, Radiohead, Massive Attack, Interpol, Sonic Youth, Queens of the Stone Age y Los Planetas. Y después Otis Redding o Neil Young. La electrónica también ocupa mucho espacio: Aphex Twin, The Chemical Brothers, UNKLE, Thom Yorke y los mundos del trip-hop y la electrónica experimental, hasta PinkPantheress y DyE. Sonidos distintos, pero las canciones que se quedan conmigo suelen tener algo de oscuridad. Parece que la felicidad tiene menos valor de repetición.", "travelText": "He visitado 76 países: por toda Europa, de Canadá a Argentina y Chile, pasando por Egipto, China, Japón, el sudeste asiático y Australia. Ciudades, largas caminatas y una cámara son el hilo conductor. Me gustan los viajes con varios capítulos y tiempo para mirar de verdad.", "collectionsText": "Colecciono libros: tengo miles. Si me das categorías, variantes y una lista finita, probablemente acabaré coleccionando casi cualquier cosa. Las estanterías son solo un detalle de implementación.", "smallNote": "Sin popup para una newsletter. Nadie necesita otra newsletter.", "socialTitle": "También estoy por internet. A pesar de todo.", "socialLabel": "ENCUÉNTRAME", "heroIntro": "De Madrid, viviendo en Gran Bretaña desde 2008. Dirijo equipos de ingeniería de software; fuera del trabajo veo demasiadas películas, escucho demasiada música, camino distancias largas y llevo una cámara casi a todas partes.", "filmTitle": "Cine en cantidades poco razonables."}, "ja": {"workP3": "英国、ルーマニア、ウクライナ、インドのエンジニアリングチームを率いています。ユーザーのログイン、サービス間の通信、チームが信頼して使える基盤など、複数の製品を支える共通の仕組みが専門です。", "aboutP2": "マドリードで育ち、2008年から英国に住んでいます。自分の原点である場所と、新しい日常を築いた場所。その両方が人生にあることを大切にしています。", "filmText": "年間約200本の映画を観ます。10代から続く習慣です。『パリ、テキサス』『ドライヴ』『ストレイト・ストーリー』『ジェシー・ジェームズの暗殺』は、私の好みをよく表しています。ホラーはむしろ落ち着きます。自分でも変なのは分かっています。", "musicTitle": "いつも、何かが流れている。", "musicText": "デヴィッド・ボウイ、Radiohead、Massive Attack、Interpol、Sonic Youth、Queens of the Stone Age、Los Planetas。そしてオーティス・レディングやニール・ヤング。電子音楽も欠かせません。Aphex Twin、The Chemical Brothers、UNKLE、トム・ヨークから、トリップホップや実験的な電子音楽、PinkPantheress、DyEまで。音は違っても、心に残る曲にはどこか陰りがあります。どうやら幸福はリピート再生に少し弱いらしい。", "travelText": "これまでに76か国を訪れました。ヨーロッパ各地、カナダからアルゼンチンやチリまで、そしてエジプト、中国、日本、東南アジア、オーストラリアへ。街歩き、長い散歩、そしてカメラが旅のお供です。いくつもの章があり、じっくり周りを見る時間もある旅が好きです。", "collectionsText": "本を何千冊も集めています。カテゴリー、バリエーション、有限のチェックリストがあれば、だいたい何でも集められます。本棚は実装上の詳細にすぎません。", "smallNote": "ニュースレターのポップアップなし。世の中にニュースレターはもう十分あります。", "socialTitle": "ネットの別の場所にもいます。なぜか。", "socialLabel": "リンク", "heroIntro": "マドリード出身、2008年から英国暮らし。ソフトウェアエンジニアリングのチームを率いています。仕事以外では映画を見すぎ、音楽を聴きすぎ、長距離を歩き、ほぼどこへでもカメラを持っていきます。", "filmTitle": "映画は、少々やりすぎなくらい。"}};
    Object.keys(additions).forEach(lang => Object.assign(translations[lang], additions[lang]));

    translations.zh = {
      "emailLabel": "电子邮件",
      "heroLocation": "马德里 ↔ 英国",
      "pageTitle": "AGANZO.COM — Carlos Aganzo",
      "metaDescription": "Carlos Aganzo — 软件工程、系统、摄影、旅行、书籍、电影和音乐。AGANZO.COM 个人网站。",
      "navWork": "工作",
      "navOutside": "工作之外",
      "navAbout": "关于我",
      "heroTitle": "我构建系统。<br>我也收集各种执念。",
      "heroIntro": "来自马德里，自 2008 年起生活在英国。我带领软件工程团队；工作之外，我看太多电影、听太多音乐、走很长的路，而且几乎去哪都带着相机。",
      "personalityNote": "目前：很可能正在用完全没必要的细致程度，比较两样几乎一模一样的东西。",
      "manifesto": "我喜欢真正做得好的东西：软件平台、相机、唱片、电影、衣服和旅行计划。于是，一次简单的购买偶尔会变成一个小型研究项目。",
      "workLabel": "工作",
      "workTitle": "工程领导，不演戏。",
      "workP1": "我做的是软件里那些不太光鲜、但一旦出故障就立刻变得极其重要的部分：身份、认证、共享服务、消息传递和平台基础设施。",
      "workP2": "我的工作主要是把复杂系统变简单，并帮助团队做出好的决策。我很乐意说“我不知道”。通常这比假装知道更快。",
      "workP3": "我带领分布在英国、罗马尼亚、乌克兰和印度的工程团队。我的重点是不同产品底层的共同部分：用户如何登录、服务如何通信，以及团队如何在可信赖的基础设施之上构建产品。",
      "tagPlatform": "平台",
      "tagIdentity": "身份",
      "tagDistributed": "分布式系统",
      "tagManagement": "工程管理",
      "outsideLabel": "工作之外",
      "outsideTitle": "走路、观察、倾听。",
      "photoTitle": "摄影",
      "photoText": "我其实不会拍照。只是拍得足够多，所以从统计学上说，偶尔总会有一张看起来像是故意拍成那样的。小相机很有帮助，因为它总能随身带着。",
      "travelTitle": "旅行",
      "travelText": "我去过 76 个国家：遍及欧洲，从加拿大到阿根廷和智利，再到埃及、中国、日本、东南亚和澳大利亚。城市、长距离步行和相机总会反复出现。我喜欢有好几个篇章、也有足够时间真正看看周围的旅行。",
      "filmTitle": "电影，多到有点不讲理。",
      "filmText": "我每年大约看 200 部电影，这个习惯从青少年时期就开始了。《巴黎，德州》《亡命驾驶》《史崔特先生的故事》和《神枪手之死》大概能说明我的口味。恐怖片反而是我的舒适区。对，我知道这听起来有点奇怪。",
      "musicTitle": "总有点什么在播放。",
      "musicText": "Bowie、Radiohead、Massive Attack、Interpol、Sonic Youth、Queens of the Stone Age、Los Planetas，然后是 Otis Redding 或 Neil Young。电子音乐也占很大一块：Aphex Twin、The Chemical Brothers、UNKLE、Thom Yorke，以及 trip-hop、实验电子，再到 PinkPantheress 和 DyE。声音各不相同，但真正留下来的歌通常都带一点阴影。看来快乐的重复播放价值比较低。",
      "collectionsTitle": "收藏",
      "collectionsText": "我收藏书，成千上万本。给我类别、版本差异和一张有限的清单，我大概什么都能收集起来。书架只是实现细节。",
      "aboutLabel": "关于我",
      "aboutTitle": "马德里 → 英国。",
      "aboutText": "出身卡斯蒂利亚，在英国天气里泡得够久，也多少有点英国化。我成年后的大部分时间都生活在英国，但仍然把马德里视为家——这种感觉并不是地理能完全解释的。",
      "aboutP2": "我在马德里长大，自 2008 年起生活在英国。我喜欢人生里同时有这两个世界：一个是我来自的地方，另一个是我建立起另一种日常生活的地方。",
      "smallNote": "没有订阅弹窗。没人还需要另一份 newsletter。",
      "socialTitle": "我也散落在互联网的其他地方。虽然这未必是个好主意。",
      "socialLabel": "找到我",
      "backToTop": "返回顶部 ↑"
    };

    const atlasCopy = {"en":{"atlasLabel":"FIELD NOTES / TRAVEL","atlasTitle":"A wider frame.","atlasIntro":"76 countries, and plenty of reasons to keep going.","atlasVisited":"countries visited","atlasFoot":"Highlighted countries are a selection of my travels, not the complete list of 49.","atlasLegend":"Selected destinations","atlasHint":"Choose a region or a highlighted country.","all":"The whole picture","europe":"Europe","americas":"The Americas","asia":"Asia","africa":"Africa","oceania":"Oceania","allTitle":"Farther than the familiar.","allText":"From Canada to Chile, Iceland to Japan, Egypt to Australia. Travel makes room for different landscapes, different rhythms and a different view through the camera.","europeTitle":"Close to home. Still exploring.","europeText":"Madrid is the starting point; Britain is home. Beyond them: Iceland, the Nordic countries, Mediterranean shores and cities across Europe.","americasTitle":"North to south.","americasText":"Canada and the United States in the north; Argentina and Chile in the south. Two very different ends of a vast part of the map.","asiaTitle":"More than one chapter.","asiaText":"China, Japan, Thailand, Malaysia and Indonesia. In Indonesia alone: Java, Komodo and Borneo, with a camera along for the journey.","africaTitle":"Egypt, on the map.","africaText":"Egypt is part of the journey so far. A small patch of colour on a continent with much more still to explore.","oceaniaTitle":"The other side of the map.","oceaniaText":"Australia belongs in the story too: the journey has stretched well beyond Europe and Asia.","atlasPlaces":"A few places along the way"},"es":{"atlasLabel":"CUADERNO DE VIAJE","atlasTitle":"El mundo, en perspectiva.","atlasIntro":"76 países y muchas razones para seguir.","atlasVisited":"países visitados","atlasFoot":"Los países resaltados son una selección de mis viajes, no la lista completa de los 49.","atlasLegend":"Algunos destinos visitados","atlasHint":"Elige una región o un país resaltado.","all":"El mapa completo","europe":"Europa","americas":"América","asia":"Asia","africa":"África","oceania":"Oceanía","allTitle":"Más allá de lo conocido.","allText":"De Canadá a Chile, de Islandia a Japón, de Egipto a Australia. Viajar deja espacio para otros paisajes, otros ritmos y otra forma de mirar a través de la cámara.","europeTitle":"Cerca de casa. Mucho por explorar.","europeText":"Madrid es el punto de partida; Gran Bretaña, mi hogar. Más allá: Islandia, los países nórdicos, las costas del Mediterráneo y ciudades por toda Europa.","americasTitle":"De norte a sur.","americasText":"Canadá y Estados Unidos al norte; Argentina y Chile al sur. Dos extremos muy distintos de una enorme parte del mapa.","asiaTitle":"Un viaje con varios capítulos.","asiaText":"China, Japón, Tailandia, Malasia e Indonesia. Solo en Indonesia: Java, Komodo y Borneo, con una cámara como compañera de viaje.","africaTitle":"Egipto, en el mapa.","africaText":"Egipto forma parte del camino recorrido. Una pequeña mancha de color en un continente donde queda mucho por explorar.","oceaniaTitle":"Al otro lado del mapa.","oceaniaText":"Australia también forma parte de la historia: los viajes se han extendido mucho más allá de Europa y Asia.","atlasPlaces":"Algunas paradas del camino"},"ja":{"atlasLabel":"旅の記録","atlasTitle":"世界を、もっと広く。","atlasIntro":"訪れた国は76。旅を続ける理由は、まだまだあります。","atlasVisited":"訪れた国","atlasFoot":"色のついた国は旅先の一部です。訪れた76か国すべてを表示しているわけではありません。","atlasLegend":"訪れた国の一部","atlasHint":"地域か、色のついた国を選んでください。","all":"世界を眺める","europe":"ヨーロッパ","americas":"南北アメリカ","asia":"アジア","africa":"アフリカ","oceania":"オセアニア","allTitle":"見慣れた景色の、その先へ。","allText":"カナダからチリへ、アイスランドから日本へ、エジプトからオーストラリアへ。旅は、新しい風景やリズム、カメラ越しの違った視点を与えてくれます。","europeTitle":"身近な場所にも、発見がある。","europeText":"原点はマドリード、暮らしの拠点は英国。その先にはアイスランド、北欧、地中海の海岸、そしてヨーロッパ各地の街があります。","americasTitle":"北から南へ。","americasText":"北のカナダとアメリカ合衆国、南のアルゼンチンとチリ。広大な地図の両端に、まったく違う世界が広がっています。","asiaTitle":"いくつもの章がある旅。","asiaText":"中国、日本、タイ、マレーシア、インドネシア。インドネシアだけでも、ジャワ島、コモド、ボルネオへ。旅にはいつもカメラを。","africaTitle":"地図に残る、エジプト。","africaText":"エジプトも、これまでの旅の一部です。まだ訪れたい場所がたくさんある大陸に、小さな色が加わりました。","oceaniaTitle":"地図の反対側へ。","oceaniaText":"オーストラリアも旅の物語の一部。ヨーロッパやアジアの、さらに先へ。","atlasPlaces":"旅の途中で訪れた場所"}};
    atlasCopy.zh = {
      "atlasLabel": "旅行笔记",
      "atlasTitle": "把视野放宽一点。",
      "atlasIntro": "去过 76 个国家，但清单不知怎么还是很长。",
      "atlasVisited": "去过的国家",
      "atlasFoot": "每个国家只计算一次。欧洲包括微型国家、科索沃和跨洲国家；加勒比海包括 13 个主权国家。面积很小的国家用圆点表示。",
      "atlasLegend": "去过的国家",
      "atlasHint": "选择一个地区或一个高亮国家。",
      "all": "完整地图",
      "europe": "欧洲",
      "americas": "美洲",
      "asia": "亚洲",
      "africa": "非洲",
      "oceania": "大洋洲",
      "allTitle": "去熟悉之外的地方。",
      "allText": "从加拿大到智利，从冰岛到日本，从埃及到澳大利亚。旅行会腾出空间，让人看到不同的风景、不同的节奏，也让相机里的视角变得不同。",
      "europeTitle": "离家不远，也还有很多可看。",
      "europeText": "从冰岛到地中海，欧洲所有国家都去过，包括微型国家、高加索地区和跨洲国家。马德里是起点；英国是家。",
      "americasTitle": "从北到南。",
      "americasText": "加拿大、美国、阿根廷、智利，以及加勒比海全部 13 个主权国家。",
      "asiaTitle": "不止一个篇章。",
      "asiaText": "中国、日本、泰国、马来西亚和印度尼西亚。仅在印度尼西亚，就去了爪哇、科莫多和婆罗洲，相机一路同行。",
      "africaTitle": "摩洛哥和埃及。",
      "africaText": "从摩洛哥到埃及：北非的两个落点，而这片大陆还有太多地方没去。",
      "oceaniaTitle": "地图的另一边。",
      "oceaniaText": "澳大利亚也在旅程里：路线早已越过欧洲和亚洲，延伸到更远的地方。",
      "atlasPlaces": "地图上的国家",
      "travelText": "我去过 76 个国家：欧洲所有国家、加勒比海 13 个主权国家、摩洛哥和埃及、加拿大、美国、阿根廷、智利、中国、日本、东南亚和澳大利亚。我喜欢有好几个篇章的旅行、长距离步行，以及带着相机上路。我也喜欢把行程规划到一个根本没人要求的细致程度。"
    };
    Object.keys(atlasCopy).forEach(lang => Object.assign(translations[lang], atlasCopy[lang]));
    const atlasRegions = {"europe":["AL","AD","AM","AT","AZ","BY","BE","BA","BG","HR","CY","CZ","DK","EE","FI","FR","GE","DE","GR","HU","IS","IE","IT","KZ","XK","LV","LI","LT","LU","MT","MD","MC","ME","NL","MK","NO","PL","PT","RO","RU","SM","RS","SK","SI","ES","SE","CH","TR","UA","GB","VA"],"americas":["CA","US","AR","CL","AG","BS","BB","CU","DM","DO","GD","HT","JM","KN","LC","VC","TT"],"asia":["CN","JP","TH","MY","ID"],"africa":["EG","MA"],"oceania":["AU"]};
    const visitedCountries = [...new Set(Object.values(atlasRegions).flat())];
    const visitedCount = visitedCountries.length;
    const completeAtlasCopy = {"en":{"atlasFoot":"Each country is counted once. Europe includes its microstates, Kosovo and transcontinental countries; the Caribbean includes its 13 sovereign states. Small countries are shown with dots.","atlasLegend":"Countries visited","atlasPlaces":"Countries on the map","europeText":"Every country in Europe, from Iceland to the Mediterranean, including the microstates, the Caucasus and transcontinental countries. Madrid is the starting point; Britain is home.","americasText":"Canada and the United States, Argentina and Chile, and all 13 sovereign states of the Caribbean.","africaTitle":"Morocco and Egypt.","africaText":"From Morocco to Egypt: two stops in North Africa, with much more of the continent still to explore.","travelText":"I have visited {count} countries: every country in Europe, all 13 sovereign states of the Caribbean, Morocco and Egypt, Canada, the United States, Argentina, Chile, China, Japan, Southeast Asia and Australia. I like trips with several chapters, long walks and a camera. I also enjoy planning them to a level nobody asked for.","atlasIntro":"{count} countries, and somehow the list is still long."},"es":{"atlasFoot":"Cada país cuenta una sola vez. Europa incluye sus microestados, Kosovo y los países transcontinentales; el Caribe incluye sus 13 estados soberanos. Los países pequeños se señalan con puntos.","atlasLegend":"Países visitados","atlasPlaces":"Países del mapa","europeText":"Todos los países de Europa, de Islandia al Mediterráneo, incluidos los microestados, el Cáucaso y los países transcontinentales. Madrid es el punto de partida; Gran Bretaña, mi hogar.","americasText":"Canadá y Estados Unidos, Argentina y Chile, y los 13 estados soberanos del Caribe.","africaTitle":"Marruecos y Egipto.","africaText":"De Marruecos a Egipto: dos paradas en el norte de África y mucho continente por explorar.","travelText":"He visitado {count} países: todos los de Europa, los 13 estados soberanos del Caribe, Marruecos y Egipto, Canadá, Estados Unidos, Argentina, Chile, China, Japón, el sudeste asiático y Australia. Me gustan los viajes con varios capítulos, las caminatas largas y una cámara. También planificarlos con un nivel de detalle que nadie me ha pedido.","atlasIntro":"{count} países y, de alguna manera, la lista sigue siendo larga."},"ja":{"atlasFoot":"各国は一度だけ数えています。ヨーロッパには小国家、コソボ、大陸をまたぐ国を、カリブ海には13の主権国家を含みます。小さな国は点で示しています。","atlasLegend":"訪れた国","atlasPlaces":"地図にある国","europeText":"アイスランドから地中海まで、ヨーロッパのすべての国へ。小国家、コーカサス、大陸をまたぐ国も含みます。原点はマドリード、暮らしの拠点は英国です。","americasText":"カナダ、アメリカ合衆国、アルゼンチン、チリ、そしてカリブ海の13の主権国家すべてへ。","africaTitle":"モロッコとエジプト。","africaText":"モロッコからエジプトへ。北アフリカの二つの旅先と、まだ訪れたい場所が広がる大陸。","travelText":"これまでに{count}か国を訪れました。ヨーロッパのすべての国、カリブ海の13の主権国家、モロッコ、エジプト、カナダ、アメリカ合衆国、アルゼンチン、チリ、中国、日本、東南アジア、オーストラリアへ。いくつもの章がある旅、長い散歩、そしてカメラが好きです。誰にも頼まれていないレベルまで計画するのも好きです。","atlasIntro":"訪れた国は{count}。それでも、なぜかリストはまだ長い。"}};
    Object.entries(completeAtlasCopy).forEach(([lang, entries]) => {
      Object.entries(entries).forEach(([key, value]) => {
        const text = value.replaceAll("{count}", String(visitedCount));
        atlasCopy[lang][key] = text;
        translations[lang][key] = text;
      });
    });
    let atlasRegion = "all";
    function renderAtlas() {
      const lang = translations[document.documentElement.lang] ? document.documentElement.lang : "en";
      const words = atlasCopy[lang];
      document.querySelector(".atlas-stat strong").textContent = visitedCount;
      document.querySelector(".atlas-map-top span:last-child").textContent = `01 — ${visitedCount} / ↗`;
      document.getElementById("atlas-detail-title").textContent = words[atlasRegion + "Title"];
      document.getElementById("atlas-detail-text").textContent = words[atlasRegion + "Text"];
      document.getElementById("atlas-region-number").textContent = String(["all", ...Object.keys(atlasRegions)].indexOf(atlasRegion)).padStart(2, "0");
      document.querySelectorAll("[data-atlas-region]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.atlasRegion === atlasRegion)));
      const names = new Intl.DisplayNames([lang], {type: "region"});
      document.querySelectorAll(".atlas-country").forEach(country => {
        country.classList.toggle("is-muted", atlasRegion !== "all" && country.dataset.region !== atlasRegion);
        let title = country.querySelector("title");
        if (!title) { title = document.createElementNS("http://www.w3.org/2000/svg", "title"); country.appendChild(title); }
        title.textContent = names.of(country.dataset.country);
      });
      const countries = atlasRegion === "all" ? visitedCountries : atlasRegions[atlasRegion];
      document.getElementById("atlas-places").replaceChildren(...countries.map(code => {
        const span = document.createElement("span"); span.className = "atlas-place"; span.textContent = names.of(code); return span;
      }));
      document.querySelector(".atlas-map").setAttribute("aria-label", words.atlasLegend);
      document.querySelector(".atlas-filters").setAttribute("aria-label", words.atlasHint);
    }
    document.querySelectorAll("[data-atlas-region]").forEach(button => button.addEventListener("click", () => { atlasRegion = button.dataset.atlasRegion; renderAtlas(); }));
    document.querySelectorAll(".atlas-country").forEach(country => country.addEventListener("click", () => { atlasRegion = country.dataset.region; renderAtlas(); }));

    const metaDescription = document.querySelector('meta[name="description"]');
    const languageButtons = document.querySelectorAll("[data-lang]");

    function setLanguage(lang) {
      const dictionary = translations[lang] || translations.en;

      document.documentElement.lang = lang;
      document.title = dictionary.pageTitle;
      metaDescription.setAttribute("content", dictionary.metaDescription);

      document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.dataset.i18n;
        if (dictionary[key]) element.textContent = dictionary[key];
      });

      document.querySelectorAll("[data-i18n-html]").forEach((element) => {
        const key = element.dataset.i18nHtml;
        if (dictionary[key]) element.innerHTML = dictionary[key];
      });

      languageButtons.forEach((button) => {
        const active = button.dataset.lang === lang;
        button.setAttribute("aria-pressed", String(active));
        button.classList.toggle("active", active);
      });

      renderAtlas();
      try { localStorage.setItem("aganzo-language", lang); } catch {}
    }

    languageButtons.forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.lang));
    });

    document.getElementById("year").textContent = new Date().getFullYear();

    let savedLanguage;
    try { savedLanguage = localStorage.getItem("aganzo-language"); } catch {}
    const browserLanguage = navigator.language.toLowerCase();
    const initialLanguage =
      savedLanguage ||
      (browserLanguage.startsWith("es") ? "es" :
      browserLanguage.startsWith("ja") ? "ja" :
      browserLanguage.startsWith("zh") ? "zh" : "en");


    const portraitSlides = [...document.querySelectorAll(".portrait-photo")];
    const portraitDots = [...document.querySelectorAll(".portrait-dot")];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let portraitIndex = 0;
    let portraitTimer;

    function showPortrait(index) {
      portraitIndex = index;
      portraitSlides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      portraitDots.forEach((dot, i) => {
        const active = i === index;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-pressed", String(active));
      });
    }

    function startPortraitTimer() {
      if (reduceMotion || portraitSlides.length < 2) return;
      clearInterval(portraitTimer);
      portraitTimer = setInterval(() => {
        showPortrait((portraitIndex + 1) % portraitSlides.length);
      }, 4800);
    }

    portraitDots.forEach((dot) => {
      dot.addEventListener("click", () => {
        showPortrait(Number(dot.dataset.slide));
        startPortraitTimer();
      });
    });

    showPortrait(0);
    startPortraitTimer();

    setLanguage(initialLanguage);

;

(() => {
      const trackInput = document.getElementById("spotify-track");
      const reasonInput = document.getElementById("song-reason");
      const preview = document.getElementById("spotify-preview");
      const status = document.getElementById("spotify-status");
      const submit = document.getElementById("song-submit");

      if (!trackInput || !reasonInput || !preview || !status || !submit) return;

      const copy = {
        en: {
          invalid: "That does not look like a Spotify track link.",
          subject: "One song for AGANZO.COM",
          track: "Spotify track",
          reason: "Why this one",
          footer: "Sent from AGANZO.COM, where one song means one song."
        },
        es: {
          invalid: "Eso no parece un enlace a una canción de Spotify.",
          subject: "Una canción para AGANZO.COM",
          track: "Canción de Spotify",
          reason: "Por qué esta",
          footer: "Enviado desde AGANZO.COM, donde una canción significa una canción."
        },
        ja: {
          invalid: "Spotifyの曲リンクではないようです。",
          subject: "AGANZO.COMへの1曲",
          track: "Spotifyの曲",
          reason: "おすすめする理由",
          footer: "AGANZO.COMから送信。1曲と言ったら1曲です。"
        }
      };

      copy.zh = {
        "invalid": "这看起来不像 Spotify 的单曲链接。",
        "subject": "给 AGANZO.COM 的一首歌",
        "track": "Spotify 曲目",
        "reason": "为什么选这首",
        "footer": "来自 AGANZO.COM。说一首，就是一首。"
      };

      let trackId = "";

      function lang() {
        const current = document.documentElement.lang;
        return copy[current] ? current : "en";
      }

      function extractTrackId(value) {
        const trimmed = value.trim();
        const uri = trimmed.match(/^spotify:track:([A-Za-z0-9]{22})$/i);
        if (uri) return uri[1];

        const url = trimmed.match(/^https?:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?track\/([A-Za-z0-9]{22})(?:[?/#].*)?$/i);
        return url ? url[1] : "";
      }

      function syncLanguage() {
        const current = lang();
        reasonInput.placeholder = reasonInput.dataset["placeholder" + current.charAt(0).toUpperCase() + current.slice(1)] || reasonInput.dataset.placeholderEn || "";
        if (trackInput.value.trim() && !trackId) status.textContent = copy[current].invalid;
      }

      function renderTrack() {
        const value = trackInput.value.trim();
        trackId = extractTrackId(value);
        submit.disabled = !trackId;

        if (!value) {
          preview.replaceChildren();
          preview.classList.remove("is-visible");
          status.textContent = "";
          return;
        }

        if (!trackId) {
          preview.replaceChildren();
          preview.classList.remove("is-visible");
          status.textContent = copy[lang()].invalid;
          return;
        }

        status.textContent = "";
        const iframe = document.createElement("iframe");
        iframe.src = "https://open.spotify.com/embed/track/" + encodeURIComponent(trackId) + "?utm_source=generator&theme=0";
        iframe.title = "Spotify track preview";
        iframe.loading = "lazy";
        iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
        preview.replaceChildren(iframe);
        preview.classList.add("is-visible");
      }

      trackInput.addEventListener("input", renderTrack);
      trackInput.addEventListener("paste", () => window.setTimeout(renderTrack, 0));

      submit.addEventListener("click", () => {
        if (!trackId) return;
        const current = lang();
        const t = copy[current];
        const canonical = "https://open.spotify.com/track/" + trackId;
        const reason = reasonInput.value.trim() || "—";
        const body = t.track + ": " + canonical + "\n" + t.reason + ": " + reason + "\n\n" + t.footer;
        window.location.href = "mailto:carlos.aganzo@gmail.com?subject=" + encodeURIComponent(t.subject) + "&body=" + encodeURIComponent(body);
      });

      new MutationObserver(syncLanguage).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
      syncLanguage();
    })();

;

(() => {
      const token = document.querySelector('meta[name="cf-web-analytics-token"]')?.content.trim();
      if (!token) return;
      const beacon = document.createElement("script");
      beacon.defer = true;
      beacon.src = "https://static.cloudflareinsights.com/beacon.min.js";
      beacon.dataset.cfBeacon = JSON.stringify({ token });
      document.body.appendChild(beacon);
    })();
