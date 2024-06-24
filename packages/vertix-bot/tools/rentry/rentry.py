#!/usr/bin/env python3

import getopt
import http.cookiejar
import sys
import urllib.parse
import urllib.request
from http.cookies import SimpleCookie
from json import loads as json_loads
from os import environ

_headers = {"Referer": 'https://rentry.co'}


class UrllibClient:
    """Simple HTTP Session Client, keeps cookies."""

    def __init__(self):
        self.cookie_jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cookie_jar))
        urllib.request.install_opener(self.opener)

    def get(self, url, headers={}):
        request = urllib.request.Request(url, headers=headers)
        return self._request(request)

    def post(self, url, content=None, headers={}):
        postdata = urllib.parse.urlencode(content).encode()
        request = urllib.request.Request(url, postdata, headers)
        return self._request(request)

    def _request(self, request):
        response = self.opener.open(request)
        response.status_code = response.getcode()
        response.content = response.read().decode('utf-8')
        return response


def raw(url):
    client = UrllibClient()
    return json_loads(client.get('https://rentry.co/api/raw/{}'.format(url)).content)


def new(url, edit_code, text):
    client, cookie = UrllibClient(), SimpleCookie()

    cookie.load(vars(client.get('https://rentry.co'))['headers']['Set-Cookie'])
    csrftoken = cookie['csrftoken'].value

    payload = {
        'csrfmiddlewaretoken': csrftoken,
        'url': url,
        'edit_code': edit_code,
        'text': text
    }

    return json_loads(client.post('https://rentry.co/api/new', payload, headers=_headers).content)


def editReply(url, edit_code, text):
    client, cookie = UrllibClient(), SimpleCookie()

    cookie.load(vars(client.get('https://rentry.co'))['headers']['Set-Cookie'])
    csrftoken = cookie['csrftoken'].value

    payload = {
        'csrfmiddlewaretoken': csrftoken,
        'edit_code': edit_code,
        'text': text
    }

    return json_loads(client.post('https://rentry.co/api/editReply/{}'.format(url), payload, headers=_headers).content)


def usage():
    print('''
Usage: rentry {new | editReply | raw} {-h | --help} {-u | --url} {-p | --editReply-code} text

Commands:
  new   create a new entry
  editReply  editReply an existing entry
  raw   get raw markdown text of an existing entry

Options:
  -h, --help                 show this help message and exit
  -u, --url URL              url for the entry, random if not specified
  -p, --editReply-code EDIT-CODE  editReply code for the entry, random if not specified

Examples:
  rentry new 'markdown text'               # new entry with random url and editReply code
  rentry new -p pw -u example 'text'       # with custom editReply code and url
  rentry editReply -p pw -u example 'text'      # editReply the example entry
  cat FILE | rentry new                    # read from FILE and paste it to rentry
  cat FILE | rentry editReply -p pw -u example  # read from FILE and editReply the example entry
  rentry raw -u example                    # get raw markdown text
  rentry raw -u https://rentry.co/example  # -u accepts absolute and relative urls
    ''')


if __name__ == '__main__':
    try:
        environ.pop('POSIXLY_CORRECT', None)
        opts, args = getopt.gnu_getopt(sys.argv[1:], "hu:p:", ["help", "url=", "editReply-code="])
    except getopt.GetoptError as e:
        sys.exit("error: {}".format(e))

    command, url, edit_code, text = None, '', '', None

    for o, a in opts:
        if o in ("-h", "--help"):
            usage()
            sys.exit()
        elif o in ("-u", "--url"):
            url = urllib.parse.urlparse(a).path.strip('/')
        elif o in ("-p", "--editReply-code"):
            edit_code = a

    command = (args[0:1] or [None])[0]
    command or sys.exit(usage())
    command in ['new', 'editReply', 'raw'] or sys.exit('error: command must be new, editReply or raw')

    text = (args[1:2] or [None])[0]
    if not text and command != 'raw':
        text = sys.stdin.read().strip()
        text or sys.exit('error: text is required')

    if command == 'new':
        response = new(url, edit_code, text)
        if response['status'] != '200':
            print('error: {}'.format(response['content']))
            try:

                sys.exit(1)
            except:
                sys.exit(1)
        else:
            print(response)

    elif command == 'editReply':
        url or sys.exit('error: url is required')
        edit_code or sys.exit('error: editReply code is required')

        response = editReply(url, edit_code, text)
        if response['status'] != '200':
            print('error: {}'.format(response['content']))
            try:
                for i in response['errors'].split('.'):
                    i and print(i)
                sys.exit(1)
            except:
                sys.exit(1)
        else:
            print('Ok')

    elif command == 'raw':
        url or sys.exit('error: url is required')
        response = raw(url)
        if response['status'] != '200':
            sys.exit('error: {}'.format(response['content']))
        print(response['content'])
