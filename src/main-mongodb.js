// 这是 main.js 的 MongoDB 版本修改说明
// 由于原文件较大，这里提供关键替换代码
// 实际使用时，请将以下替换应用到 main.js 中

// ============================================
// 替换 1: Logout 函数 (约第 231 行)
// ============================================
// 原代码:
function Logout() {
    AV.User.logOut();
    location.reload();
}

// 替换为:
function Logout() {
    if (typeof atAPI !== 'undefined') {
        atAPI.logout();
    }
    location.reload();
}

// ============================================
// 替换 2: 删除 AV.init 调用 (约第 641, 647 行)
// ============================================
// 原代码:
try {
    if (serverURL !== '') {
        AV.init({
            appId: appId,
            appKey: appKey,
            serverURL: serverURL,
        });
    } else {
        AV.init({
            appId: appId,
            appKey: appKey,
        });
    }
}
catch (error) {
    // ...
}

// 替换为:
// 初始化已通过 api-client.js 完成，删除整个 try-catch 块
// 或者保留错误处理但删除 AV.init 调用

// ============================================
// 替换 3: 登录函数 (约第 900 行)
// ============================================
// 原代码:
AV.User.logIn(userName, passWord).then((user) => {
    document.getElementById("ccontent").innerHTML = "";
    document.getElementById("neirong").value = "";
    fadeIn('lazy');
    root.seeContent(0, root.config);
    Hide();
    onLogin(userName);
}, (error) => {
    let errLogin = error.message;
    document.getElementById('logw').style.color = 'red';
    if (errLogin.indexOf('mismatch') != -1) {
        errLogin = text43;
    } else if (errLogin.indexOf('terminated') != -1) {
        errLogin = text44;
    } else if (errLogin.indexOf('Could not find user.') != -1) {
        errLogin = text45;
    } else if (errLogin.indexOf('Please try later or reset your password.') != -1) {
        errLogin = text46;
    }
    document.getElementById('logw').innerHTML = errLogin;
});

// 替换为:
atAPI.login(userName, passWord).then((data) => {
    let user = data.user;
    document.getElementById("ccontent").innerHTML = "";
    document.getElementById("neirong").value = "";
    fadeIn('lazy');
    root.seeContent(0, root.config);
    Hide();
    onLogin(userName);
}).catch((error) => {
    let errLogin = error.message || 'Login failed';
    document.getElementById('logw').style.color = 'red';
    if (errLogin.indexOf('mismatch') != -1 || errLogin.indexOf('Invalid credentials') != -1) {
        errLogin = text43;
    } else if (errLogin.indexOf('terminated') != -1) {
        errLogin = text44;
    } else if (errLogin.indexOf('Could not find user') != -1 || errLogin.indexOf('not found') != -1) {
        errLogin = text45;
    }
    document.getElementById('logw').innerHTML = errLogin;
});

// ============================================
// 替换 4: 获取当前用户 (多处 AV.User.current())
// ============================================
// 原代码:
let currentUser = AV.User.current();

// 替换为:
let currentUser = atAPI.getCurrentUser();

// ============================================
// 替换 5: 创建说说 (约第 1014 行)
// ============================================
// 原代码:
let artitalkObject = AV.Object.extend('shuoshuo');
let atObject = new artitalkObject();
let shuoshuoContentMd = shuoshuoContent;
atObject.set('atContentMd', shuoshuoContentMd);
shuoshuoContent = translate(shuoshuoContent);
let converte = new showdown.Converter();
converte.setOption('strikethrough', 1);
let shuoshuoContentHtml = converte.makeHtml(shuoshuoContent);
let atAvatar = typeof (currentUser.attributes.img) === "undefined" ? "https://fastly.jsdelivr.net/gh/drew233/cdn/logol.png" : currentUser.attributes.img;
let userClient = new Client();
let userOs = userClient.system.name;
atObject.set('atContentHtml', shuoshuoContentHtml);
atObject.set('userOs', userOs);
atObject.set('avatar', atAvatar);
fadeIn('lazy');
atObject.save().then(function (res) {
    document.getElementById("ccontent").innerHTML = "";
    document.getElementById("neirong").value = "";
    fadeOut('preview');
    root.seeContent(0, root.config);
    fadeOut('shuoshuo_input');
    onShuoPublished(currentUser.attributes.username, shuoshuoContent);
});

