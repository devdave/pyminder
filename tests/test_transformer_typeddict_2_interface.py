import typing as t


def test_proof_of_concept() -> None:
    class Thing(t.TypedDict):
        a: int
        b: str
