const ap = new APlayer({
    container: document.getElementById('aplayer'),
    fixed: true,
    autoplay: false,
    audio: [
	  {
        name: "还有多少个十年",
        artist: '沈宁',
        url: 'http://m10.music.126.net/20200115174104/d1ca54236f9cb5d1b1e618b3063fca0f/ymusic/1266/9dd9/a0a5/ff5eb332cbd8f36891c9a8e0e68e47a1.mp3',
        cover: 'http://p2.music.126.net/W0iLDEeY8bjpYVcNT0Mr2g==/17787899114524329.jpg?param=130y130',
      },
	  {
        name: '我们的时光',
        artist: '赵雷',
        url: 'http://m10.music.126.net/20200115175106/6b976e394b71ccde0f2dae06b6c48e75/ymusic/12ca/05c1/e5b7/c58c9f85a602e16983271f86f565f2e4.mp3',
        cover: 'http://p1.music.126.net/PJNV84mjt_mDXEkxtjzB4w==/18957779486268444.jpg?param=130y130',
      }
    ]
});