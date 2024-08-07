import sys
import os

# 修复个别电脑环境会报的错
Path = os.path.join(os.path.dirname(__file__), "../")
sys.path.append(Path)

from translator.base_tanslator import BaseTranslator
from get_lang import get_lang
from mbart50 import initialize as mbart50_initialize, translate as mbart50_translate


class MBart50Translator(BaseTranslator):
    def __init__(self):
        super().__init__('mbart50')

    def translate(self, text):
        if not text:
            if isinstance(text, list):
                return []
            else:
                return ''

        result = mbart50_translate(text=text, src_lang=self.from_lang, target_lang=self.to_lang)
        if not result:
            raise Exception(get_lang('response_is_empty', {'0': 'mbart50'}))

        if isinstance(text, list):
            return result
        else:
            return result[0]

    def translate_batch(self, texts):
        return self.translate(texts)
