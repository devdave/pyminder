from _typeshed import Incomplete
from types import ModuleType
from typing_extensions import TypeAlias
from webview.util import WebViewException as WebViewException

GUIType: TypeAlias
logger: Incomplete
guilib: ModuleType | None
forced_gui_: GUIType | None

def initialize(forced_gui: GUIType | None = None): ...
