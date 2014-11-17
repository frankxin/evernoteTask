** 当我的储存的笔记是从其他的账户笔记拷贝来的，那通过接口传到我这里的内容的图片不再是<en-media>
  而是<img>,此是的图片储存路径不再是我的标准路径而是一个其他笔记的相对路径
  eg. 这是我正常加dev Token 的路径 https://sandbox.evernote.com/shard/s1/res/e3cdb2c0-edb1-4b89-86cc-f9144ce08d00?     auth=S=s1:U=8fda7:E=150f5a91e69:C=1499df7ef80:P=1cd:A=en-devtoken:V=2:H=1e6f64f806f98280427f8376416f29fc
  
  这是从其他账户拷贝来的笔记的图片路径 https://app.yinxiang.com/shard/s15/res/0aab5894-4b49-4dd4-8a97-9c6c34da75f3/2014-11-04%2015%3A19%3A04%20%E7%9A%84%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE.png?search=Q
  此时当我清除cookie 上面我自己的标准路径依然可以访问，但是下面的路径将不再可以访问。
  我笔记中的“Q&A”那一条就是出bug的笔记，其他笔记都可正常访问图片内容。

**为什么收到的note对象中tagNames显示为null，但是如果通过guid去getTagNames却可以显示


   