// 替换为:
let shuoshuoContentMd = shuoshuoContent;
shuoshuoContent = translate(shuoshuoContent);
let converte = new showdown.Converter();
converte.setOption('strikethrough', 1);
let shuoshuoContentHtml = converte.makeHtml(shuoshuoContent);
let atAvatar = currentUser && currentUser.img ? currentUser.img : "https://fastly.jsdelivr.net/gh/drew233/cdn/logol.png";
let userClient = new Client();
let userOs = userClient.system.name;
fadeIn('lazy');
atAPI.createShuoshuo({
    atContentMd: shuoshuoContentMd,
    atContentHtml: shuoshuoContentHtml,
    userOs: userOs,
    avatar: atAvatar
}).then(function (res) {
    document.getElementById("ccontent").innerHTML = "";
    document.getElementById("neirong").value = "";
    fadeOut('preview');
    root.seeContent(0, root.config);
    fadeOut('shuoshuo_input');
    onShuoPublished(currentUser.username, shuoshuoContent);
});

// ============================================
// 替换 6: 删除说说 (约第 1116 行)
// ============================================
// 原代码:
const deletes = AV.Object.createWithoutData('shuoshuo', id);
deletes.destroy().then(function (success) {
    fadeIn('shade');
    fadeIn('shanchu');
}, function (error) {
    console.log(error.rawMessage);
});

// 替换为:
atAPI.deleteShuoshuo(id).then(function (success) {
    fadeIn('shade');
    fadeIn('shanchu');
}).catch(function (error) {
    console.log(error.message);
});

// ============================================
// 替换 7: 查询说说列表 (约第 1424 行)
// ============================================
// 原代码:
let query = new AV.Query('shuoshuo');
let shuoNum = 0;
query.descending('createdAt');
query.limit(pageSize);
query.skip(pageSize * pageNum);
query.find().then(function (shuoContent) {
    // ... 处理结果
});

// 替换为:
let shuoNum = 0;
atAPI.getShuoshuoList(pageNum, pageSize).then(function (shuoContent) {
    // ... 处理结果 (注意: 返回的数据格式与 LeanCloud 略有不同)
    // shuoContent 数组中的每个元素格式:
    // {
    //   id: '...',
    //   attributes: { atContentMd, atContentHtml, userOs, avatar },
    //   createdAt: '...',
    //   user: { username, img }
    // }
});

// ============================================
// 替换 8: 获取评论数量 (约第 1635 行)
// ============================================
// 原代码:
let countQuery = new AV.Query('atComment');
let id = count.id;
countQuery.equalTo('atId', id);
countQuery.descending('createdAt');
countQuery.find().then(res => {
    let countId = 'coValue' + id;
    document.getElementById(countId).innerHTML = res.length;
});

// 替换为:
let id = count.id;
atAPI.getCommentCount(id).then(count => {
    let countId = 'coValue' + id;
    document.getElementById(countId).innerHTML = count;
});

// ============================================
// 替换 9: 编辑说说查询 (约第 1669 行)
// ============================================
// 原代码:
let queryEdit = new AV.Query('shuoshuo');
queryEdit.equalTo('objectId', id);
queryEdit.find().then(res => {
    res.forEach(function (atom) {
        // ...
        document.getElementById('neirong').value = atom.attributes.atContentMd;
        // ...
    });
});

// 替换为:
atAPI.getShuoshuo(id).then(res => {
    // ...
    document.getElementById('neirong').value = res.attributes.atContentMd;
    // ...
});

// ============================================
// 替换 10: 更新说说 (约第 1748 行)
// ============================================
// 原代码:
let atEditOver = AV.Object.createWithoutData('shuoshuo', id);
atEditOver.set('atContentMd', shuoshuoContentMd);
// ...
atEditOver.save().then(function (res) {
    // ...
});

// 替换为:
atAPI.updateShuoshuo(id, {
    atContentMd: shuoshuoContentMd,
    atContentHtml: shuoshuoContentHtml
}).then(function (res) {
    // ...
});

// ============================================
// 替换 11: 创建评论 (约第 1821 行)
// ============================================
// 原代码:
let comment = AV.Object.extend('atComment');
let atComment = new comment();
// ... 设置属性 ...
atComment.set('atId', id);
atComment.set('content', commentContent);
atComment.set('nickname', nickname);
atComment.set('email', email);
atComment.save().then(function (res) {
    // ...
});

// 替换为:
atAPI.createComment({
    atId: id,
    content: commentContent,
    nickname: nickname,
    email: email,
    avatar: ''
}).then(function (res) {
    // ...
});

// ============================================
// 替换 12: 查询评论 (约第 2017 行)
// ============================================
// 原代码:
let commentQuery = new AV.Query('atComment');
// ...
commentQuery.find().then(res => {
    // ...
});

// 替换为:
atAPI.getComments(atId).then(res => {
    // ...
});

// ============================================
// 替换 13: 获取 imgToken (约第 1196 行)
// ============================================
// 原代码:
let imgToken = AV.User.current().attributes.imgToken;

// 替换为:
let currentUser = atAPI.getCurrentUser();
let imgToken = currentUser ? currentUser.imgToken : undefined;
