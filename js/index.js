var turnWheel = {
    rewards: [],                 //奖品
    rewardNames: [],			//转盘奖品名称数组
    colors: [],					//转盘奖品区块对应背景颜色
    rewardCount: [],           //奖品统计信息
    outsideRadius: 360,			//转盘外圆的半径
    textRadius: 280,				//转盘奖品位置距离圆心的距离
    insideRadius: 115,			//转盘内圆的半径
    startAngle: 0,				//开始角度
    images: [],
    bRotate: false				//false:停止;ture:旋转
};


// 处理json
function handleData(data) {
    var tmp = [];
    data.forEach(function (reward) {
        tmp.push(reward.name);
        if (reward.icon !== '') {
            var img = new Image();
            img.src = `./images/${reward.icon}`;
            turnWheel.images[reward.name] = img;
        }
        turnWheel.rewardCount[reward.name] = reward.count;
        while (reward.count > 0) {
            reward.count -= 1;
            turnWheel.rewards.push(reward.name)
        }
        turnWheel.colors.push("#FFF4D7", "#FFFFFF");
    })
    turnWheel.rewardNames = tmp.concat(tmp);
    showRemain();
}

// 抽奖
function lottery() {
    if (turnWheel.bRotate) return; // 正在转动，直接返回
    if (turnWheel.rewards.length === 0) {
        alert("奖品已经抽完了！");
        return;
    }
    turnWheel.bRotate = !turnWheel.bRotate;
    var count = turnWheel.rewards.length;
    var item = randomNum(0, count - 1);// 随机获取奖品的序号(奖品个数范围内)
    var reward = turnWheel.rewards[item];
    turnWheel.rewardCount[reward] -= 1;
    turnWheel.rewards.splice(item, 1);
    var position = turnWheel.rewardNames.findIndex(function (e) {
        return e === reward;
    });
    rotateAnimate(position, turnWheel.rewardNames[item], turnWheel.rewardNames.length);// 开始转动
}

// 获取随机数
function randomNum(n, m) {
    var random = Math.floor(Math.random() * (m + 1 - n)) + n;
    return random;
}

// 旋转动画
function rotateAnimate(item, tip, count) {
    var baseAngle = 360 / count;
    angles = 360 * 3 / 4 - (item * baseAngle) - baseAngle / 2;
    $('#wheelCanvas').stopRotate();
    $('#wheelCanvas').rotate({
        angle: 0,
        animateTo: angles + 360 * 5, // 多转5圈，圈数越多，转的越快
        duration: 8000,
        callback: showRemain
    });
};

// 显示剩余
function showRemain() {
    var all_tr = $(" tr ");
    var info = '';
    all_tr.remove();
    for (reward in turnWheel.rewardCount) {
        info = document.createElement('tr');
        info.innerHTML = `<td class="remain">${reward}剩余:</td>&nbsp<td class="remain">${turnWheel.rewardCount[reward]}</td>`
        $("#info").append(info);
    };
    turnWheel.bRotate = false;
    drawWheelCanvas();
}

// 渲染转盘
function drawWheelCanvas() {
    var canvas = document.getElementById("wheelCanvas");
    var baseAngle = Math.PI * 2 / (turnWheel.rewardNames.length); // 计算每块占的角度，弧度制
    var ctx = canvas.getContext("2d");
    var canvasW = canvas.width; // 画板的高度
    var canvasH = canvas.height; // 画板的宽度
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.strokeStyle = "#FFBE04";
    ctx.font = 'bold 32px Microsoft YaHei';
    for (var index = 0; index < turnWheel.rewardNames.length; index++) { // 画每个圆弧
        var icon = turnWheel.images[rewardName];
        var angle = turnWheel.startAngle + index * baseAngle;
        var rewardName = turnWheel.rewardNames[index];
        var line_height = 32;
        var translateX = canvasW * 0.5 + Math.cos(angle + baseAngle / 2) * turnWheel.textRadius;
        var translateY = canvasH * 0.5 + Math.sin(angle + baseAngle / 2) * turnWheel.textRadius;
        var enable = turnWheel.rewardCount[rewardName] > 0;
        ctx.fillStyle = enable ? turnWheel.colors[index] : "#BDBDBD";
        ctx.beginPath();
        ctx.arc(canvasW * 0.5, canvasH * 0.5, turnWheel.outsideRadius, angle, angle + baseAngle, false);
        ctx.arc(canvasW * 0.5, canvasH * 0.5, turnWheel.insideRadius, angle + baseAngle, angle, true);
        ctx.stroke();
        ctx.fill();
        ctx.save();
        ctx.fillStyle = enable ? "#E5302F" : "#9E9E9E";
        ctx.translate(translateX, translateY);
        ctx.rotate(angle + baseAngle / 2 + Math.PI / 2);
        ctx.fillText(rewardName, -ctx.measureText(rewardName).width / 2, 0 * line_height);
        if (icon !== undefined) {
            ctx.drawImage(icon, -43, 5, 80, 80); // 图标
        }
        ctx.restore();
    }
}

// 初始化
$(document).ready(function () {
    $.ajax({
        url: "./json/data.json",
        data: null,
        async: false,
        dataType: "json",
        success: handleData,
        error: function (data) {
            alert("请检查网络！");
            $("#tip").text("请求数据失败");
        }
    });
    $('.pointer').click(lottery); // 按钮点击事件
});

window.onload = function () {
    drawWheelCanvas();
};