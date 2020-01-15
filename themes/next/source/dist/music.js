const ap = new APlayer({
    container: document.getElementById('aplayer'),
    fixed: true,
    autoplay: false,
    audio: [
	  {
        name: "还有多少个十年",
        artist: '沈宁',
        url: 'https://sharefs.yun.kugou.com/202001151822/00a386107bb3e5241828022fe8dbe9bf/G132/M02/05/19/ZJQEAFsOd6uANsw6AD2nhw2_pP8577.mp3',
        cover: 'http://p2.music.126.net/W0iLDEeY8bjpYVcNT0Mr2g==/17787899114524329.jpg?param=130y130',
      },
	  {
        name: '我们的时光',
        artist: '赵雷',
        url: 'https://sharefs.yun.kugou.com/202001151809/90e984e1761d4b0b2ae4acac7c09c0d0/G010/M02/11/0D/qoYBAFUPHm2AQpDiAEGgyuaBG10838.mp3',
        cover: 'http://p1.music.126.net/PJNV84mjt_mDXEkxtjzB4w==/18957779486268444.jpg?param=130y130',
      },
    {
        name: '麻雀',
        artist: '李荣浩',
        url: 'https://sharefs.yun.kugou.com/202001151807/d1d2b9ba55bba79437e9eb779debb476/G179/M06/09/04/U4cBAF3npDGAUGH5AD24_UK8ED0597.mp3',
        cover: 'http://p2.music.126.net/TzlSVBiNtpRD2b7MT2Hi-w==/109951164527590793.jpg?param=130y130',
      }  
    ]
});