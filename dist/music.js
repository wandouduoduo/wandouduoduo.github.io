const ap = new APlayer({
    container: document.getElementById('aplayer'),
    fixed: true,
    autoplay: false,
    audio: [
	   {
        name: "还有多少个十年",
        artist: '沈宁',
        url: 'audio/还有多少个十年.mp3',
        cover: 'images/还有多少个十年.jpg',
      },
      {
        name: '麻雀',
        artist: '李荣浩',
        url: 'audio/麻雀.mp3',
        cover: 'images/麻雀.jpg',
      }
    ]
});