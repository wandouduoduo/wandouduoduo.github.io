const ap = new APlayer({
    container: document.getElementById('aplayer'),
    fixed: true,
    autoplay: false,
    audio: [
	   {
        name: "还有多少个十年",
        artist: '沈宁',
        url: 'https://cdn.jsdelivr.net/gh/wandouduoduo/wandouduoduo.github.io@v1.0/dist/audio/还有多少个十年.mp3',
        cover: 'https://cdn.jsdelivr.net/gh/wandouduoduo/wandouduoduo.github.io@v1.0/dist/images/还有多少个十年.jpg',
      },
      {
        name: '麻雀',
        artist: '李荣浩',
        url: 'https://cdn.jsdelivr.net/gh/wandouduoduo/wandouduoduo.github.io@v1.0/dist/audio/%E9%BA%BB%E9%9B%80.mp3',
        cover: 'https://cdn.jsdelivr.net/gh/wandouduoduo/wandouduoduo.github.io@v1.0/dist/images/%E9%BA%BB%E9%9B%80.jpg',
      },
      {
        name: '我们的时光',
        artist: '赵雷',
        url: 'https://cdn.jsdelivr.net/gh/wandouduoduo/wandouduoduo.github.io@v1.0/dist/audio/我们的时光.mp3',
        cover: 'https://cdn.jsdelivr.net/gh/wandouduoduo/wandouduoduo.github.io@v1.0/dist/images/我们的时光.jpg',
      },
      {
        name: '用力活着',
        artist: '张茜',
        url: 'https://cdn.jsdelivr.net/gh/wandouduoduo/wandouduoduo.github.io@v1.0/dist/audio/用力活着.mp3',
        cover: 'https://cdn.jsdelivr.net/gh/wandouduoduo/wandouduoduo.github.io@v1.0/dist/images/用力活着.jpg',
      }
    ]
});