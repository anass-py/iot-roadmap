def payload_valide(data):
    value = data.get("value")
    return isinstance(value, (int, float))