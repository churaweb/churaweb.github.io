document.addEventListener('DOMContentLoaded', function () {
    // ----- ナビゲーションメニュー -----
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('opacity-0');
        navMenu.classList.toggle('invisible');
        navMenu.classList.toggle('-translate-y-2');
        
        // ★ トグルボタンに 'menu-open' クラスを付け外し
        navToggle.classList.toggle('menu-open');
    });
    document.addEventListener('click', () => {
        if (!navMenu.classList.contains('opacity-0')) {
            navMenu.classList.add('opacity-0', 'invisible', '-translate-y-2');
            
            // ★ メニューを閉じるときはボタンの 'menu-open' クラスも削除
            navToggle.classList.remove('menu-open');
        }
    });
    navMenu.addEventListener('click', (e) => e.stopPropagation());

    // ----- フェードインアニメーション -----
    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-section').forEach(section => {
        fadeObserver.observe(section);
    });

    // ----- フッター年号 -----
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // ----- お問い合わせフォーム (JavaScript部分を削除) -----
    /* const contactForm = document.getElementById('contact-form');
    ... (省略) ...
    });
    */

    // ----- ★★★ 吹き出しのXY座標の表示 (ここから変更) ★★★ -----
    
    // 1. すべての吹き出し要素を取得
    const bubbles = document.querySelectorAll('.chat-bubble');

    // 2. 各吹き出しに座標表示用の <span> を追加
    bubbles.forEach((bubble, index) => {
        const coordsSpan = document.createElement('span');
        // Tailwindクラスでスタイルを指定 (吹き出しの -bottom-6 (1.5rem) 下、左端に配置)
        coordsSpan.className = 'absolute -bottom-6 left-0 font-mono text-xs text-cyan-400 pointer-events-none user-select-none whitespace-nowrap';
        // 識別用のIDを付与
        coordsSpan.id = `bubble-coords-${index}`; 
        coordsSpan.textContent = 'X: 0, Y: 0'; // 初期値
        bubble.appendChild(coordsSpan);
    });

    // 3. 座標をリアルタイムで更新する関数 (名前を変更)
    function updateDynamicUI() {
        // --- 既存の吹き出し座標ロジック ---
        bubbles.forEach((bubble, index) => {
            const coordsSpan = document.getElementById(`bubble-coords-${index}`);
            if (coordsSpan) {
                // getBoundingClientRect() でビューポート基準の現在座標を取得
                const rect = bubble.getBoundingClientRect();
                // 座標を整数に丸める
                const x = Math.round(rect.left);
                const y = Math.round(rect.top);
                
                // テキストを更新
                coordsSpan.textContent = `X: ${x}, Y: ${y}`;
            }
        });
        
        // --- ★★★ 新規のマウス速度ロジック (ここから追加) ★★★ ---
        const now = Date.now();
        const deltaTime = now - lastMousePos.time;
        
        // 速度計算 (0除算を避ける)
        if (deltaTime > 0) {
            // ★ hudMouseVelocity が存在するか確認
            if (hudMouseVelocity) { 
                const distance = Math.hypot(currentMousePos.x - lastMousePos.x, currentMousePos.y - lastMousePos.y);
                // (ピクセル / ミリ秒) * 1000 = ピクセル / 秒
                const velocity = (distance / deltaTime) * 1000; 
                hudMouseVelocity.textContent = `${velocity.toFixed(1)} px/s`;
            }
        }
        
        // 最後の位置情報を更新
        lastMousePos = { 
            x: currentMousePos.x, 
            y: currentMousePos.y, 
            time: now 
        };
        // --- ★★★ マウス速度ロジックここまで ★★★ ---


        // 次のアニメーションフレームで再度この関数を呼ぶ
        requestAnimationFrame(updateDynamicUI);
    }

    // ----- ★★★ HUD（計器パネル）用のロジック (ここから追加) ★★★ -----

    // 1. HUD要素への参照を取得
    const hudScrollY = document.getElementById('hud-scroll-y');
    const hudScrollFill = document.getElementById('hud-scroll-bar-fill');
    const hudMouseCoords = document.getElementById('hud-mouse-coords');
    const hudMouseVelocity = document.getElementById('hud-mouse-velocity');

    // 2. マウス速度計算用の変数
    let currentMousePos = { x: 0, y: 0 };
    let lastMousePos = { x: 0, y: 0, time: Date.now() };

    // 3. スクロールイベントリスナー
    document.addEventListener('scroll', () => {
        // ★ 要素が存在するか確認してから更新
        if (hudScrollY) {
            const scrollY = Math.round(window.scrollY);
            // スクロールY座標を更新
            hudScrollY.textContent = `${scrollY}px`;
        }

        if (hudScrollFill) {
            // スクロール深度計を更新
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            // 0除算を避ける
            const percent = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0; 
            hudScrollFill.style.width = `${percent}%`;
        }

    }, { passive: true }); // スクロールパフォーマンス向上のため passive: true を指定

    // 4. マウス移動イベントリスナー
    document.addEventListener('mousemove', (e) => {
        // マウス座標を更新
        currentMousePos = { x: e.clientX, y: e.clientY };
        // ★ 要素が存在するか確認してから更新
        if (hudMouseCoords) {
            hudMouseCoords.textContent = `${e.clientX}, ${e.clientY}`;
        }
    });
    
    // ----- ★★★ ここまでHUDロジック ★★★ -----


    // 4. アニメーションループを開始
    // 吹き出しが存在する場合のみループを開始
    if (bubbles.length > 0 || document.getElementById('hud-mouse-velocity')) {
        // 関数名を変更してループを開始
        requestAnimationFrame(updateDynamicUI);
    }
    
    // ----- ★★★ ここまで変更 ★★★ -----
});
