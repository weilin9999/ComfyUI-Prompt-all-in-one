import sys
import os

# 修复个别电脑环境会报的错
Path = os.path.join(os.path.dirname(__file__), "../")
sys.path.append(Path)

from translator.base_tanslator import BaseTranslator
import uuid
import requests
from get_lang import get_lang


class NiutransTranslator(BaseTranslator):
    def __init__(self):
        super().__init__('niutrans')

    def translate(self, text):
        if not text:
            return ''
        url = 'https://api.niutrans.com/NiuTransServer/translation'
        api_key = self.api_config.get('api_key', '')
        if not api_key:
            raise Exception(get_lang('is_required', {'0': 'API Key'}))
        data = {
            'from': self.from_lang,
            'to': self.to_lang,
            'apikey': api_key,
            'src_text': text,
        }

        response = requests.post(url, data=data)
        if response.status_code != 200:
            raise Exception(get_lang('request_error', {'0': 'niutrans'}))
        if not response.text:
            raise Exception(get_lang('response_is_empty', {'0': 'niutrans'}))
        result = response.json()
        if 'error_msg' in result:
            raise Exception(result['error_msg'])
        if 'tgt_text' not in result:
            raise Exception(get_lang('no_response_from', {'0': 'niutrans'}))
        return result['tgt_text']
