import sys
import os

# 修复个别电脑环境会报的错
Path = os.path.join(os.path.dirname(__file__), "../")
sys.path.append(Path)

from translator.base_tanslator import BaseTranslator
import uuid
import requests
from get_lang import get_lang


class MyMemoryTranslator(BaseTranslator):
    def __init__(self):
        super().__init__('myMemory_free')

    def translate(self, text):
        if not text:
            return ''
        url = 'https://api.mymemory.translated.net/get'
        api_key = self.api_config.get('api_key', '')
        params = {
            'q': text,
            'langpair': f'{self.from_lang}|{self.to_lang}',
        }
        if api_key:
            params['key'] = api_key

        response = requests.get(url, params=params)
        if response.status_code != 200:
            raise Exception(get_lang('request_error', {'0': 'myMemory'}))
        if not response.text:
            raise Exception(get_lang('response_is_empty', {'0': 'myMemory'}))
        result = response.json()
        if 'responseStatus' not in result:
            raise Exception(get_lang('no_response_from', {'0': 'myMemory'}))
        if result['responseStatus'] != 200:
            raise Exception(result['responseDetails'])
        if 'responseData' not in result:
            raise Exception(get_lang('no_response_from', {'0': 'myMemory'}))
        if 'translatedText' not in result['responseData']:
            raise Exception(get_lang('no_response_from', {'0': 'myMemory'}))
        return result['responseData']['translatedText']
