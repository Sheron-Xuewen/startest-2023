// 当文档加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // Three.js 场景代码
    const threeCanvas = document.getElementById('threeCanvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('infoWindow').style.display = 'none';
    // Raycaster 和鼠标向量
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('touchstart', onDocumentMouseDown, false);
    
    // 将渲染器的DOM元素添加到HTML文档的body部分
    document.body.appendChild(renderer.domElement);

    // 窗口大小变化时的事件处理
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        resizeStarCanvas(); // 更新星星背景尺寸
    });
    

    // 点击事件处理函数
    function onDocumentMouseDown(event) {
        const infoWindow = document.getElementById('infoWindow');

    // 检查点击是否发生在信息窗口上
    if (infoWindow.contains(event.target)) {
        event.preventDefault();
        event.stopPropagation(); // 阻止事件进一步传播
        return; // 退出函数，不继续处理此点击事件
    }
        event.preventDefault();

        mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects([earth, satellite]);

        // 使用 event.clientX 和 event.clientY 获取鼠标位置
        if (intersects.length > 0) {
            const selectedObject = intersects[0].object;
            showInfoWindow(selectedObject, event.clientX, event.clientY);
        }
    }


    // 显示信息窗口的函数
    function showInfoWindow(object, mouseX, mouseY) {
        const infoWindow = document.getElementById('infoWindow');
        const earthInfo = document.getElementById('earthInfo');
        const satelliteInfo = document.getElementById('satelliteInfo');
    
        // 隐藏所有内容容器
        earthInfo.style.display = 'none';
        satelliteInfo.style.display = 'none';
    
        // 根据点击的对象显示相应内容
        if (object === earth) {
            earthInfo.style.display = 'block';
        } else if (object === satellite) {
            satelliteInfo.style.display = 'block';
        }
    
        // 临时显示窗口以获取尺寸
        infoWindow.style.display = 'block';
        const infoWidth = infoWindow.offsetWidth;
        const infoHeight = infoWindow.offsetHeight;
        infoWindow.style.display = 'none'; // 立即隐藏窗口
    
        // 计算窗口位置
        let left = mouseX;
        let top = mouseY;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
    
        // 确保窗口不超出右侧和底部边界
        if (left + infoWidth > windowWidth) {
            left = windowWidth - infoWidth;
        }
        if (top + infoHeight > windowHeight) {
            top = windowHeight - infoHeight;
        }
    
        // 应用计算后的位置并显示窗口
        infoWindow.style.left = `${left}px`;
        infoWindow.style.top = `${top}px`;
        infoWindow.style.display = 'block';
    }
    
    
    
    // 添加关闭按钮的点击事件监听器
    document.getElementById('closeButton').addEventListener('click', function() {
        document.getElementById('infoWindow').style.display = 'none';
    });




    // 星星背景
    // 获取正确的canvas元素
    const starCanvas = document.getElementById('starCanvas');
    starCanvas.width = window.innerWidth;
    starCanvas.height = window.innerHeight;
    const context = starCanvas.getContext('2d');

    // 定义星星的颜色、大小、数量等
    const STAR_COLOR = '#fff';
    const STAR_SIZE = 3;
    const STAR_MIN_SCALE = 0.2;
    const OVERFLOW_THRESHOLD = 50;
    const STAR_COUNT = ((window.innerWidth + window.innerHeight) / 8) * 2;

    // 定义缩放比例、宽度、高度、星星数组、鼠标指针的位置、速度对象、触摸输入标志
    let scale = 1; // device pixel ratio
    let width = starCanvas.width;
    let height = starCanvas.height;
    let stars = [];
    let pointerX;
    let pointerY;
    let velocity = { x: 0, y: 0, tx: 0, ty: 0, z: 0.0009 };
    let touchInput = false;

    // 生成星星
    function generate() {
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: 0,
                y: 0,
                z: STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE),
            });
        }
    }

    /// 事件监听器
    const eventHandler = document.getElementById('eventHandler');

    eventHandler.onmousemove = onMouseMove;
    eventHandler.ontouchmove = onTouchMove;
    eventHandler.ontouchend = onMouseLeave;
    // 不再将事件绑定到 starCanvas 上
    
    document.onmouseleave = onMouseLeave;

    // 生成星星
    function generate() {
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: 0,
                y: 0,
                z: STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE),
            });
        }
    }

    // 将星星放置到随机位置
    function placeStar(star) {
        star.x = Math.random() * width;
        star.y = Math.random() * height;
    }

    // 回收星星并重新放置到新的位置
    function recycleStar(star) {
        let direction = 'z';
        let vx = Math.abs(velocity.x);
        let vy = Math.abs(velocity.y);

        if (vx > 1 || vy > 1) {
            let axis;

            if (vx > vy) {
                axis = Math.random() < vx / (vx + vy) ? 'h' : 'v';
            } else {
                axis = Math.random() < vy / (vx + vy) ? 'v' : 'h';
            }

            if (axis === 'h') {
                direction = velocity.x > 0 ? 'l' : 'r';
            } else {
                direction = velocity.y > 0 ? 't' : 'b';
            }
        }

        star.z = STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE);

        if (direction === 'z') {
            star.z = 0.1;
            star.x = Math.random() * width;
            star.y = Math.random() * height;
        } else if (direction === 'l') {
            star.x = -OVERFLOW_THRESHOLD;
            star.y = height * Math.random();
        } else if (direction === 'r') {
            star.x = width + OVERFLOW_THRESHOLD;
            star.y = height * Math.random();
        } else if (direction === 't') {
            star.x = width * Math.random();
            star.y = -OVERFLOW_THRESHOLD;
        } else if (direction === 'b') {
            star.x = width * Math.random();
            star.y = height + OVERFLOW_THRESHOLD;
        }
    }

    // 调整大小
    function resize() {
        scale = window.devicePixelRatio || 1;
        width = starCanvas.width = window.innerWidth * scale;
        height = starCanvas.height = window.innerHeight * scale;
        stars.forEach(placeStar);
    }

    // 动画的每一帧
    function step() {
        context.clearRect(0, 0, width, height);
        update();
        render();
        requestAnimationFrame(step);
    }

    // 更新星星的位置和速度
    function update() {
        velocity.tx *= 0.96;
        velocity.ty *= 0.96;
        velocity.x += (velocity.tx - velocity.x) * 0.8;
        velocity.y += (velocity.ty - velocity.y) * 0.8;

        stars.forEach((star) => {
            star.x += velocity.x * star.z;
            star.y += velocity.y * star.z;
            star.x += (star.x - width / 2) * velocity.z * star.z;
            star.y += (star.y - height / 2) * velocity.z * star.z;
            star.z += velocity.z;

            if (
                star.x < -OVERFLOW_THRESHOLD ||
                star.x > width + OVERFLOW_THRESHOLD ||
                star.y < -OVERFLOW_THRESHOLD ||
                star.y > height + OVERFLOW_THRESHOLD
            ) {
                recycleStar(star);
            }
        });
    }

    // 绘制星星
    function render() {
        stars.forEach((star) => {
            context.beginPath();
            context.lineCap = 'round';
            context.lineWidth = STAR_SIZE * star.z * scale;
            context.globalAlpha = 0.5 + 0.5 * Math.random();
            context.strokeStyle = STAR_COLOR;
            context.beginPath();
            context.moveTo(star.x, star.y);

            let tailX = velocity.x * 2;
            let tailY = velocity.y * 2;

            if (Math.abs(tailX) < 0.1) tailX = 0.5;
            if (Math.abs(tailY) < 0.1) tailY = 0.5;

            context.lineTo(star.x + tailX, star.y + tailY);
            context.stroke();
        });
    }

    // 移动鼠标指针
    function movePointer(x, y) {
        if (typeof pointerX === 'number' && typeof pointerY === 'number') {
            let ox = x - pointerX;
            let oy = y - pointerY;
            velocity.tx = velocity.tx + (ox / 20) * scale * (touchInput ? 1 : -1);
            velocity.ty = velocity.ty + (oy / 20) * scale * (touchInput ? 1 : -1);
        }
        pointerX = x;
        pointerY = y;
    }

    // 当鼠标在canvas上移动时的事件处理函数
    function onMouseMove(event) {
        // 接着处理鼠标在 threeCanvas 上的移动
        touchInput = false;
        movePointer(event.clientX, event.clientY);
        
        // 接着处理鼠标在 threeCanvas 上的移动
        mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([earth, satellite]);

        if (intersects.length > 0) {
            renderer.domElement.style.cursor = 'pointer';
        } else {
            renderer.domElement.style.cursor = 'auto';
        }
    }

    // 添加事件监听器（只需要一个）
    renderer.domElement.addEventListener('mousemove', onMouseMove);

    // 当触摸屏在canvas上移动时的事件处理函数
    function onTouchMove(event) {
        touchInput = true;
        movePointer(event.touches[0].clientX, event.touches[0].clientY, true);
        event.preventDefault();
    }

    // 当鼠标离开canvas时的事件处理函数
    function onMouseLeave() {
        pointerX = null;
        pointerY = null;
    }

    // 初始化和运行动画
    generate();
    resize();
    step();

    // 窗口大小改变时的事件处理
    window.onresize = resize;



    //日月

    // 小球
    // 存储已有小球的位置
    let existingPoints = [];

    function createGlowingPoint() {
        const pointRadius = radius / 100;  // 光点半径为地球半径的1/60
        const pointGeometry = new THREE.SphereGeometry(pointRadius, 16, 16); // 使用相对大小

        // 定义材质
        const pointMaterial = new THREE.MeshPhongMaterial({
            color: 0xff7700,                 // 主要颜色设为白色
            emissive: 0xff7700,              // 自发光颜色设为橘金色
            emissiveIntensity: 1          // 增加自发光强度
        });

        let point;
        let position;
        let tooClose;

        do {
            tooClose = false;
            const lat = (Math.random() - 0.5) * Math.PI; // 纬度 (-π/2 到 π/2)
            const lng = Math.random() * 2 * Math.PI; // 经度 (0 到 2π)

            position = new THREE.Vector3(
                radius * Math.cos(lat) * Math.sin(lng),
                radius * Math.sin(lat),
                radius * Math.cos(lat) * Math.cos(lng)
            );

            // 检查是否与现有点过于接近
            for (let i = 0; i < existingPoints.length; i++) {
                if (position.distanceTo(existingPoints[i]) < pointRadius * 2) { // 或者根据需要调整距离判断标准
                    tooClose = true;
                    break;
                }
            }
        } while (tooClose);

        point = new THREE.Mesh(pointGeometry, pointMaterial);
        point.position.copy(position);

        // 将新点的位置存储起来
        existingPoints.push(position);

        return point;
    }

    
    // 计算地球半径，基于窗口宽度的一部分
    const radius = window.innerWidth * 0.2;

    // 地球材质
    const geometry = new THREE.SphereGeometry(radius, 64, 64);
    const material = new THREE.MeshPhongMaterial({

        color: 0x1a0271, 
        emissive: 0x1a0271, 
        emissiveIntensity: 0.5, // 自发光强度
        roughness: 1 // 粗糙度，0是平滑，1是非常粗糙
    });
    
    // 创建地球Mesh（确保这段代码只出现一次）
    const earth = new THREE.Mesh(geometry, material);

    // 计算倾斜角度（23.5度转换为弧度）
    const tiltAngle = -90* (Math.PI / 180);

    // 应用倾斜角度到地球的Z轴
    earth.rotation.z = tiltAngle;

    // 将地球添加到场景中
    scene.add(earth);

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // 保持环境光强度不变
    scene.add(ambientLight);


    // 添加光点
    const numberOfPoints = 500; 
    for (let i = 0; i < numberOfPoints; i++) {
    const point = createGlowingPoint();
    earth.add(point); // 将点添加为地球的子对象
    }

    // 创建月球轨道组
    const moonOrbitGroup = new THREE.Object3D();

    // 倾斜月球的轨道平面
    moonOrbitGroup.rotation.x = Math.PI / 6; // 例如，将轨道倾斜30度
    scene.add(moonOrbitGroup);  // 将月球轨道组添加到场景中

    // 创建卫星（例如月球）的几何体和材质
    const satelliteGeometry = new THREE.SphereGeometry(radius * 0.2, 32, 32);
    const satelliteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
    satellite.position.set(radius * 1.5, 0, 0); // 设置卫星的位置
    moonOrbitGroup.add(satellite);  // 将卫星添加到月球轨道组中

    // 设置相机位置，确保地球和卫星都在视野中
    camera.position.z = radius * 4;

    // 定义卫星旋转角度
    let satelliteAngle = 0;
    
    // 动画函数：每帧调用以更新场景状态
    function animateThree() {
        requestAnimationFrame(animateThree);
    
        // 直接旋转地球
        earth.rotation.y += 0.005;
    
        // 独立旋转月球轨道组（如果仍然需要）
        moonOrbitGroup.rotation.y += 0.01;
    
        renderer.render(scene, camera);
    }
    animateThree();

    // 窗口大小变化时的事件处理
    window.addEventListener('resize', () => {
        // 更新相机的纵横比，并重新设置渲染器大小
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });


});
