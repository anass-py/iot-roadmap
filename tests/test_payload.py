from iot.core.validation import payload_valide


def test_valeur_numerique_valide():
    assert payload_valide({"value": 21.4}) is True
    assert payload_valide({"value": 0}) is True
    assert payload_valide({"value": -5}) is True


def test_sans_valeur_invalide():
    assert payload_valide({"unit": "C"}) is False
    assert payload_valide({}) is False


def test_valeur_texte_invalide():
    assert payload_valide({"value": "?"}) is False
    assert payload_valide({"value": "abc"}) is False