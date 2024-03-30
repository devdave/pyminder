from inspect import getfullargspec
import logging
import typing as T


class BraceMessage(object):
    def __init__(self, fmt, args, kwargs):
        self.fmt = fmt
        self.args = args
        self.kwargs = kwargs

    def __str__(self):
        if self.kwargs and self.args:
            return str(self.fmt).format(*self.args, **self.kwargs)
        elif self.kwargs:
            return str(self.fmt).format(**self.kwargs)
        else:
            return str(self.fmt)


class StyleAdapter(logging.LoggerAdapter):
    def __init__(self, logger: logging.Logger):
        self.logger = logger

    def log(
        self,
        level: int,
        msg: object,
        *args,
        **kwargs,
    ) -> None:
        if self.isEnabledFor(level):
            msg, log_kwargs = self.process(msg, kwargs)
            # Note the `stacklevel` keyword argument so that funcName and lineno are rendered correctly.
            # noinspection PyProtectedMember
            self.logger._log(
                level, BraceMessage(msg, args, kwargs), (), stacklevel=2, **log_kwargs
            )

    def process(
        self, msg: T.Any, kwargs: T.MutableMapping[str, T.Any]
    ) -> tuple[T.Any, T.MutableMapping[str, T.Any]]:
        # noinspection PyProtectedMember
        mapped = {
            key: kwargs[key]
            for key in getfullargspec(self.logger._log).args[1:]
            if key in kwargs
        }
        return msg, mapped

    def addHandler(self, handler):
        self.logger.addHandler(handler)


def getLogger(namespace):
    return StyleAdapter(logging.getLogger(namespace))
