const ap = new APlayer({
    container: document.getElementById('aplayer'),
    fixed: true,
    autoplay: false,
    audio: [
	   {
        name: "还有多少个十年",
        artist: '沈宁',
        url: 'https://wandouduoduo.github.io/dist/audio/%E8%BF%98%E6%9C%89%E5%A4%9A%E5%B0%91%E4%B8%AA%E5%8D%81%E5%B9%B4.mp3',
        cover: 'https://wandouduoduo.github.io/dist/images/%E8%BF%98%E6%9C%89%E5%A4%9A%E5%B0%91%E4%B8%AA%E5%8D%81%E5%B9%B4.jpg',
      },
      {
        name: '麻雀',
        artist: '李荣浩',
        url: 'https://wandouduoduo.github.io/dist/audio/%E9%BA%BB%E9%9B%80.mp3',
        cover: 'https://wandouduoduo.github.io/dist/images/%E9%BA%BB%E9%9B%80.jpg',
      }
    ]
});