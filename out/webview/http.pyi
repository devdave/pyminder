import bottle
from .util import abspath as abspath, is_app as is_app, is_local_url as is_local_url
from _typeshed import Incomplete
from typing import TypeVar
from typing_extensions import TypedDict, Unpack
from wsgiref.simple_server import WSGIRequestHandler, WSGIServer
from wsgiref.types import WSGIApplication as WSGIApplication

WRHT_co = TypeVar('WRHT_co', bound=WSGIRequestHandler, covariant=True)
WST_co = TypeVar('WST_co', bound=WSGIServer, covariant=True)
logger: Incomplete
global_server: Incomplete

class ThreadedAdapter(bottle.ServerAdapter):
    def run(self, handler: WSGIApplication) -> None: ...

class BottleServer:
    root_path: str
    running: bool
    address: Incomplete
    js_callback: Incomplete
    js_api_endpoint: Incomplete
    uid: Incomplete
    def __init__(self) -> None: ...
    @classmethod
    def start_server(cls, urls: list[str], http_port: int | None, keyfile: None = None, certfile: None = None) -> tuple[str, str | None, BottleServer]: ...
    @property
    def is_running(self) -> bool: ...
ServerType = TypeVar('ServerType', bound=BottleServer, covariant=True)

class SSLWSGIRefServer(bottle.ServerAdapter):
    srv: Incomplete
    port: Incomplete
    def run(self, handler: WSGIApplication) -> None: ...

class ServerArgs(TypedDict, total=False):
    keyfile: None
    certfile: None

def start_server(urls: list[str], http_port: int | None = None, server: type[ServerType] = ..., **server_args: Unpack[ServerArgs]) -> tuple[str, str | None, BottleServer]: ...
def start_global_server(http_port: int | None = None, urls: list[str] = ['.'], server: type[ServerType] = ..., **server_args: Unpack[ServerArgs]) -> tuple[str, str | None, BottleServer]: ...
