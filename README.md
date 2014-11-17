evernoteTask

author : 张兆鑫
2014.11.17
================

step1：

将config.json中的developerToken 和 userName（为sandbox.evernote.com中显示的用户名） 替换掉

step2：

进入evernoteTask目录 输入 node app.js

程序将运行在本地3000端口

在浏览器中输入127.0.0.1:3000 将看到index页面


因为时间问题没有做瀑布流形式的异步请求 ， 考虑到加载时间问题， 暂时只读取了最多20条notes ,加载文章页的时候可能会有些慢==

整个网页通过node的handlebars的module后端渲染

路由和一些使用的中间件在app.js中

后端的js代码放在jsRoutes的目录中

在我做测试的过程中发现一些暂时没办法解决的bug和问题放在 Qes.md 的文件里

因为我用的linux下sublime输入不了中文，所以注释是用英文的。。   ==英文一般 ， 请见谅

谢谢您~ ^^





