from abc import ABC
import re
import requests as r
from bs4 import BeautifulSoup as BS
from utils import *

class Parser(ABC):
    def __init__(self, URL: str, headers: dict = None):
        self.URL = URL
        self.headers = headers

        resp = r.get(URL, headers=headers)
        self.soup = BS(resp.content, "html.parser")

    def parse(self) -> list[str]:
        pass


class OrthoepyParser(Parser):
    def __init__(self, URL, headers = None):
        super().__init__(URL, headers)

    def parse(self):
        result = []
        text_div = self.soup.find(id="text_div").p

        for span in text_div.find_all("span"):
            brs = span.find_all("br")
            for br in brs:
                text = br.next_sibling
                if text:
                    text = re.split(r"[\s,-]+", text.strip(), maxsplit=1)[0]
                    if accent_index(text) != -1:
                        result.append(text)
        
        return result
        

class VocabularyParser(Parser):
    def __init__(self, URL, headers = None):
        super().__init__(URL, headers)

    def parse(self):
        result = []
        raw_words = self.soup.find_all(class_="list_aut")
        for i in raw_words:
            result.append(make_gap(i.text.lower()))
        return result


orthoepy_url = "http://rataiko.school139.edusite.ru/p28aa1.html"
orthoepy_headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/131.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
        "Connection": "close",
    }

vocabulary_url = "https://slova.textologia.ru/class/11/?q=659&cl=11"
vocabulary_headers = {}


orthoepy_parser = OrthoepyParser(orthoepy_url, orthoepy_headers)
vocabulary_parser = VocabularyParser(vocabulary_url, vocabulary_headers)

if __name__ == "__main__":
    
    
    # print(orthoepy_parser.parse())
    print(vocabulary_parser.parse())