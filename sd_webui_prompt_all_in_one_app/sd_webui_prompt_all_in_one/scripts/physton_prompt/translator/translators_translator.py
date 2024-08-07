import sys
import os

# 修复个别电脑环境会报的错
Path = os.path.dirname(__file__)
sys.path.append(Path)
from base_tanslator import BaseTranslator

Path = os.path.join(os.path.dirname(__file__), "../")
sys.path.append(Path)

class TranslatorsTranslator(BaseTranslator):
    translator = None

    def set_translator(self, translator):
        self.translator = translator
        return self

    def translate(self, text):
        region = self.api_config.get('region', 'CN')
        host = self.api_config.get('host', '')
        os.environ['translators_default_region'] = region
        from translators.server import translate_text, tss, AlibabaV1
        tss.server_region = region
        tss._bing.server_region = region
        tss._google.server_region = region

        params = {
            'from_language': self.from_lang,
            'to_language': self.to_lang,
            'translator': self.translator,
            'reset_host_url': host,
            'if_check_reset_host_url': False,
            'timeout': 30
        }
        return translate_text(text, **params)
        # return translate_text(text, from_language=self.from_lang, to_language=self.to_lang, translator=self.translator, timeout=30)
