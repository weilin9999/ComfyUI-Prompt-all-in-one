import { app } from '../../scripts/app.js'

// 全局
let onlyOne = false
let global_randomID = (Math.random() + new Date().getTime()).toString(32).slice(0,8); // 随机种子ID

app.registerExtension({
  name: "weilin.prompt_global",
  
  async init(app) {
    // 全局唯一
    const style = document.createElement("style");
    style.innerText = `
        .weilin_bg_box{
            display: flex;
            justify-content: center;
            align-items: center;
            position: fixed;
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;
            z-index: calc(100 * 100 * 100 * 90);
        }
        .weilin_iframe_box{
            border-radius: 10px;
            background-color: #ffffff;
            transition: all 0.4s;
        }
        .weilin_global_floating_window {
            position: absolute;
            bottom: 100px;
            left: 20px;
            width: 45px;
            height: 45px;
            background: #22c1c3;  /* fallback for old browsers */
            background: -webkit-linear-gradient(to bottom, #fdbb2d, #22c1c3);  /* Chrome 10-25, Safari 5.1-6 */
            background: linear-gradient(to bottom, #fdbb2d, #22c1c3); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
            z-index: calc(100 * 100 * 100 * 10);
            border-radius: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style)

    // 小浮窗
    const floatingWindowBox = document.createElement('div')
    floatingWindowBox.innerHTML = `
    <div style="font-size: small;color: #ffffff;user-select: none;">WeiLin</div>
    <textarea id="weilin_global_great_prompt_input" style="display:none;" ></textarea>
    <textarea id="weilin_global_neg_prompt_input" style="display:none;" ></textarea>
    `
    floatingWindowBox.className = "weilin_global_floating_window"
    floatingWindowBox.id = "weilin_global_floating_window"
    document.body.appendChild(floatingWindowBox);

    // 小浮窗JavaScript
    const script = document.createElement("script");
    script.type = "text/javascript";
    // 直接搬现成的代码 省事
    script.text = `
        const weilin_box = document.getElementById('weilin_global_floating_window')
        weilin_dragElement(weilin_box);
        function weilin_dragElement(elmnt) {
            var weilin_pos1 = 0, weilin_pos2 = 0, weilin_pos3 = 0, weilin_pos4 = 0;

            elmnt.onmousedown = weilin_dragMouseDown;
            elmnt.onmouseup = weilin_dragMouseUp;

            let weilin_isMove = 1

            function weilin_dragMouseUp(e){
                //console.log(weilin_isMove)
                if(weilin_isMove == 0 || weilin_isMove == 1 ){
                    const evt = new CustomEvent("openWeilinGlobalPromptBox", {"detail":{"open":true}});
                    document.dispatchEvent(evt);
                }
            }

            function weilin_dragMouseDown(e) {
                weilin_isMove = 1;
                e = e || window.event;
                e.preventDefault();
                // 在启动时获取鼠标光标位置:
                weilin_pos3 = e.clientX;
                weilin_pos4 = e.clientY;
                document.onmouseup = weilin_closeDragElement;
                // 每当光标移动时调用一个函数:
                document.onmousemove = weilin_elementDrag;
            }

            function weilin_elementDrag(e) {
                weilin_isMove = weilin_isMove - 1;
                weilin_box.style.cursor = "move"
                e = e || window.event;
                e.preventDefault();
                // 计算新的光标位置:
                weilin_pos1 = weilin_pos3 - e.clientX;
                weilin_pos2 = weilin_pos4 - e.clientY;
                weilin_pos3 = e.clientX;
                weilin_pos4 = e.clientY;
                // 设置元素的新位置:
                elmnt.style.top = (elmnt.offsetTop - weilin_pos2) + "px";
                elmnt.style.left = (elmnt.offsetLeft - weilin_pos1) + "px";
            }

            function weilin_closeDragElement() {
                weilin_box.style.cursor = "pointer"
                // 释放鼠标按钮时停止移动:
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }
    `
    document.body.appendChild(script);

    const hasIframeBox = document.getElementById('weilin_bg_box_global')
    if(hasIframeBox == null){
        const ui_theme = localStorage.getItem("weilin_prompt_theme");
        localStorage.setItem("weilin_prompt_global_refid",global_randomID)
        const getBoxStatus = localStorage.getItem("weilin_prompt_box_status");
        let minHeight = '';
        let minWidth = '';
        if(getBoxStatus == "full"){
            minHeight="100%"
            minWidth="100%"
        }else{
            minHeight="80%"
            minWidth="80%"
        }
        // 全局创建一个即可
        const iftramBox = document.createElement("div");
        iftramBox.innerHTML = `
            <iframe
                style="min-width: ${minWidth};min-height: ${minHeight};"
                class="weilin_iframe_box"
                id='weilin_prompt_global_box'
                name='weilin_prompt_global_box'
                src='./weilin/web_ui/index.html?type=global_prompt&refid=${global_randomID}&__theme=${ui_theme}'
                frameborder='0'
                scrolling='on'
            >
            </iframe>
        `;
        iftramBox.id = "weilin_bg_box_global"
        iftramBox.className = "weilin_bg_box"
        iftramBox.style.display = "none"
        document.body.appendChild(iftramBox);
    }

  },
  async setup(app) {

  },


  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if(!onlyOne){
        onlyOne = true
        // console.log('onlyOne load',ifreamBox)

        let thisInputGreatElement = document.getElementById("weilin_global_great_prompt_input")
        let thisInputNegElement = document.getElementById("weilin_global_neg_prompt_input")
        let randomID = ''

        document.addEventListener("openWeilinGlobalPromptBox", function (event) {
            randomID = (Math.random() + new Date().getTime()).toString(32).slice(0,8); // 随机种子ID
            localStorage.setItem("weilin_prompt_randomid",randomID);

            for (let index = 0; index < window.length; index++) {
                window[index].postMessage({handel: 'openWeiLinGlobalPromptSD',value_great: thisInputGreatElement.value,value_neg: thisInputNegElement.value,randomid: randomID}, "*");
            }

            const ui_theme = localStorage.getItem("weilin_prompt_theme");
            const iframeEle = document.getElementById('weilin_prompt_global_box')

            const getBoxStatus = localStorage.getItem("weilin_prompt_box_status");
            if(getBoxStatus == "full"){
                iframeEle.style.minHeight="100%"
                iframeEle.style.minWidth="100%"
            }else{
                iframeEle.style.minHeight="80%"
                iframeEle.style.minWidth="80%"
            }

            const params = new URL(iframeEle.src)
            const searchParams = params.searchParams
            const theme_type =  searchParams.get("__theme")
            // console.log(ui_theme.toString() , theme_type.toString() )
            if(String(ui_theme)  != String(theme_type) ){
                iframeEle.src = `./weilin/web_ui/index.html?type=global_prompt&refid=${global_randomID}&__theme=${ui_theme}`
            }

            const ifreamBox = document.getElementById('weilin_bg_box_global')
            ifreamBox.style.display = "flex"

        }, false)


        window.addEventListener('message', e => {
            if(e.data.handel == 'changeWeiLinGlobalPrompt' && e.data.randomid == randomID){
                thisInputGreatElement.value = e.data.value_great
                thisInputNegElement.value = e.data.value_neg
            }else if(e.data.handel  == 'closeWeilinGlobalPromptBox' && e.data.randomid == randomID){
                const ifreamBox = document.getElementById('weilin_bg_box_global')
                ifreamBox.style.display = "none"
            }else if(e.data.handel == 'getWeilinGlobalPromptBox' && e.data.randomid == randomID){
                for (let index = 0; index < window.length; index++) {
                    window[index].postMessage({handel: 'responeseWeiLinGlobalPromptGet',value_great: thisInputGreatElement.value,value_neg: thisInputNegElement.value,randomid: randomID}, "*");
                }
            }else if(e.data.handel == 'refreshWeilinPromptBox'){
                global_randomID = (Math.random() + new Date().getTime()).toString(32).slice(0,8); // 随机种子ID
                const ui_theme = localStorage.getItem("weilin_prompt_theme");
                const iframeEle = document.getElementById('weilin_prompt_global_box')
                iframeEle.src = `./weilin/web_ui/index.html?type=global_prompt&refid=${global_randomID}&__theme=${ui_theme}`
            }else if(e.data.handel == 'fullBoxWeilinPromptBox'){
                localStorage.setItem("weilin_prompt_box_status","full");
                const iframeEle = document.getElementById('weilin_prompt_global_box')
                iframeEle.style.minHeight="100%"
                iframeEle.style.minWidth="100%"
                for (let index = 0; index < window.length; index++) {
                    window[index].postMessage({handel: 'fullBoxWeilinPromptBoxResponse',randomid: randomID}, "*");
                }
            }else if(e.data.handel == 'nomBoxWeilinPromptBox'){
                localStorage.setItem("weilin_prompt_box_status","nom");
                const iframeEle = document.getElementById('weilin_prompt_global_box')
                iframeEle.style.minHeight="80%"
                iframeEle.style.minWidth="80%"
                for (let index = 0; index < window.length; index++) {
                    window[index].postMessage({handel: 'nomBoxWeilinPromptBoxResponse',randomid: randomID}, "*");
                }
            }
        }, false);
        

    }
  },
});