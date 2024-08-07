
import re
import random
from .sd_webui_prompt_all_in_one_app import launch
import os
import pkg_resources


#正向提示词
class WeiLinComfyUIPromptAllInOneGreat:

    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "text": ("STRING", {
                    "multiline": True, #True if you want the field to look like the one on the ClipTextEncode node
                    "default": "",
                    "placeholder": "输入提示词",
                }),
            },
        }

    RETURN_TYPES = ("STRING",)
    #RETURN_NAMES = ("image_output_name",)

    FUNCTION = "encode"

    #OUTPUT_NODE = False

    CATEGORY = "conditioning"

    def encode(self, text):
        text= extract_tags(text)
        return (text,)
    

#反向提示词
class WeiLinComfyUIPromptAllInOneNeg:

    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "text": ("STRING", {
                    "multiline": True, #True if you want the field to look like the one on the ClipTextEncode node
                    "default": "",
                    "placeholder": "输入提示词",
                }),
            },
        }

    RETURN_TYPES = ("STRING",)
    #RETURN_NAMES = ("image_output_name",)

    FUNCTION = "encode"

    #OUTPUT_NODE = False

    CATEGORY = "conditioning"

    def encode(self, text):
        text= extract_tags(text)
        return (text,)

def extract_tags(text):
    pattern = r'#\[(.*?)\]'
    matches=re.findall(pattern, text)  
    for i in matches:
        newarr=i.split(',')
        random.seed(random.random())
        rdindex=random.randint(0,len(newarr)-1)
        rdtext=newarr[rdindex]
        text = re.sub(pattern, rdtext, text,count=1)
    return text



base_path = os.path.join(os.path.dirname(__file__), "sd_webui_prompt_all_in_one_app")
req_path = os.path.join(base_path,"requirements.txt")

def dist2package(dist: str):
    return ({
        "gradio": "gradio",
    }).get(dist, dist)


def install_requirements(requirements_file_path):
    # copy from controlnet, thanks
    with open(requirements_file_path) as file:
        for package in file:
            try:
                package = package.strip()
                if '==' in package:
                    package_name, package_version = package.split('==')
                    installed_version = pkg_resources.get_distribution(package_name).version
                    if installed_version != package_version:
                        launch.run_pip(f"install {package}", f"WeiLinComfyUIPromptAllInOne requirement: changing {package_name} version from {installed_version} to {package_version}")
                elif not launch.is_installed(dist2package(package)):
                    launch.run_pip(f"install {package}", f"WeiLinComfyUIPromptAllInOne requirement: {package}")
            except Exception as e:
                print(e)
                print(f'[错误]: Failed to install {package}, something may not work.')

#安装原APP依赖
print('WeiLinComfyUIPromptAllInOne 请求安装依赖中.......')
try:
    install_requirements(req_path)
    print('WeiLinComfyUIPromptAllInOne 请求安装依赖完成 =======')
except: 
    print('WeiLinComfyUIPromptAllInOne 请求安装依赖失败 =======')
#启动原APP
from .sd_webui_prompt_all_in_one_app.app import app_start
app_start()


# A dictionary that contains all nodes you want to export with their names
# NOTE: names should be globally unique
NODE_CLASS_MAPPINGS = {
    "WeiLinComfyUIPromptAllInOneGreat": WeiLinComfyUIPromptAllInOneGreat,
    "WeiLinComfyUIPromptAllInOneNeg": WeiLinComfyUIPromptAllInOneNeg
}

# A dictionary that contains the friendly/humanly readable titles for the nodes
NODE_DISPLAY_NAME_MAPPINGS = {
    "WeiLinComfyUIPromptAllInOneGreat": "WeiLin PromptAllInOne 正向提示词",
    "WeiLinComfyUIPromptAllInOneNeg": "WeiLin PromptAllInOne 反向提示词"
}

WEB_DIRECTORY = "./js"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]