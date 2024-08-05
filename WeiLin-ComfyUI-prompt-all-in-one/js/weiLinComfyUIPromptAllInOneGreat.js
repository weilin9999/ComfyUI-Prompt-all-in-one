import { app } from '../../scripts/app.js'

class PromptUINode {
  timer = null;
  constructor(devObj) {
    this.devObj = devObj;
    this.makeElements();
  }

  makeElements() {
    const panelPaintBox = document.createElement("div");
    panelPaintBox.innerHTML = `
    <div id="weilin_prompt_in_all_one_widget" class="weilin_prompt_in_all_one_widget">
      <button id="weilin_great_propmptUI_open" >打开PromptUI</button>
    </div>
    `;
    // Main panelpaint box
    panelPaintBox.className = "panelPaintBox";
    this.panelPaintBox = panelPaintBox;
    this.devObj.appendChild(panelPaintBox);
    
    const iftramBox = document.createElement("div");
    iftramBox.innerHTML = `
      <iframe
        class="weilin_iframe_box"
        id='weilin_prompt_great_box'
        name='weilin_prompt_great_box'
        src='http://localhost:17861/?type=greate_prompt'
        frameborder='0'
        scrolling='on'
        >
      </iframe>
    `;
    iftramBox.id = "weilin_bg_box_greate"
    iftramBox.className = "weilin_bg_box"
    iftramBox.style.display = "none"
    document.body.appendChild(iftramBox);

    this.bindEvents();
  }

  bindEvents() {
    
    window.addEventListener('message', e => {
      if(e.data.handel == 'changeWeiLinGreatePrompt')
      {
        const textarea = document.getElementById('weilin_great_txt2img_prompt')
        textarea.value = e.data.value
      }else if(e.data.handel  == 'closeWeilinGreatPromptBox'){
        const textarea = document.getElementById('weilin_great_txt2img_prompt')
        textarea.readOnly = false
        const ifreamBox = document.getElementById('weilin_bg_box_greate')
        ifreamBox.style.display = "none"
      }else if(e.data.handel == 'openWeilinGreatPromptBox'){
        const textarea = document.getElementById('weilin_great_txt2img_prompt')
        textarea.readOnly = true
        for (let index = 0; index < window.length; index++) {
          window[index].postMessage({handel: 'changeWeiLinGreatPromptSD',value: textarea.value}, "*");
        }
        const ifreamBox = document.getElementById('weilin_bg_box_greate')
        ifreamBox.style.display = "flex"
      }
    }, false);
  }
}


function WeiLinPromptUIWidget(node, inputName, inputData, app) {
  node.name = inputName;
  const widget = {
    type: "weilin_prompt_in_all_one_widget",
    name: `w${inputName}`,
    callback: () => {},
    draw: function (ctx, _, widgetWidth, y, widgetHeight) {
      const margin = 10,
        left_offset = 0,
        top_offset = 0,
        visible = app.canvas.ds.scale > 0.6 && this.type === "weilin_prompt_in_all_one_widget",
        w = widgetWidth - margin * 2 - 10,
        clientRectBound = ctx.canvas.getBoundingClientRect(),
        transform = new DOMMatrix()
          .scaleSelf(
            clientRectBound.width / ctx.canvas.width,
            clientRectBound.height / ctx.canvas.height
          )
          .multiplySelf(ctx.getTransform())
          .translateSelf(margin, margin + y),
        scale = new DOMMatrix().scaleSelf(transform.a, transform.d);

      Object.assign(this.painter_wrap.style, {  //auto scale
        left: `${transform.a * margin * left_offset + transform.e}px`,
        top: `${transform.d + transform.f + top_offset}px`,
        width: `${w * transform.a}px`,
        position: "absolute",
        zIndex: app.graph._nodes.indexOf(node),
      });

      Object.assign(this.painter_wrap.children[0].style, { 
        transformOrigin: "0 0",
        transform: scale,
        width: w + "px",
      });

    },
  };
  let devElmt = document.createElement("div");
  node.capture = new PromptUINode(devElmt);
  widget.painter_wrap = node.capture.devObj;

  widget.parent = node;

  // node.capture.makeElements();
  document.body.appendChild(widget.painter_wrap);

  node.addCustomWidget(widget);
  node.onRemoved = () => {
    const textarea = document.getElementById('weilin_great_txt2img_prompt')
    textarea.remove();
    for (let y in node.widgets) {
      if (node.widgets[y].painter_wrap) {
        node.widgets[y].painter_wrap.remove();
        clearInterval(node.widgets[y].painter_wrap.timer); 
      }
    }
  };
  node.onResize = function () {
    let [w, h] = this.size;
    if (w <= 501) w = 500;
    if (h <= 201) h = 200;

    if (w > 501) {
      h = w + 40;
    }
    this.size = [w, h];
  };

  return { widget: widget };
}

app.registerExtension({
  name: "weilin.prompt_node_great",
  async init(app) {
    const style = document.createElement("style");
    style.innerText = `.panelWeiLinPrompGreattBox {
      width: 100%;
    }
      .weilin_bg_box{
        display: flex;
        justify-content: center;
        align-items: center;
        position: fixed;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        z-index: 999;
      }
      .weilin_iframe_box{
        min-width: 80%;
        min-height: 80%;
        border-radius: 20px;
      }
    `;
    document.head.appendChild(style)

  },
  async setup(app) {

  },


  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    // console.log(nodeData.name)
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
        // console.log(`Create WeiLinComfyUIPromptAllInOneGreat: ${nodeName}`);
          WeiLinPromptUIWidget.apply(this, [this, '', {}, app]);


          const openButton = document.getElementById("weilin_great_propmptUI_open");
          openButton.onclick = function () {
            for (let index = 0; index < window.length; index++) {
              window[index].postMessage({handel: 'openWeiLinGreatPromptSD'}, "*");
            }
          }

        return r;
      };
    }
  },
});