import { app } from '../../scripts/app.js'

// 正向提示词

let global_randomID = (Math.random() + new Date().getTime()).toString(32).slice(0,8); // 随机种子ID

app.registerExtension({
  name: "weilin.prompt_node_great",
  
  async init(app) {

    const hasIframeBox = document.getElementById('weilin_bg_box_greate')
    if(hasIframeBox == null){
      const ui_theme = localStorage.getItem("weilin_prompt_theme");
      localStorage.setItem("weilin_prompt_great_refid",global_randomID)
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
          id='weilin_prompt_great_box'
          name='weilin_prompt_great_box'
          src='./weilin/web_ui/index.html?type=greate_prompt&refid=${global_randomID}&__theme=${ui_theme}'
          frameborder='0'
          scrolling='on'
          >
        </iframe>
      `;
      iftramBox.id = "weilin_bg_box_greate"
      iftramBox.className = "weilin_bg_box"
      iftramBox.style.display = "none"
      document.body.appendChild(iftramBox);
    }

  },
  async setup(app) {

  },


  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    // console.log(app)
    if (nodeData.name === "WeiLinComfyUIPromptAllInOneGreat") {
      // console.log(nodeData)
      // Create node
      const onNodeCreated = nodeType.prototype.onNodeCreated;
      nodeType.prototype.onNodeCreated = async function () {
        const r = onNodeCreated
          ? onNodeCreated.apply(this, arguments)
          : undefined;

        let EasyCaptureNode = app.graph._nodes.filter(
            (wi) => wi.type == "WeiLinComfyUIPromptAllInOneGreat"
          );

          let thisInputElement = null
          let randomID = ''

          this.addWidget("button", "打开可视化WeiLin PromptUI", '', ($e) => {
            randomID = (Math.random() + new Date().getTime()).toString(32).slice(0,8); // 随机种子ID
            localStorage.setItem("weilin_prompt_randomid",randomID);
            for (let index = 0; index < this.widgets.length; index++) {
              const element = this.widgets[index];
              if(element.type == "customtext"){
                // console.log(element,randomID)
                thisInputElement = element.element
                thisInputElement.readOnly = true

                // element.element.value
                for (let index = 0; index < window.length; index++) {
                  window[index].postMessage({handel: 'openWeiLinGreatPromptSD',value: thisInputElement.value,randomid: randomID}, "*");
                }

                const ui_theme = localStorage.getItem("weilin_prompt_theme");
                const iframeEle = document.getElementById('weilin_prompt_great_box')

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
                  iframeEle.src = `./weilin/web_ui/index.html?type=greate_prompt&refid=${global_randomID}&__theme=${ui_theme}`
                }

                const ifreamBox = document.getElementById('weilin_bg_box_greate')
                ifreamBox.style.display = "flex"
              } 
            }
          });


          window.addEventListener('message', e => {
            if(e.data.handel == 'changeWeiLinGreatePrompt' && e.data.randomid == randomID)
            {
              thisInputElement.value = e.data.value
            }else if(e.data.handel  == 'closeWeilinGreatPromptBox' && e.data.randomid == randomID){
              thisInputElement.readOnly = false
              const ifreamBox = document.getElementById('weilin_bg_box_greate')
              ifreamBox.style.display = "none"
            }else if(e.data.handel == 'getWeilinGreatPromptBox' && e.data.randomid == randomID){
              for (let index = 0; index < window.length; index++) {
                window[index].postMessage({handel: 'responeseWeiLinGreatPromptGet',value: thisInputElement.value,randomid: randomID}, "*");
              }
            }else if(e.data.handel == 'refreshWeilinPromptBox'){
              global_randomID = (Math.random() + new Date().getTime()).toString(32).slice(0,8); // 随机种子ID
              const ui_theme = localStorage.getItem("weilin_prompt_theme");
              const iframeEle = document.getElementById('weilin_prompt_great_box')
              iframeEle.src = `./weilin/web_ui/index.html?type=greate_prompt&refid=${global_randomID}&__theme=${ui_theme}`
            }else if(e.data.handel == 'fullBoxWeilinPromptBox'){
              localStorage.setItem("weilin_prompt_box_status","full");
              const iframeEle = document.getElementById('weilin_prompt_great_box')
              iframeEle.style.minHeight="100%"
              iframeEle.style.minWidth="100%"
              for (let index = 0; index < window.length; index++) {
                window[index].postMessage({handel: 'fullBoxWeilinPromptBoxResponse',randomid: randomID}, "*");
              }
            }else if(e.data.handel == 'nomBoxWeilinPromptBox'){
              localStorage.setItem("weilin_prompt_box_status","nom");
              const iframeEle = document.getElementById('weilin_prompt_great_box')
              iframeEle.style.minHeight="80%"
              iframeEle.style.minWidth="80%"
              for (let index = 0; index < window.length; index++) {
                window[index].postMessage({handel: 'nomBoxWeilinPromptBoxResponse',randomid: randomID}, "*");
              }
            }
          }, false);

        return r;
      };
    }
  },
});