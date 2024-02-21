import threading


class ClockTimer(threading.Thread):
    app: object
    remote_listener: str

    def __init__(self, remote_identifer: str, app: object):
        self.remote_listener = remote_identifer
        self.app = app
